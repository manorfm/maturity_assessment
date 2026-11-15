import type { DecisionChoiceInput } from './decision-client.js';

export type LayaSystemOneClientOptions = {
  baseUrl: string;
  timeoutMs?: number;
};

export class LayaSystemOneClient {
  readonly baseUrl: string;
  readonly timeoutMs: number;

  constructor(options: LayaSystemOneClientOptions) {
    if (!options.baseUrl) throw new Error('baseUrl required');
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs ?? 5000;
  }

  async chooseAsync(input: DecisionChoiceInput): Promise<string | null> {
    const criteria: Record<string, string> = {};
    for (const option of input.options) {
      criteria[option.id] = option.label;
    }
    const body = {
      state: input.state,
      questions: {
        pick: {
          type: 'choice' as const,
          instructions: input.instructions ?? 'Pick the option that best fits the persona state.',
          criteria,
        },
      },
    };

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      let response: Response;
      try {
        response = await fetch(`${this.baseUrl}/v1/systemone`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      if (!response.ok) return null;

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        return null;
      }

      const choice = readPickChoice(payload);
      if (choice === null) return null;
      return input.options.some((option) => option.id === choice) ? choice : null;
    } catch {
      return null;
    }
  }
}

function readPickChoice(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const answers = (payload as { answers?: unknown }).answers;
  if (!answers || typeof answers !== 'object') return null;
  const pick = (answers as { pick?: unknown }).pick;
  if (!pick || typeof pick !== 'object') return null;
  const choice = (pick as { choice?: unknown }).choice;
  return typeof choice === 'string' ? choice : null;
}
