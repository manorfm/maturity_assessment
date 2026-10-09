export type EnablementEdge = {
  from: string;
  to: string;
  probability: number;
  unlocks: string;
};

export type FrontierNode = {
  id: string;
  blockedBy: string[];
  learnable: boolean;
};

export function learningFrontier(nodes: string[], edges: EnablementEdge[]): FrontierNode[] {
  return nodes.map((id) => {
    const incoming = edges.filter((edge) => edge.to === id);
    const blockedBy = incoming.filter((edge) => edge.probability < 0.25).map((edge) => edge.from);
    const learnable = incoming.length === 0 || incoming.every((edge) => edge.probability >= 0.25);
    return { id, blockedBy, learnable };
  });
}
