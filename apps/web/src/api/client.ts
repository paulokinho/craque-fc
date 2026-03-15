const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro de rede' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; username: string; displayName: string }) =>
      request<{ user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<{ user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request<any>('/auth/me'),
  },
  matches: {
    list: () => request<any[]>('/matches/'),
    upcoming: () => request<any[]>('/matches/upcoming'),
  },
  predictions: {
    submit: (data: { matchId: string; predictedHomeScore: number; predictedAwayScore: number; boostActive?: boolean }) =>
      request('/predictions/', { method: 'POST', body: JSON.stringify(data) }),
    my: () => request<any[]>('/predictions/my'),
  },
  groups: {
    create: (data: { name: string; description?: string; competitionId?: string; isPublic?: boolean }) =>
      request('/groups/', { method: 'POST', body: JSON.stringify(data) }),
    join: (code: string) =>
      request('/groups/join', { method: 'POST', body: JSON.stringify({ code }) }),
    my: () => request<any[]>('/groups/my'),
  },
  shop: {
    items: () => request<any[]>('/shop/items'),
    checkout: (productType: string) =>
      request('/shop/checkout', { method: 'POST', body: JSON.stringify({ productType }) }),
  },
  profile: {
    get: () => request<any>('/profile/'),
    predictions: () => request<any[]>('/profile/predictions'),
  },
};
