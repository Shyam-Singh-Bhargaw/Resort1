import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    try {
      // Check query string or hash for token returned by OAuth redirect
      const qs = new URLSearchParams(window.location.search);
      let token = qs.get('token');
      if (!token && window.location.hash) {
        const h = new URLSearchParams(window.location.hash.replace('#', ''));
        token = h.get('token');
      }
      if (token) {
        try { localStorage.setItem('auth_token', token); } catch (e) {}
        toast({ title: 'Signed in', description: 'Signed in with Google' });
        // clean URL
        window.history.replaceState(null, '', window.location.pathname);
        navigate('/my-bookings');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const doLogin = async () => {
    try {
      const res: any = await apiClient.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res && res.token) {
        try { localStorage.setItem('auth_token', res.token); } catch (e) {}
        toast({ title: 'Signed in', description: 'You are now signed in.' });
        navigate('/my-bookings');
        return true;
      }
    } catch (err: any) {
      toast({ title: 'Sign in error', description: err?.detail || err?.message || 'Login failed' });
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await doLogin();
      return;
    }

    // register
    try {
      const reg: any = await apiClient.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, first_name: firstName || undefined, phone }),
      });
      // Attempt login after registration
      await doLogin();
      toast({ title: 'Account created', description: 'Account created and signed in.' });
    } catch (err: any) {
      toast({ title: 'Register failed', description: err?.detail || err?.message || 'Could not create account' });
    }
  };

  const handleGoogle = () => {
    // Attempt OAuth redirect — backend must implement /auth/oauth/google
    try {
      const env = (import.meta as any).env || {};
      const apiBase = env.VITE_API_URL || env.NEXT_PUBLIC_API_URL || '';
      const target = apiBase ? `${apiBase.replace(/\/$/, '')}/auth/oauth/google` : '/auth/oauth/google';
      window.location.href = target;
    } catch (e) {
      toast({ title: 'Not configured', description: 'Google sign-in is not configured on this server.' });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-serif mb-4">{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
      <div className="mb-4 flex gap-2">
        <button className={"px-3 py-2 rounded " + (mode === 'login' ? 'bg-primary text-primary-foreground' : 'bg-muted')} onClick={() => setMode('login')}>Sign in</button>
        <button className={"px-3 py-2 rounded " + (mode === 'register' ? 'bg-primary text-primary-foreground' : 'bg-muted')} onClick={() => setMode('register')}>Register</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-sm mb-1">Full name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Your name" required />
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        {mode === 'register' && (
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Phone number" />
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <div className="flex items-center justify-between">
          <Button type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</Button>
          <Button variant="outline" type="button" onClick={handleGoogle}>Sign in with Google</Button>
        </div>
      </form>
    </div>
  );
}
