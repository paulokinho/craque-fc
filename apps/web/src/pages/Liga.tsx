import { useState, useEffect } from 'react';
import { Users, Plus, LogIn } from 'lucide-react';
import { api } from '../api/client';

export function Liga() {
  const [groups, setGroups] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.groups.my()
      .then(setGroups)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    try {
      await api.groups.create({ name: groupName });
      setShowCreate(false);
      setGroupName('');
      const updated = await api.groups.my();
      setGroups(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = async () => {
    if (inviteCode.length !== 6) return;
    try {
      await api.groups.join(inviteCode);
      setShowJoin(false);
      setInviteCode('');
      const updated = await api.groups.my();
      setGroups(updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <h2 className="font-display text-3xl text-white mb-4">MEUS BOLÕES</h2>

      <div className="flex gap-3 mb-6">
        <button
          data-testid="create-group-btn"
          onClick={() => { setShowCreate(true); setShowJoin(false); }}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold text-pitch font-bold rounded-lg hover:bg-gold-dark transition"
        >
          <Plus size={18} />
          Criar Bolão
        </button>
        <button
          onClick={() => { setShowJoin(true); setShowCreate(false); }}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-gold/40 text-gold font-bold rounded-lg hover:bg-gold/10 transition"
        >
          <LogIn size={18} />
          Entrar em Bolão
        </button>
      </div>

      {showCreate && (
        <div data-testid="create-group-modal" className="bg-pitch-card rounded-xl p-6 border border-gold/10 mb-6">
          <h3 className="font-semibold text-white mb-4">Novo Bolão</h3>
          <input
            type="text"
            placeholder="Nome do Bolão"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-3 bg-pitch-light border border-gold/20 rounded-lg text-white placeholder:text-muted focus:outline-none focus:border-gold mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              className="flex-1 py-2 bg-gold text-pitch font-bold rounded-lg hover:bg-gold-dark transition"
            >
              Criar
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2 border border-muted/30 text-muted rounded-lg hover:bg-pitch-light transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showJoin && (
        <div className="bg-pitch-card rounded-xl p-6 border border-gold/10 mb-6">
          <h3 className="font-semibold text-white mb-4">Entrar em Bolão</h3>
          <input
            data-testid="invite-code-input"
            type="text"
            placeholder="Código de convite (6 letras)"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 6))}
            maxLength={6}
            className="w-full px-4 py-3 bg-pitch-light border border-gold/20 rounded-lg text-white placeholder:text-muted focus:outline-none focus:border-gold mb-4 text-center text-xl tracking-widest font-bold"
          />
          <div className="flex gap-3">
            <button
              onClick={handleJoin}
              className="flex-1 py-2 bg-gold text-pitch font-bold rounded-lg hover:bg-gold-dark transition"
            >
              Entrar
            </button>
            <button
              onClick={() => setShowJoin(false)}
              className="flex-1 py-2 border border-muted/30 text-muted rounded-lg hover:bg-pitch-light transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-muted text-center py-8">Carregando...</p>}

      {!loading && groups.length === 0 && (
        <div className="text-center py-12">
          <Users className="text-muted mx-auto mb-3" size={48} />
          <p className="text-muted">Você ainda não está em nenhum bolão</p>
          <p className="text-muted text-sm mt-1">Crie ou entre em um bolão para começar!</p>
        </div>
      )}

      <div className="space-y-3">
        {groups.map((g: any) => (
          <div key={g.group?.id || g.id} className="bg-pitch-card rounded-xl p-4 border border-gold/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-azul/20 flex items-center justify-center text-sm font-bold">
                {(g.group?.name || '')[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{g.group?.name}</p>
                <p className="text-xs text-muted">Rank: #{g.rank || '-'}</p>
              </div>
              <div className="text-right">
                <p className="text-gold font-bold">{g.totalEstrelas || 0}</p>
                <p className="text-xs text-muted">estrelas</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
