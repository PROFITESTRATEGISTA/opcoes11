import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, TrendingUp, BarChart3, Shield, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PricingHeroSection from './pricing/PricingHeroSection';
import { UserPlan } from '../types/trading';

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
  },
  {
    id: 'individual',
    type: 'INDIVIDUAL',
    name: 'Pessoa Física',
    price: 0,
    features: ['Acesso completo à plataforma', 'Estruturas ilimitadas', 'Análises avançadas', 'Suporte prioritário'],
    maxStructures: -1,
    maxUsers: 1,
    hasAdvancedAnalytics: true,
    hasSharedAccess: false,
    hasAdminControls: false
  },
  {
    id: 'corporativo',
    type: 'CORPORATIVO',
    name: 'Corporativo/Consultoria',
    price: 0,
    features: ['Até 5 colaboradores', 'Acesso compartilhado', 'Relatórios corporativos', 'Consultoria especializada'],
    maxStructures: -1,
    maxUsers: 5,
    hasAdvancedAnalytics: true,
    hasSharedAccess: true,
    hasAdminControls: true
  },
  {
    id: 'consultoria',
    type: 'CONSULTORIA',
    name: 'Consultoria',
    price: 299.90,
    features: ['Consultoria especializada', 'Acompanhamento personalizado', 'Relatórios CNPI', 'Suporte premium'],
    maxStructures: -1,
    maxUsers: 1,
    hasAdvancedAnalytics: true,
    hasSharedAccess: false,
    hasAdminControls: false
  },
  {
    id: 'dividend_portfolio',
    type: 'DIVIDEND_PORTFOLIO',
    name: 'Carteira de Dividendos',
    price: 100.00,
    features: ['Add-on para qualquer plano', 'Dividendo sintético via copy', 'Remuneração automática', 'Relatórios especializados'],
    maxStructures: -1,
    maxUsers: 1,
    hasAdvancedAnalytics: true,
    hasSharedAccess: false,
    hasAdminControls: false,
    isAddon: true
  }
];

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
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
             plan_id: 'free'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
      {/* Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-gray-800/50"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-3 rounded-xl mr-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">StructureTrader</h1>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Strategos Partners
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Tecnologia em Tesouraria, Consultoria em Patrimônio
            </p>
            <p className="text-sm text-blue-400 mt-2">
              {isLogin ? 'Acesse sua conta' : 'Crie sua conta profissional'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="bg-blue-500/20 p-3 rounded-lg mr-4">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Análise Avançada</h3>
                <p className="text-gray-400 text-sm">Dashboards completos com métricas de performance</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="bg-blue-500/20 p-3 rounded-lg mr-4">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Dados Isolados</h3>
                <p className="text-gray-400 text-sm">Cada usuário tem seus próprios dados privados</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="bg-gray-500/20 p-3 rounded-lg mr-4">
                <Zap className="w-6 h-6 text-gray-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Execução Rápida</h3>
                <p className="text-gray-400 text-sm">Interface otimizada para operações ágeis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-black/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-3 rounded-xl w-fit mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isLogin ? 'Bem-vindo à Strategos Partners' : 'Comece sua jornada profissional'}
              </h2>
              <p className="text-gray-400">
                {isLogin ? 'Tecnologia em Tesouraria, Consultoria em Patrimônio' : 'Tecnologia em Tesouraria, Consultoria em Patrimônio'}
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
              
              {!isLogin && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowPricing(true)}
                    className="text-purple-400 hover:text-purple-200 font-medium transition-colors text-sm"
                  >
                    📋 Ver Planos e Preços
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      {showPricing && (
        <PricingHeroSection
          onClose={() => setShowPricing(false)}
          plans={AVAILABLE_PLANS}
        />
      )}
    </div>
  );
}