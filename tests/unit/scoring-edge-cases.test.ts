import { describe, it, expect } from 'vitest';
import { calculatePoints, POINTS } from '../../apps/api/src/services/scoring';

describe('calculatePoints — edge cases', () => {
  it('0-0 prediction vs 0-0 result is exact match', () => {
    const result = calculatePoints(
      { predictedHome: 0, predictedAway: 0, boostActive: false },
      { home: 0, away: 0 }
    );
    expect(result.estrelas).toBe(POINTS.EXACT_SCORE);
    expect(result.type).toBe('exact');
  });

  it('1-0 prediction vs 2-0 result is correct result (home win)', () => {
    const result = calculatePoints(
      { predictedHome: 1, predictedAway: 0, boostActive: false },
      { home: 2, away: 0 }
    );
    expect(result.estrelas).toBe(POINTS.CORRECT_RESULT);
    expect(result.type).toBe('result');
  });

  it('3-2 prediction vs 5-4 result is correct result (home win)', () => {
    const result = calculatePoints(
      { predictedHome: 3, predictedAway: 2, boostActive: false },
      { home: 5, away: 4 }
    );
    expect(result.estrelas).toBe(POINTS.CORRECT_RESULT);
    expect(result.type).toBe('result');
  });

  it('0-1 prediction vs 0-3 result is correct result (away win)', () => {
    const result = calculatePoints(
      { predictedHome: 0, predictedAway: 1, boostActive: false },
      { home: 0, away: 3 }
    );
    expect(result.estrelas).toBe(POINTS.CORRECT_RESULT);
    expect(result.type).toBe('result');
  });

  it('2-0 prediction vs 0-2 result is wrong (reversed outcome)', () => {
    const result = calculatePoints(
      { predictedHome: 2, predictedAway: 0, boostActive: false },
      { home: 0, away: 2 }
    );
    expect(result.estrelas).toBe(0);
    expect(result.type).toBe('wrong');
  });

  it('1-1 prediction vs 2-2 result is correct result (draw)', () => {
    const result = calculatePoints(
      { predictedHome: 1, predictedAway: 1, boostActive: false },
      { home: 2, away: 2 }
    );
    expect(result.estrelas).toBe(POINTS.CORRECT_RESULT);
    expect(result.type).toBe('result');
  });

  it('boost on correct result doubles to 100', () => {
    const result = calculatePoints(
      { predictedHome: 3, predictedAway: 0, boostActive: true },
      { home: 1, away: 0 }
    );
    expect(result.estrelas).toBe(POINTS.CORRECT_RESULT * POINTS.BOOST_MULTIPLIER);
    expect(result.type).toBe('result');
  });

  it('boost on exact score doubles to 200', () => {
    const result = calculatePoints(
      { predictedHome: 1, predictedAway: 0, boostActive: true },
      { home: 1, away: 0 }
    );
    expect(result.estrelas).toBe(POINTS.EXACT_SCORE * POINTS.BOOST_MULTIPLIER);
    expect(result.type).toBe('exact');
  });

  it('draw prediction vs home win is wrong', () => {
    const result = calculatePoints(
      { predictedHome: 1, predictedAway: 1, boostActive: false },
      { home: 2, away: 1 }
    );
    expect(result.estrelas).toBe(0);
    expect(result.type).toBe('wrong');
  });

  it('home win prediction vs draw is wrong', () => {
    const result = calculatePoints(
      { predictedHome: 2, predictedAway: 1, boostActive: false },
      { home: 1, away: 1 }
    );
    expect(result.estrelas).toBe(0);
    expect(result.type).toBe('wrong');
  });
});

describe('POINTS constants', () => {
  it('has correct values', () => {
    expect(POINTS.EXACT_SCORE).toBe(100);
    expect(POINTS.CORRECT_RESULT).toBe(50);
    expect(POINTS.STREAK_BONUS).toBe(20);
    expect(POINTS.BOOST_MULTIPLIER).toBe(2);
  });
});
