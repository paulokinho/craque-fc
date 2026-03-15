import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Target, Crosshair, Flame, Trophy } from 'lucide-react';
import { api } from '../api/client';

export function Perfil() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {}
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const accuracy = user.estrelas > 0
    ? Math.round((user.estrelas / Math.max(1, user.estrelas)) * 100)
    : 0;

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto text-3xl font-display text-gold border-2 border-gold/40">
          {user.displayName[0].toUpperCase()}
        </div>
        <h2 className="font-display text-2xl text-white mt-3">{user.displayName}</h2>
        <p className="text-muted">@{user.username}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-pitch-card rounded-xl p-4 border border-gold/10 text-center">
          <Target className="text-gold mx-auto mb-1" size={20} />
          <p className="text-xl font-bold text-white">{user.estrelas}</p>
          <p className="text-xs text-muted">Estrelas</p>
        </div>
        <div className="bg-pitch-card rounded-xl p-4 border border-gold/10 text-center">
          <Flame className="text-gold mx-auto mb-1" size={20} />
          <p className="text-xl font-bold text-white">{user.streak}</p>
          <p className="text-xs text-muted">Sequência</p>
        </div>
        <div className="bg-pitch-card rounded-xl p-4 border border-gold/10 text-center">
          <Crosshair className="text-gold mx-auto mb-1" size={20} />
          <p className="text-xl font-bold text-white">{accuracy}%</p>
          <p className="text-xs text-muted">Acerto</p>
        </div>
        <div className="bg-pitch-card rounded-xl p-4 border border-gold/10 text-center">
          <Trophy className="text-gold mx-auto mb-1" size={20} />
          <p className="text-xl font-bold text-white">{user.hasCopaPass ? 'Ativo' : '-'}</p>
          <p className="text-xs text-muted">Copa Pass</p>
        </div>
      </div>

      {user.shieldsAvailable > 0 && (
        <p className="text-sm text-muted mb-2">🛡️ {user.shieldsAvailable} escudo(s) disponível(is)</p>
      )}
      {user.boostsAvailable > 0 && (
        <p className="text-sm text-muted mb-4">🚀 {user.boostsAvailable} boost(s) disponível(is)</p>
      )}

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition mt-4"
      >
        <LogOut size={18} />
        Sair da conta
      </button>
    </div>
  );
}
