import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function AuthComplete() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing'|'done'|'error'>('processing');

  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      let token = qs.get('token');
      if (!token && window.location.hash) {
        const h = new URLSearchParams(window.location.hash.replace('#', ''));
        token = h.get('token');
      }
      if (token) {
        try { localStorage.setItem('auth_token', token); } catch (e) {}
        setStatus('done');
        toast({ title: 'Signed in', description: 'You are now signed in.' });
        // clean URL and navigate
        window.history.replaceState(null, '', '/');
        setTimeout(() => navigate('/my-bookings'), 600);
        return;
      }
      setStatus('error');
      toast({ title: 'Sign-in failed', description: 'No token returned from OAuth.' });
    } catch (e) {
      setStatus('error');
      toast({ title: 'Sign-in error', description: 'Could not complete sign-in.' });
    }
  }, []);

  return (
    <div style={{ padding: 24 }}>
      {status === 'processing' && <div>Completing sign-in…</div>}
      {status === 'done' && <div>Sign-in complete, redirecting…</div>}
      {status === 'error' && <div>Sign-in error. Please try again.</div>}
    </div>
  );
}
