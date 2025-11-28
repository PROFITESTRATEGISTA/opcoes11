import React from 'react';
import { Shield, Crown, Building, User, LogOut, BarChart3, Users, Target, RotateCcw, DollarSign } from 'lucide-react';
import { UserPlan } from '../types/trading';
import PricingHeroSection from './pricing/PricingHeroSection';

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
    id: 'pessoa_fisica',
    type: 'PESSOA_FISICA',
    name: 'Pessoa Física',
    price: 99.90,
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
    name: 'Corporativo',
    price: 199.90,
    features: ['Até 5 colaboradores', 'Acesso compartilhado', 'Relatórios corporativos', 'Suporte dedicado'],
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
  }
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

export default function AccessDenied({ userPlan, onLogout }: { userPlan?: UserPlan; onLogout: () => void }) {
  const [showPricing, setShowPricing] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main Access Denied Card */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center mb-8">
          <div className="bg-red-500/20 p-6 rounded-full w-fit mx-auto mb-6">
            <Shield className="w-16 h-16 text-red-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Acesso Restrito à Strategos Partners
          </h1>
          
          <p className="text-gray-300 mb-2">
            Pronto para Tecnologia em Tesouraria e Consultoria em Patrimônio?
            Sua conta atual não possui acesso aos serviços especializados.
          </p>
          
          <p className="text-gray-300 mb-6">
            Junte-se aos investidores que já utilizam a Strategos Partners para tecnologia 
            avançada em tesouraria e consultoria especializada em patrimônio.
          </p>
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-white font-semibold">
                  Contratar Consultoria Individual
                </h3>
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  Consultoria Corporativa
                </h3>
                <p className="text-gray-400">{formatCurrency(userPlan?.price || 0)}</p>
              </div>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-300 font-medium">
                🚫 Usuários gratuitos não têm acesso à consultoria especializada
              </p>
              <p className="text-red-400 text-sm mt-2">
                Para ter consultoria personalizada, é necessário contratar um plano
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => setShowPricing(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Ver Planos de Consultoria
            </button>
            
            <button
              onClick={onLogout}
              className="border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sair da Conta
            </button>
          </div>

          {/* Quick Plan Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center justify-center mb-3">
                <User className="w-6 h-6 text-blue-400 mr-2" />
                <h4 className="font-semibold text-blue-400">Individual</h4>
              </div>
              <p className="text-2xl font-bold text-white mb-2">R$ 99,90/mês</p>
              <p className="text-sm text-gray-400">Consultoria personalizada</p>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center justify-center mb-3">
                <Building className="w-6 h-6 text-purple-400 mr-2" />
                <h4 className="font-semibold text-purple-400">Corporativo</h4>
              </div>
              <p className="text-2xl font-bold text-white mb-2">R$ 199,90/mês</p>
              <p className="text-sm text-gray-400">Consultoria em equipe</p>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center justify-center mb-3">
                <Crown className="w-6 h-6 text-green-400 mr-2" />
                <h4 className="font-semibold text-green-400">Premium Anual</h4>
              </div>
              <p className="text-2xl font-bold text-white mb-2">R$ 99,90/mês</p>
              <p className="text-sm text-gray-400">Analista CNPI dedicado</p>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white text-center mb-6">
            O que você terá com consultoria especializada:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="bg-blue-500/20 p-3 rounded-lg mb-3 mx-auto w-fit">
                <RotateCcw className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="font-medium text-white mb-2">Controle de Rolagens</h4>
              <p className="text-sm text-gray-400">Controle automático - fuja do Excel</p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-green-500/20 p-3 rounded-lg mb-3 mx-auto w-fit">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="font-medium text-white mb-2">Exercício de Opções</h4>
              <p className="text-sm text-gray-400">Controle automático de exercícios</p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-purple-500/20 p-3 rounded-lg mb-3 mx-auto w-fit">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-medium text-white mb-2">Relatórios CNPI</h4>
              <p className="text-sm text-gray-400">Análises de experts certificados</p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-orange-500/20 p-3 rounded-lg mb-3 mx-auto w-fit">
                <DollarSign className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="font-medium text-white mb-2">Carteira de Dividendos</h4>
              <p className="text-sm text-gray-400">Dividendo sintético via copy Nelogica</p>
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