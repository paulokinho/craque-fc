import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  email: z.string().min(1, 'Email obrigatório').email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  username: z.string().min(3, 'Mínimo 3 caracteres').max(20, 'Máximo 20 caracteres'),
  displayName: z.string().min(2, 'Mínimo 2 caracteres'),
});

type RegisterForm = z.infer<typeof schema>;

export function Register() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      const res = await api.auth.register(data);
      setUser(res.user);
      navigate('/palpites');
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar');
    }
  };

  return (
    <div className="min-h-screen pitch-bg flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-pitch-card rounded-2xl p-8 border border-gold/10">
        <h1 className="font-display text-4xl text-gold text-center mb-2">CRAQUE FC</h1>
        <p className="text-muted text-center mb-8">Crie sua conta e comece a jogar</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('displayName')}
              data-testid="display-name-input"
              type="text"
              placeholder="Nome de exibição"
              className="w-full px-4 py-3 bg-pitch-light border border-gold/20 rounded-lg text-white placeholder:text-muted focus:outline-none focus:border-gold"
            />
            {errors.displayName && <p className="text-red-400 text-sm mt-1 error">{errors.displayName.message}</p>}
          </div>

          <div>
            <input
              {...register('username')}
              data-testid="username-input"
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 bg-pitch-light border border-gold/20 rounded-lg text-white placeholder:text-muted focus:outline-none focus:border-gold"
            />
            {errors.username && <p className="text-red-400 text-sm mt-1 error">{errors.username.message}</p>}
          </div>

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
              placeholder="Senha (mínimo 6 caracteres)"
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
            {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-muted text-center mt-6 text-sm">
          Já tem conta?{' '}
          <Link to="/login" className="text-gold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
