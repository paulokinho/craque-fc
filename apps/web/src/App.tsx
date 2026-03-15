import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Palpites } from './pages/Palpites';
import { Liga } from './pages/Liga';
import { Copa } from './pages/Copa';
import { Loja } from './pages/Loja';
import { Perfil } from './pages/Perfil';
import { AppLayout } from './components/ui/AppLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/palpites" element={<Palpites />} />
          <Route path="/liga" element={<Liga />} />
          <Route path="/copa" element={<Copa />} />
          <Route path="/loja" element={<Loja />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
