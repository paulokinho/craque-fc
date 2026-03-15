import { useLocation, Link } from 'react-router-dom';
import { Trophy, Users, Globe, ShoppingBag, User } from 'lucide-react';

const tabs = [
  { path: '/palpites', label: 'Palpites', icon: Trophy },
  { path: '/liga', label: 'Liga', icon: Users },
  { path: '/copa', label: 'Copa', icon: Globe },
  { path: '/loja', label: 'Loja', icon: ShoppingBag },
  { path: '/perfil', label: 'Perfil', icon: User },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 bg-pitch-light border-t border-gold/20"
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-all ${
                isActive ? 'text-gold scale-110' : 'text-muted'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
