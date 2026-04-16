import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { request } from '@/lib/api';
import { useSettings } from '@/contexts/SettingsContext';
import { Loader2, LockKeyhole, LogOut, Save, ShieldCheck } from 'lucide-react';

const initialForm = {
  system_name: '',
  logo_url: '',
  primary_color: '#991b1b',
  secondary_color: '#111827',
};

export default function AdminPage() {
  const { settings, refreshSettings } = useSettings();
  const [form, setForm] = useState(initialForm);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [status, setStatus] = useState({ checking: true, authenticated: false, loading: false, message: '', error: '' });
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    setForm({
      system_name: settings.system_name || '',
      logo_url: settings.logo_url || '',
      primary_color: settings.primary_color || '#991b1b',
      secondary_color: settings.secondary_color || '#111827',
    });
  }, [settings]);

  useEffect(() => {
    request('/api/admin-session')
      .then(() => setStatus((prev) => ({ ...prev, checking: false, authenticated: true })))
      .catch(() => setStatus((prev) => ({ ...prev, checking: false, authenticated: false })));
  }, []);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const setPasswordField = (field, value) => setPasswordForm((prev) => ({ ...prev, [field]: value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus((prev) => ({ ...prev, loading: true, error: '', message: '' }));
    try {
      await request('/api/login', {
        method: 'POST',
        body: JSON.stringify({ password: loginPassword }),
      });
      await refreshSettings();
      setStatus({ checking: false, authenticated: true, loading: false, message: 'Login realizado com sucesso.', error: '' });
      setLoginPassword('');
    } catch (error) {
      setStatus((prev) => ({ ...prev, loading: false, error: error.message || 'Falha no login' }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus((prev) => ({ ...prev, loading: true, error: '', message: '' }));
    try {
      await request('/api/settings', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      await refreshSettings();
      setStatus((prev) => ({ ...prev, loading: false, message: 'Configurações salvas com sucesso.' }));
    } catch (error) {
      setStatus((prev) => ({ ...prev, loading: false, error: error.message || 'Falha ao salvar.' }));
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setStatus((prev) => ({ ...prev, loading: true, error: '', message: '' }));
    try {
      await request('/api/settings/password', {
        method: 'PUT',
        body: JSON.stringify(passwordForm),
      });
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setStatus((prev) => ({ ...prev, loading: false, message: 'Senha atualizada com sucesso.' }));
    } catch (error) {
      setStatus((prev) => ({ ...prev, loading: false, error: error.message || 'Falha ao atualizar senha.' }));
    }
  };

  const handleLogout = async () => {
    await request('/api/login', { method: 'DELETE' });
    setStatus({ checking: false, authenticated: false, loading: false, message: 'Sessão encerrada.', error: '' });
  };

  if (status.checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-100">
        <div className="flex items-center gap-3 text-slate-600"><Loader2 className="h-5 w-5 animate-spin" />Verificando sessão...</div>
      </div>
    );
  }

  if (!status.authenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 space-y-6 shadow-xl">
          <div className="text-center space-y-2">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 grid place-items-center text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold">Painel administrativo</h1>
            <p className="text-sm text-muted-foreground">Entre com a senha administrativa para editar nome, logo, cores e senha do sistema.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Senha admin</Label>
              <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Digite sua senha" />
            </div>
            {status.error && <p className="text-sm text-destructive">{status.error}</p>}
            {status.message && <p className="text-sm text-emerald-600">{status.message}</p>}
            <Button type="submit" className="w-full" disabled={status.loading || !loginPassword}>
              {status.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LockKeyhole className="h-4 w-4 mr-2" />}Entrar
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Administração</h1>
            <p className="text-sm text-slate-600">Gerencie branding e credenciais do sistema em ambiente compatível com Vercel.</p>
          </div>
          <Button variant="outline" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Sair</Button>
        </div>

        {status.error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{status.error}</div>}
        {status.message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status.message}</div>}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Configurações visuais</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome do sistema</Label>
                <Input value={form.system_name} onChange={(e) => setField('system_name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>URL da logo</Label>
                <Input value={form.logo_url} onChange={(e) => setField('logo_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Cor primária</Label>
                  <Input type="color" value={form.primary_color} onChange={(e) => setField('primary_color', e.target.value)} className="h-12" />
                </div>
                <div className="space-y-1.5">
                  <Label>Cor secundária</Label>
                  <Input type="color" value={form.secondary_color} onChange={(e) => setField('secondary_color', e.target.value)} className="h-12" />
                </div>
              </div>
              <Button type="submit" disabled={status.loading}>
                {status.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Salvar alterações
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Alterar senha</h2>
            <form onSubmit={handlePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Senha atual</Label>
                <Input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordField('currentPassword', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Nova senha</Label>
                <Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordField('newPassword', e.target.value)} />
              </div>
              <Button type="submit" variant="secondary" disabled={status.loading || !passwordForm.currentPassword || !passwordForm.newPassword}>
                {status.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LockKeyhole className="h-4 w-4 mr-2" />}Atualizar senha
              </Button>
            </form>
            <div className="mt-6 rounded-xl bg-slate-50 border p-4 text-sm text-slate-600">
              A senha é armazenada como hash bcrypt no Supabase e a sessão administrativa usa cookie assinado por JWT no backend serverless.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
