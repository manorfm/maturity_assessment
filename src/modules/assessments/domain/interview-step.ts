import { freeTextStrategy } from '../../catalog/item-catalog.js';

export type InterviewStepKind = 'perspective' | 'context' | 'event' | 'example' | 'pressure' | 'reading' | 'vignette' | 'list';

export type InterviewStep = {
  kind: InterviewStepKind;
  kicker: string;
  why: string;
  maxChars?: number;
};

export type InterviewWelcome = {
  title: string;
  purpose: string;
  cases: string;
  anonymity: string;
  pause: string;
  duration: string;
  start: string;
};

const whyByKind: Record<InterviewStepKind, string> = {
  perspective: 'Isto só adapta as perguntas; não gera pontuação.',
  context: 'Isto só adapta as perguntas; não gera pontuação.',
  event: 'Não precisa ser a mais grave. Vale a mais recente de que você se lembra bem.',
  example: 'Não escreva nomes de pessoas, times ou clientes. O texto é lido só de forma agregada. Trechos com nomes são descartados.',
  pressure: 'Pense no caso mais recente, mesmo que não tenha sido o mais grave.',
  reading: 'O quadro é um estímulo. Não é o quadro do seu time.',
  vignette: 'Esta situação é hipotética. Ela não descreve o seu time e não gera nota de capacidade.',
  list: 'A contagem entra só no agregado. Ela não identifica você.',
};

const kickerByKind: Record<InterviewStepKind, string> = {
  perspective: 'Sobre você',
  context: 'Sobre você',
  event: 'O que aconteceu',
  example: 'Opcional',
  pressure: 'Aprofundamento',
  reading: 'Leitura',
  vignette: 'Situação',
  list: 'Contagem',
};

export function projectInterviewWelcome(minutes: number): InterviewWelcome {
  const safe = Math.max(1, Math.round(minutes));
  const unit = safe === 1 ? 'minuto' : 'minutos';
  return {
    title: 'Como o trabalho acontece de verdade por aqui',
    purpose: 'Este questionário ajuda a entender como a área de tecnologia funciona no dia a dia. O resultado descreve o sistema de trabalho, não pessoas.',
    cases: 'Em vez de opiniões gerais, vamos pedir que você pense em casos reais e recentes.',
    anonymity: 'Suas respostas são anônimas. Ninguém da sua empresa vê o que você escreveu. Resultados só aparecem com 5 ou mais pessoas.',
    pause: 'Você pode pausar e voltar pelo mesmo link.',
    duration: `Cerca de ${safe} ${unit}.`,
    start: 'Começar',
  };
}

export function projectInterviewStep(node: { id: string; type?: string }): InterviewStep {
  const kind = kindFor(node);
  const step: InterviewStep = { kind, kicker: kickerByKind[kind], why: whyByKind[kind] };
  if (kind === 'example') step.maxChars = freeTextStrategy.maxChars;
  return step;
}

function kindFor(node: { id: string; type?: string }): InterviewStepKind {
  if (node.id === 'respondent-context') return 'perspective';
  if (node.id === 'work-context' || node.type === 'context') return 'context';
  if (node.id.startsWith('free-text-')) return 'example';
  if (node.id.startsWith('literacy-')) return 'reading';
  if (node.id.startsWith('vignette-')) return 'vignette';
  if (node.id.startsWith('list-')) return 'list';
  if (node.type === 'probe') return 'pressure';
  return 'event';
}
