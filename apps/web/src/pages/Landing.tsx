import { Link } from 'react-router-dom';
import { Trophy, Star, Users } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen pitch-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-8">
        <h1 className="font-display text-6xl md:text-8xl text-gold tracking-wider">
          CRAQUE FC
        </h1>
        <p className="font-display text-2xl md:text-4xl text-white/80 mt-2">
          O MELHOR PALPITEIRO GANHA
        </p>
      </div>

      <p className="text-muted max-w-md mb-10 text-lg">
        Faça seus palpites nos jogos da Copa do Mundo e do Brasileirão.
        Ganhe Estrelas, suba no ranking e conquiste prêmios reais.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <Link
          to="/register"
          className="px-8 py-3 bg-gold text-pitch font-bold rounded-lg text-lg hover:bg-gold-dark transition gold-glow"
        >
          Jogar Grátis
        </Link>
        <Link
          to="/login"
          className="px-8 py-3 border border-gold/50 text-gold font-bold rounded-lg text-lg hover:bg-gold/10 transition"
        >
          Entrar
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full">
        <div className="bg-pitch-card rounded-xl p-6 border border-gold/10">
          <Trophy className="text-gold mx-auto mb-3" size={32} />
          <h3 className="font-semibold text-white mb-1">Palpites</h3>
          <p className="text-muted text-sm">Preveja placares exatos e ganhe até 100 Estrelas</p>
        </div>
        <div className="bg-pitch-card rounded-xl p-6 border border-gold/10">
          <Users className="text-gold mx-auto mb-3" size={32} />
          <h3 className="font-semibold text-white mb-1">Bolões</h3>
          <p className="text-muted text-sm">Crie bolões com amigos e dispute quem é o Craque</p>
        </div>
        <div className="bg-pitch-card rounded-xl p-6 border border-gold/10">
          <Star className="text-gold mx-auto mb-3" size={32} />
          <h3 className="font-semibold text-white mb-1">Prêmios</h3>
          <p className="text-muted text-sm">Troque Estrelas por prêmios reais como iFood e PSN</p>
        </div>
      </div>
    </div>
  );
}
