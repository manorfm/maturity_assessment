export type LabeledPrediction = { confidence: number; outcome: 0 | 1 };
export type CalibrationBin = { from: number; to: number; count: number; meanConfidence: number; observedRate: number; error: number };
export type CalibrationReport = { sampleSize: number; brierScore: number; expectedCalibrationError: number; precision: number | null; recall: number | null; bins: CalibrationBin[] };

export class CalibrationMetrics {
  static evaluate(predictions: LabeledPrediction[], threshold = .7, binCount = 10): CalibrationReport {
    if (!Number.isInteger(binCount) || binCount < 2) throw new Error('Calibration requires at least two bins');
    for (const item of predictions) if (!Number.isFinite(item.confidence) || item.confidence < 0 || item.confidence > 1) throw new Error('Confidence must be between zero and one');
    if (!predictions.length) return { sampleSize: 0, brierScore: 0, expectedCalibrationError: 0, precision: null, recall: null, bins: [] };
    const brierScore = mean(predictions.map((item) => (item.confidence - item.outcome) ** 2));
    const bins = Array.from({ length: binCount }, (_, index) => {
      const from = index / binCount;
      const to = (index + 1) / binCount;
      const values = predictions.filter((item) => item.confidence >= from && (index === binCount - 1 ? item.confidence <= to : item.confidence < to));
      const meanConfidence = values.length ? mean(values.map((item) => item.confidence)) : 0;
      const observedRate = values.length ? mean(values.map((item) => item.outcome)) : 0;
      return { from, to, count: values.length, meanConfidence, observedRate, error: values.length ? Math.abs(meanConfidence - observedRate) : 0 };
    }).filter((bin) => bin.count > 0);
    const expectedCalibrationError = bins.reduce((sum, bin) => sum + bin.error * bin.count / predictions.length, 0);
    const truePositive = predictions.filter((item) => item.confidence >= threshold && item.outcome === 1).length;
    const falsePositive = predictions.filter((item) => item.confidence >= threshold && item.outcome === 0).length;
    const falseNegative = predictions.filter((item) => item.confidence < threshold && item.outcome === 1).length;
    return {
      sampleSize: predictions.length, brierScore, expectedCalibrationError,
      precision: truePositive + falsePositive ? truePositive / (truePositive + falsePositive) : null,
      recall: truePositive + falseNegative ? truePositive / (truePositive + falseNegative) : null,
      bins,
    };
  }
}
function mean(values: number[]): number { return values.reduce((sum, value) => sum + value, 0) / values.length; }
