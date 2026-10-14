export type BatchLotStatus = 'issued' | 'partially_used' | 'claimed' | 'revoked' | 'expired';

const statusLabels: Record<BatchLotStatus, string> = {
  issued: 'Emitido',
  partially_used: 'Em uso',
  claimed: 'Concluído',
  revoked: 'Revogado',
  expired: 'Expirado',
};

export function projectBatchReading(input: {
  status: BatchLotStatus;
  quantity: number;
  claimed: number;
  completed: number;
  minimum: number;
}): { statusLabel: string; sample: string; remind: string } {
  const sample = input.completed < input.minimum
    ? `Menos de ${input.minimum}: agregado ao nível acima. ${input.claimed} de ${input.quantity} já abriram o convite.`
    : `${input.completed} pessoas concluíram. O recorte publica. ${input.claimed} de ${input.quantity} já abriram o convite.`;
  return {
    statusLabel: statusLabels[input.status],
    sample,
    remind: 'Se você já respondeu, obrigado. O lembrete vale para o lote inteiro e o resultado não avalia pessoa. O produto não envia a mensagem.',
  };
}
