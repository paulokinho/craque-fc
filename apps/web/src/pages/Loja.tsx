import { ShoppingBag } from 'lucide-react';

const SHOP_ITEMS = [
  { id: 'estrelas_100', name: 'Pacote Estrelas', description: '100 Estrelas', price: 'R$ 1,99', icon: '⭐', badge: null },
  { id: 'estrelas_500', name: 'Pacote Craque', description: '500 Estrelas — melhor custo-benefício', price: 'R$ 7,99', icon: '⭐⭐', badge: 'POPULAR' },
  { id: 'boost_x2', name: 'Boost x2', description: 'Dobra seus pontos no próximo palpite', price: 'R$ 1,99', icon: '🚀', badge: null },
  { id: 'streak_shield', name: 'Escudo da Sequência', description: 'Protege sua sequência de acertos', price: 'R$ 0,99', icon: '🛡️', badge: null },
  { id: 'copa_pass_month', name: 'Copa Pass', description: '1 mês — palpites extras + bônus exclusivos', price: 'R$ 9,90', icon: '👑', badge: 'MELHOR VALOR' },
];

export function Loja() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <h2 className="font-display text-3xl text-white mb-2">LOJA</h2>
      <p className="text-muted mb-6">Turbine seus palpites</p>

      <div className="space-y-3">
        {SHOP_ITEMS.map((item) => (
          <div
            key={item.id}
            data-testid="shop-item"
            className={`rounded-xl p-4 border transition ${
              item.id === 'copa_pass_month'
                ? 'bg-gradient-to-r from-gold/20 to-gold/5 border-gold/40'
                : 'bg-pitch-card border-gold/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">{item.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  {item.badge && (
                    <span className="text-[10px] font-bold bg-gold text-pitch px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted mt-0.5">{item.description}</p>
              </div>
              <button className="px-4 py-2 bg-gold text-pitch font-bold rounded-lg text-sm hover:bg-gold-dark transition whitespace-nowrap">
                {item.price}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
