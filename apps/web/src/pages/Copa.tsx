import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { api } from '../api/client';

const GROUP_C = [
  { name: 'Brasil', shortName: 'BRA', flag: '🇧🇷' },
  { name: 'Marrocos', shortName: 'MAR', flag: '🇲🇦' },
  { name: 'Haiti', shortName: 'HAI', flag: '🇭🇹' },
  { name: 'Escócia', shortName: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
];

export function Copa() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    api.matches.list()
      .then((all) => setMatches(all.filter((m: any) => m.competition?.slug === 'copa-mundo-2026')))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <h2 className="font-display text-3xl text-white mb-2">COPA DO MUNDO 2026</h2>
      <p className="text-muted mb-6">Grupo C</p>

      <div className="bg-pitch-card rounded-xl p-4 border border-gold/10 mb-6">
        <h3 className="font-semibold text-gold mb-3 text-sm">GRUPO C</h3>
        <div className="grid grid-cols-4 gap-2">
          {GROUP_C.map((team) => (
            <div key={team.shortName} className="text-center">
              <div className="text-2xl mb-1">{team.flag}</div>
              <p className="text-xs font-medium">{team.shortName}</p>
            </div>
          ))}
        </div>
      </div>

      <h3 className="font-semibold text-white mb-3">Partidas do Grupo C</h3>

      {matches.length === 0 && (
        <div className="text-center py-8">
          <Globe className="text-muted mx-auto mb-3" size={48} />
          <p className="text-muted">Partidas em breve</p>
        </div>
      )}

      <div className="space-y-3">
        {matches.map((match: any) => (
          <div key={match.id} className="bg-pitch-card rounded-xl p-4 border border-gold/10">
            <p className="text-xs text-muted mb-2">{match.round}</p>
            <div className="flex items-center justify-between">
              <span className="font-medium">{match.homeTeam?.shortName || '???'}</span>
              <span className="text-gold text-xs">
                {new Date(match.kickoffAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="font-medium">{match.awayTeam?.shortName || '???'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
