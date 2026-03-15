export const POINTS = {
  EXACT_SCORE: 100,
  CORRECT_RESULT: 50,
  STREAK_BONUS: 20,
  BOOST_MULTIPLIER: 2,
} as const;

export function calculatePoints(
  prediction: { predictedHome: number; predictedAway: number; boostActive: boolean },
  result: { home: number; away: number }
): { estrelas: number; type: 'exact' | 'result' | 'wrong' } {
  const isExact =
    prediction.predictedHome === result.home &&
    prediction.predictedAway === result.away;

  const predictedOutcome = Math.sign(prediction.predictedHome - prediction.predictedAway);
  const actualOutcome = Math.sign(result.home - result.away);
  const isCorrectResult = predictedOutcome === actualOutcome;

  let estrelas = 0;
  let type: 'exact' | 'result' | 'wrong' = 'wrong';

  if (isExact) {
    estrelas = POINTS.EXACT_SCORE;
    type = 'exact';
  } else if (isCorrectResult) {
    estrelas = POINTS.CORRECT_RESULT;
    type = 'result';
  }

  if (prediction.boostActive && estrelas > 0) {
    estrelas *= POINTS.BOOST_MULTIPLIER;
  }

  return { estrelas, type };
}
