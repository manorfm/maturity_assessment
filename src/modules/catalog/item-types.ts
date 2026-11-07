import type { AnchorStage } from './evidence-contract.js';

/** Tipos de item do instrumento (07 §2). */
export type ItemKind =
  | 'event-reconstruction'
  | 'forced-choice'
  | 'vignette'
  | 'literacy'
  | 'group-referent'
  | 'list-technique'
  | 'free-text'
  | 'pulse';

export type LiteracyVerdict = 'correct' | 'incorrect' | 'literacy-absent';

export type ItemReading = {
  id: string;
  label: string;
  verdict: LiteracyVerdict;
};

export type CatalogItemBase = {
  id: string;
  kind: ItemKind;
  title: string;
  scenario: string;
  prompt: string;
  leafId?: string;
};

export type VignetteItem = CatalogItemBase & {
  kind: 'vignette';
  /** Estágio conhecido pela autoria (05 §4.1). */
  authorAnchor: AnchorStage;
  options: Array<{ id: string; label: string; anchor: AnchorStage }>;
};

/** Série semanal sintética do estímulo de leitura (não é medida da unidade). */
export type LiteracyStimulusSeries = {
  stages: readonly string[];
  values: Readonly<Record<string, readonly number[]>>;
};

export type LiteracyItem = CatalogItemBase & {
  kind: 'literacy';
  stimulus: string;
  readings: ItemReading[];
  /** Etapas e valores semanais alinhados à frase do estímulo. */
  series?: LiteracyStimulusSeries;
};

export type GroupReferentItem = CatalogItemBase & {
  kind: 'group-referent';
  options: Array<{ id: string; label: string; anchor: AnchorStage }>;
};

export type ListTechniqueItem = CatalogItemBase & {
  kind: 'list-technique';
  neutralStatements: string[];
  sensitiveStatement: string;
  minimumSample: number;
};

export type FreeTextItem = CatalogItemBase & {
  kind: 'free-text';
  maxChars: number;
  codebookVersion: string;
};

/** Item-âncora de pulso (08 §7): reaplicação curta nas folhas tratadas. */
export type PulseItem = CatalogItemBase & {
  kind: 'pulse';
  leafId: string;
  options: Array<{ id: string; label: string; anchor: AnchorStage }>;
  intervalWeeks: { min: number; max: number };
};

export type CatalogItem = VignetteItem | LiteracyItem | GroupReferentItem | ListTechniqueItem | FreeTextItem | PulseItem;
