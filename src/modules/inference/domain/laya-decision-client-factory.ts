import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import type { DecisionClient, DecisionChoiceInput } from './decision-client.js';
import { isAllowedLayaBaseUrl } from './laya-base-url.js';

export type CreateLayaDecisionClientOptions = {
  baseUrl: string;
  timeoutMs?: number;
};

const PUMP_SOURCE = `
#include <node.h>
#include <node_api.h>
#include <uv.h>
#include <v8.h>

static napi_value Run(napi_env env, napi_callback_info /*info*/) {
  uv_run(node::GetCurrentEventLoop(v8::Isolate::GetCurrent()), UV_RUN_NOWAIT);
  napi_value undefined;
  napi_get_undefined(env, &undefined);
  return undefined;
}

static napi_value Init(napi_env env, napi_value exports) {
  napi_value fn;
  napi_create_function(env, nullptr, 0, Run, nullptr, &fn);
  napi_set_named_property(env, exports, "run", fn);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
`;

type PumpBinding = { run: () => void };

let cachedPump: PumpBinding | null | undefined;

function loadPumpBinding(): PumpBinding | null {
  if (cachedPump !== undefined) return cachedPump;

  const modulesVersion = process.versions.modules;
  const cacheDir = path.join(tmpdir(), 'maturity-assessment-laya-pump');
  const addonPath = path.join(
    cacheDir,
    `uv-pump-${process.platform}-${process.arch}-modules${modulesVersion}.node`,
  );

  try {
    if (!existsSync(addonPath)) {
      mkdirSync(cacheDir, { recursive: true });
      const srcPath = path.join(cacheDir, 'uv-pump.cc');
      writeFileSync(srcPath, PUMP_SOURCE);
      const includeDir = path.join(path.dirname(process.execPath), '..', 'include', 'node');
      if (!existsSync(path.join(includeDir, 'node_api.h'))) {
        cachedPump = null;
        return null;
      }
      const compile =
        process.platform === 'darwin'
          ? spawnSync(
              'c++',
              [
                '-bundle',
                '-o',
                addonPath,
                srcPath,
                `-I${includeDir}`,
                '-undefined',
                'dynamic_lookup',
                '-std=c++20',
              ],
              { encoding: 'utf8' },
            )
          : spawnSync(
              'c++',
              ['-shared', '-fPIC', '-o', addonPath, srcPath, `-I${includeDir}`, '-std=c++20'],
              { encoding: 'utf8' },
            );
      if (compile.status !== 0 || !existsSync(addonPath)) {
        cachedPump = null;
        return null;
      }
    }
    const binding: { exports: PumpBinding } = { exports: { run: () => undefined } };
    process.dlopen(binding, addonPath);
    cachedPump = binding.exports;
    return cachedPump;
  } catch {
    cachedPump = null;
    return null;
  }
}

function pumpEventLoopOnce(pump: PumpBinding | null): void {
  (process as NodeJS.Process & { _tickCallback?: () => void })._tickCallback?.();
  pump?.run();
}

function clientModuleUrl(): string {
  const tsPath = fileURLToPath(new URL('./laya-system-one-client.ts', import.meta.url));
  if (existsSync(tsPath)) return pathToFileURL(tsPath).href;
  return new URL('./laya-system-one-client.js', import.meta.url).href;
}

/** Workers reject most process.execArgv flags; keep only loader imports. */
function workerExecArgv(): string[] {
  const args: string[] = [];
  for (let index = 0; index < process.execArgv.length; index += 1) {
    const arg = process.execArgv[index]!;
    if (arg === '--import' || arg === '--require' || arg === '-r') {
      args.push(arg);
      const next = process.execArgv[index + 1];
      if (next && !next.startsWith('-')) {
        args.push(next);
        index += 1;
      }
      continue;
    }
    if (arg.startsWith('--import=') || arg.startsWith('--require=')) {
      args.push(arg);
    }
  }
  return args;
}

function chooseBlocking(
  baseUrl: string,
  timeoutMs: number,
  input: DecisionChoiceInput,
): string | null {
  const RESULT_CAP = 4096;
  const sab = new SharedArrayBuffer(8 + RESULT_CAP);
  const meta = new Int32Array(sab, 0, 2);
  const bytes = new Uint8Array(sab, 8);
  const pump = loadPumpBinding();

  const workerSource = `
import { workerData } from 'node:worker_threads';
import { LayaSystemOneClient } from ${JSON.stringify(clientModuleUrl())};

const sab = workerData.sab;
const meta = new Int32Array(sab, 0, 2);
const bytes = new Uint8Array(sab, 8);

try {
  const client = new LayaSystemOneClient({
    baseUrl: workerData.baseUrl,
    timeoutMs: workerData.timeoutMs,
  });
  const result = await client.chooseAsync(workerData.input);
  if (result === null) {
    Atomics.store(meta, 1, -1);
  } else {
    const enc = Buffer.from(result, 'utf8');
    bytes.set(enc.subarray(0, bytes.length));
    Atomics.store(meta, 1, Math.min(enc.length, bytes.length));
  }
} catch {
  Atomics.store(meta, 1, -1);
}
Atomics.store(meta, 0, 1);
Atomics.notify(meta, 0);
`;

  const worker = new Worker(workerSource, {
    eval: true,
    execArgv: workerExecArgv(),
    workerData: { sab, baseUrl, timeoutMs, input },
    // ESM eval worker (supported at runtime; typings lag behind).
    ...({ type: 'module' } as object),
  });

  let workerError: Error | undefined;
  worker.on('error', (error) => {
    workerError = error;
    Atomics.store(meta, 1, -1);
    Atomics.store(meta, 0, 1);
    Atomics.notify(meta, 0);
  });

  const deadline = Date.now() + Math.max(timeoutMs, 1000) + 1000;
  while (Atomics.load(meta, 0) === 0 && Date.now() < deadline) {
    // Pump so an in-process mock HTTP server on this thread can answer the worker.
    pumpEventLoopOnce(pump);
    if (Atomics.load(meta, 0) === 0) {
      // Park briefly; wake early when the worker notifies.
      Atomics.wait(meta, 0, 0, pump ? 1 : 50);
    }
  }

  void worker.terminate();

  if (workerError) return null;
  if (Atomics.load(meta, 0) === 0) return null;

  const length = Atomics.load(meta, 1);
  if (length < 0) return null;
  return Buffer.from(bytes.subarray(0, length)).toString('utf8');
}

/** Sync DecisionClient factory over LayaSystemOneClient.chooseAsync. */
export function createLayaDecisionClient(
  options: CreateLayaDecisionClientOptions,
): DecisionClient | null {
  if (!isAllowedLayaBaseUrl(options.baseUrl)) return null;

  const baseUrl = options.baseUrl;
  const timeoutMs = options.timeoutMs ?? 5000;

  return {
    choose(input: DecisionChoiceInput): string | null {
      return chooseBlocking(baseUrl, timeoutMs, input);
    },
  };
}
