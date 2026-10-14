import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectDiagnosticLaudo } from '../src/modules/inference/domain/diagnostic-report.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';
import { renderLaudo } from '../src/modules/projects/diagnostic-report-view.js';

const finding = (pattern: string, title: string): OutcomeFinding => ({
  kind: 'correction',
  pattern,
  detailCapability: 'work-management',
  title,
  cause: 'Mudanças prontas esperam aprovação.',
  intervention: 'Aprovar por risco.',
  confidence: 0.91,
  priority: 0.8,
  missingEvidence: 'Não sabemos se a espera vem da política ou dos testes.',
  experiment: {
    action: 'Aprovação por exceção em dois times.',
    owner: 'Gestão de Engenharia, com Segurança',
    metric: 'tempo até produção',
    reviewHorizon: '30 dias',
    successCriterion: 'Tempo de pronto até produção abaixo de 3 dias.',
  },
  affectedCapabilities: ['work-management', 'release-feedback'],
});

const outcome = {
  kind: 'correct' as const,
  kindLabel: 'Precisa de correção',
  limiterLabel: 'Aprovação de mudança',
  reading: 'O trabalho fica pronto, mas espera.',
  nextStepTitle: '',
  nextStepBody: '',
  finding: finding('aprovacao', 'Mudanças prontas esperam aprovação de várias pessoas.'),
};

function voicedLaudo() {
  return projectDiagnosticLaudo({
    outcome,
    findings: [finding('aprovacao', 'Mudanças prontas esperam aprovação de várias pessoas.')],
    organizationalAreas: OrganizationalAreaProjector.empty(),
    context: 'Pagamentos · 2 unidades',
    perspectiveGaps: [{
      title: 'Fluxo de entrega',
      strongerProfiles: ['Gestão'],
      constrainedProfiles: ['Engenharia'],
    }],
    complaint: { quote: 'Entregamos devagar e não sabemos por quê.', author: 'CTO, na abertura do projeto' },
  });
}

test('laudo sem índice ainda se lê como laudo e o motivo vira citação quando existe', () => {
  const html = renderLaudo(voicedLaudo(), { capabilityBase: '/c', reportBase: '/r' });
  assert.match(html, /Laudo · primeira página/);
  assert.match(html, /Este diagnóstico descreve o sistema de trabalho\. Não use para avaliar pessoas nem como meta de bônus\./);
  assert.match(html, /Pagamentos · 2 unidades/);
  assert.match(html, /Amostra ainda não publicada/);
  assert.match(html, /<blockquote class="report-quote">[\s\S]*Entregamos devagar e não sabemos por quê\.[\s\S]*CTO, na abertura do projeto/);
  assert.match(html, /O trabalho fica pronto, mas espera\./);
  assert.match(html, /ainda não publica índice/);
  assert.match(html, /melhorar outras capacidades antes dela tende a aumentar a fila/);
  assert.match(html, /class="report-finding"/);
  assert.match(html, /Ver ficha →/);
  assert.match(html, /1 área afetada/);
  assert.match(html, /Sustentação forte/);
  assert.match(html, /Gestão descreve um sistema mais folgado/);
  assert.match(html, /Engenharia descreve a restrição/);
  assert.match(html, /Não mostra quem está certo/);
  assert.match(html, /Experimento/);
  assert.match(html, /Dono provável/);
  assert.match(html, /Critério de sucesso/);
  assert.match(html, /O que este caminho não resolve/);
  assert.match(html, /não é uma promessa/);
  assert.match(html, /<h3>Lacunas<\/h3>/);
  assert.match(html, /<h3>Exames complementares sugeridos<\/h3>/);
  assert.match(html, /Nenhum exame complementar foi sugerido/);
  const lacunas = html.indexOf('<h3>Lacunas</h3>');
  const exames = html.indexOf('<h3>Exames complementares sugeridos</h3>');
  assert.ok(lacunas >= 0 && exames > lacunas);
  assert.match(html, /Aviso de uso\. Este diagnóstico descreve o sistema de trabalho/);
  assert.match(html, /Amostra desta leitura/);
  assert.match(html, /Instrumento vigente/);
});

test('sem queixa registrada o motivo permanece lacuna e não vira citação vazia', () => {
  const laudo = projectDiagnosticLaudo({
    outcome: {
      kind: outcome.kind,
      kindLabel: outcome.kindLabel,
      limiterLabel: outcome.limiterLabel,
      reading: '',
      nextStepTitle: outcome.nextStepTitle,
      nextStepBody: outcome.nextStepBody,
    },
    findings: [],
    organizationalAreas: OrganizationalAreaProjector.empty(),
  });
  const html = renderLaudo(laudo, { capabilityBase: '/c', reportBase: '/r' });
  assert.match(html, /ainda não registrou o motivo/);
  assert.doesNotMatch(html, /<blockquote/);
  assert.match(html, /O contexto do projeto ainda não foi registrado/);
  assert.match(html, /Ainda não há uma frase de mecanismo publicada/);
  assert.match(html, /não é uma promessa/);
});
