import React, { useState } from 'react';
import { Utensils, Lock, User, AlertCircle } from 'lucide-react';
import { Card, Button } from './UI';
import { Staff } from '../types';

interface LoginProps {
  onLogin: (user: Staff) => void;
  staff: Staff[];
}

export default function Login({ onLogin, staff }: LoginProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedLogin = login.trim();
    const trimmedPassword = password.trim();

    if (!trimmedLogin || !trimmedPassword) {
      setError('Пожалуйста, введите логин и пароль');
      return;
    }

    const user = staff.find(s => s.login === trimmedLogin && (s.password === trimmedPassword || (!s.password && trimmedPassword === '1234')));
    
    if (user) {
      onLogin(user);
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Utensils size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Кафе Мастер</h1>
          <p className="text-slate-500 mt-2">Система управления заведением</p>
        </div>

        <Card className="p-8 shadow-xl border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Вход в систему</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-in slide-in-from-top-1">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Логин</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Введите логин"
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3 text-base font-bold mt-2">
              Войти
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <button 
              onClick={() => {
                setLogin('');
                setPassword('');
                setError('');
              }}
              className="w-full text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
            >
              Сменить аккаунт
            </button>
          </div>
        </Card>

        <p className="text-center text-slate-400 text-xs mt-8">
          &copy; 2026 Кафе Мастер. Все права защищены.
        </p>
      </div>
    </div>
  );
}
