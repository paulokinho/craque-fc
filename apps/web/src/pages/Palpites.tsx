import { useEffect, useState } from 'react';
import { Star, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MatchData {
  id: string;
  round: string;
  stage: string;
  kickoffAt: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  featured: boolean;
  homeTeam: { id: string; name: string; shortName: string } | null;
  awayTeam: { id: string; name: string; shortName: string } | null;
  competition: { id: string; name: string; slug: string } | null;
}

function MatchCard({ match }: { match: MatchData }) {
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const kickoff = new Date(match.kickoffAt);
  const kickoffLabel = formatDistanceToNow(kickoff, { addSuffix: true, locale: ptBR });

  const handleSubmit = async () => {
    if (homeScore === '' || awayScore === '') return;
    try {
      await api.predictions.submit({
        matchId: match.id,
        predictedHomeScore: parseInt(homeScore),
        predictedAwayScore: parseInt(awayScore),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div data-testid="match-card" className="bg-pitch-card rounded-xl p-4 border border-gold/10">
      {match.competition && (
        <span className="text-xs text-muted bg-pitch-light px-2 py-0.5 rounded-full">
          {match.competition.name}
        </span>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex-1 text-center">
          <div className="w-10 h-10 rounded-full bg-azul/20 flex items-center justify-center mx-auto text-sm font-bold">
            {match.homeTeam?.shortName || '???'}
          </div>
          <p className="text-sm mt-1 font-medium">{match.homeTeam?.name || 'TBD'}</p>
        </div>

        <div className="px-4 text-center">
          <p className="text-xs text-muted">{kickoffLabel}</p>
          <p className="text-lg font-bold text-gold">VS</p>
          <p className="text-xs text-muted">{format(kickoff, 'HH:mm')}</p>
        </div>

        <div className="flex-1 text-center">
          <div className="w-10 h-10 rounded-full bg-verde/20 flex items-center justify-center mx-auto text-sm font-bold">
            {match.awayTeam?.shortName || '???'}
          </div>
          <p className="text-sm mt-1 font-medium">{match.awayTeam?.name || 'TBD'}</p>
        </div>
      </div>

      {!submitted && !selectedOutcome && (
        <div className="flex gap-2 mt-4">
          <button
            data-testid="btn-home-win"
            onClick={() => setSelectedOutcome('home')}
            className="flex-1 py-2 text-xs font-medium bg-pitch-light border border-gold/20 rounded-lg hover:border-gold transition"
          >
            {match.homeTeam?.shortName || 'Casa'}
          </button>
          <button
            data-testid="btn-draw"
            onClick={() => setSelectedOutcome('draw')}
            className="flex-1 py-2 text-xs font-medium bg-pitch-light border border-gold/20 rounded-lg hover:border-gold transition"
          >
            Empate
          </button>
          <button
            data-testid="btn-away-win"
            onClick={() => setSelectedOutcome('away')}
            className="flex-1 py-2 text-xs font-medium bg-pitch-light border border-gold/20 rounded-lg hover:border-gold transition"
          >
            {match.awayTeam?.shortName || 'Fora'}
          </button>
        </div>
      )}

      {!submitted && selectedOutcome && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-4 justify-center">
            <div className="text-center">
              <label className="text-xs text-muted block mb-1">{match.homeTeam?.shortName}</label>
              <input
                data-testid="score-home"
                type="number"
                min="0"
                max="20"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="w-16 h-12 text-center text-xl font-bold bg-pitch-light border border-gold/30 rounded-lg text-white focus:outline-none focus:border-gold"
              />
            </div>
            <span className="text-gold font-bold text-xl mt-4">x</span>
            <div className="text-center">
              <label className="text-xs text-muted block mb-1">{match.awayTeam?.shortName}</label>
              <input
                data-testid="score-away"
                type="number"
                min="0"
                max="20"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="w-16 h-12 text-center text-xl font-bold bg-pitch-light border border-gold/30 rounded-lg text-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>
          <button
            data-testid="submit-prediction"
            onClick={handleSubmit}
            className="w-full py-2 bg-gold text-pitch font-bold rounded-lg hover:bg-gold-dark transition"
          >
            Confirmar Palpite
          </button>
        </div>
      )}

      {submitted && (
        <div className="mt-4 text-center text-verde font-medium text-sm">
          Palpite registrado: {homeScore} x {awayScore}
        </div>
      )}
    </div>
  );
}

export function Palpites() {
  const user = useAuthStore((s) => s.user);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.matches.list()
      .then(setMatches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Star className="text-gold" size={20} />
          <span data-testid="estrelas-balance" className="text-gold font-bold text-lg">
            {user?.estrelas ?? 0}
          </span>
        </div>
        <Bell className="text-muted" size={20} />
      </div>

      <h2 className="font-display text-3xl text-white mb-4">PALPITES</h2>

      {loading && <p className="text-muted text-center py-8">Carregando partidas...</p>}

      {!loading && matches.length === 0 && (
        <p className="text-muted text-center py-8">Sem partidas hoje</p>
      )}

      <div className="space-y-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
