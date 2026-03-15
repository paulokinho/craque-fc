import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  email: z.string().min(1, 'Email obrigatório').email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginForm = z.infer<typeof schema>;

export function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const res = await api.auth.login(data);
      setUser(res.user);
      navigate('/palpites');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="min-h-screen pitch-bg flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-pitch-card rounded-2xl p-8 border border-gold/10">
        <h1 className="font-display text-4xl text-gold text-center mb-2">CRAQUE FC</h1>
        <p className="text-muted text-center mb-8">Entre para fazer seus palpites</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('email')}
              data-testid="email-input"
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 bg-pitch-light border border-gold/20 rounded-lg text-white placeholder:text-muted focus:outline-none focus:border-gold"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1 error">{errors.email.message}</p>}
          </div>

          <div>
            <input
              {...register('password')}
              data-testid="password-input"
              type="password"
              placeholder="Senha"
              className="w-full px-4 py-3 bg-pitch-light border border-gold/20 rounded-lg text-white placeholder:text-muted focus:outline-none focus:border-gold"
            />
            {errors.password && <p className="text-red-400 text-sm mt-1 error">{errors.password.message}</p>}
          </div>

          {error && <p className="text-red-400 text-sm text-center error">{error}</p>}

          <button
            data-testid="submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gold text-pitch font-bold rounded-lg hover:bg-gold-dark transition disabled:opacity-50"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-muted text-center mt-6 text-sm">
          Não tem conta?{' '}
          <Link to="/register" className="text-gold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
