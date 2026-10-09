export type IndexReading = {
  id: string;
  label: string;
  index: number;
  band: [number, number];
};

export type ReadingChange = 'improved' | 'regressed' | 'uncertain';

export function compareReadings(previous: IndexReading, current: IndexReading): ReadingChange {
  const previousHigh = previous.band[1];
  const previousLow = previous.band[0];
  const currentLow = current.band[0];
  const currentHigh = current.band[1];
  if (currentLow > previousHigh) return 'improved';
  if (currentHigh < previousLow) return 'regressed';
  return 'uncertain';
}
