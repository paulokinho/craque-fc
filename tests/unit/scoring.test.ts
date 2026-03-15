import { describe, it, expect } from 'vitest';
import { calculatePoints, POINTS } from '../../apps/api/src/services/scoring';

describe('calculatePoints', () => {
  it('awards EXACT_SCORE for exact prediction', () => {
    const result = calculatePoints(
      { predictedHome: 2, predictedAway: 1, boostActive: false },
      { home: 2, away: 1 }
    );
    expect(result.estrelas).toBe(POINTS.EXACT_SCORE);
    expect(result.type).toBe('exact');
  });

  it('awards CORRECT_RESULT for correct outcome (not exact score)', () => {
    const result = calculatePoints(
      { predictedHome: 3, predictedAway: 0, boostActive: false },
      { home: 2, away: 1 }
    );
    expect(result.estrelas).toBe(POINTS.CORRECT_RESULT);
    expect(result.type).toBe('result');
  });

  it('awards 0 for wrong prediction', () => {
    const result = calculatePoints(
      { predictedHome: 0, predictedAway: 2, boostActive: false },
      { home: 2, away: 0 }
    );
    expect(result.estrelas).toBe(0);
    expect(result.type).toBe('wrong');
  });

  it('doubles estrelas when boost is active on correct prediction', () => {
    const result = calculatePoints(
      { predictedHome: 2, predictedAway: 1, boostActive: true },
      { home: 2, away: 1 }
    );
    expect(result.estrelas).toBe(POINTS.EXACT_SCORE * POINTS.BOOST_MULTIPLIER);
  });

  it('does not double estrelas when boost active but prediction wrong', () => {
    const result = calculatePoints(
      { predictedHome: 0, predictedAway: 3, boostActive: true },
      { home: 2, away: 0 }
    );
    expect(result.estrelas).toBe(0);
  });

  it('correctly scores draws', () => {
    const result = calculatePoints(
      { predictedHome: 1, predictedAway: 1, boostActive: false },
      { home: 0, away: 0 }
    );
    expect(result.estrelas).toBe(POINTS.CORRECT_RESULT);
    expect(result.type).toBe('result');
  });
});
