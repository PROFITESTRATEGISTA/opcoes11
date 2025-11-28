import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, TrendingUp, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { UserPlan } from '../../types/trading';

const AVAILABLE_PLANS: UserPlan[] = [
  {
    id: 'free',
    type: 'FREE',
    name: 'Sem Acesso',
    price: 0,
    features: ['Sem acesso ao produto', 'Apenas visualização de preços'],
    maxStructures: 0,
    maxUsers: 1,
    hasAdvancedAnalytics: false,
    hasSharedAccess: false,
    hasAdminControls: false
  }
];

interface LoginPageProps {
  onAuthSuccess: () => void;
  onNavigate: (page: 'home' | 'pricing') => void;
}

export default function LoginPage({ onAuthSuccess, onNavigate }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              isAdmin: formData.email === 'pedropardal04@gmail.com',
             plan_id: 'FREE'
            }
          }
        });
        if (error) throw error;
      }
      onAuthSuccess();
    } catch (err: any) {
      // Provide user-friendly error messages
      if (err.message?.includes('Invalid login credentials')) {
        setError(isLogin ? 'Email ou senha incorretos. Verifique suas credenciais.' : 'Erro ao criar conta. Tente novamente.');
      } else if (err.message?.includes('User already registered')) {
        setError('Este email já está cadastrado. Faça login ou use outro email.');
      } else if (err.message?.includes('Password should be at least')) {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (err.message?.includes('Unable to validate email address')) {
        setError('Email inválido. Verifique o formato do email.');
      } else {
        setError(err.message || 'Erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <button
        onClick={() => onNavigate('home')}
        className="fixed top-6 left-6 z-10 flex items-center px-4 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Home
      </button>

      <div className="w-full max-w-md">
        <div className="bg-black/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Strategos Partners
            </h2>
            <p className="text-gray-400">
              Tecnologia em Tesouraria, Consultoria em Patrimônio
            </p>
            <p className="text-sm text-blue-400 mt-2">
              {isLogin ? 'Faça login para continuar' : 'Crie sua conta para começar'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Seu nome completo"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processando...
                </div>
              ) : (
                isLogin ? 'Entrar' : 'Criar conta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-400 hover:text-blue-200 font-medium transition-colors"
              >
                {isLogin ? 'Criar conta' : 'Fazer login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}