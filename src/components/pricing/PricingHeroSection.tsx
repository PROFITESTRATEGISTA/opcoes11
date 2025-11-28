import React from 'react';
import { X, Check, Crown, Building, User, Zap, Shield, Users, BarChart3, Target } from 'lucide-react';
import { UserPlan } from '../../types/trading';

interface PricingHeroSectionProps {
  onClose: () => void;
  plans: UserPlan[];
}

export default function PricingHeroSection({ onClose, plans }: PricingHeroSectionProps) {
  const formatCurrency = (value: number) => {
    if (value === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'FREE':
        return User;
      case 'PESSOA_FISICA':
        return Zap;
      case 'CORPORATIVO':
        return Building;
      case 'CONSULTORIA':
        return Crown;
      default:
        return User;
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'FREE':
        return 'from-gray-500 to-gray-700';
      case 'PESSOA_FISICA':
        return 'from-blue-500 to-blue-700';
      case 'CORPORATIVO':
        return 'from-purple-500 to-purple-700';
      case 'CONSULTORIA':
        return 'from-green-500 to-green-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const getRecommendedPlan = () => {
    return plans.find(plan => plan.type === 'PESSOA_FISICA');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto border border-gray-700">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white p-8 rounded-t-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-xl mr-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Strategos Partners</h1>
                  <p className="text-blue-100 text-lg">Tecnologia em Tesouraria, Consultoria em Patrimônio</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Tecnologia Avançada em Tesouraria e Consultoria em Patrimônio
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                <strong>Strategos Partners</strong> oferece tecnologia avançada em tesouraria e consultoria especializada em patrimônio. 
                Controle automático de operações, gestão patrimonial e soluções tecnológicas para o mercado financeiro.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-white/10 p-4 rounded-xl mb-3 mx-auto w-fit">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Análises Avançadas</h3>
                <p className="text-blue-100 text-sm">Dashboards completos com métricas de performance</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 p-4 rounded-xl mb-3 mx-auto w-fit">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Acesso Compartilhado</h3>
                <p className="text-blue-100 text-sm">Colaboração em equipe com controles administrativos</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 p-4 rounded-xl mb-3 mx-auto w-fit">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Dados Seguros</h3>
                <p className="text-blue-100 text-sm">Isolamento completo de dados entre usuários</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 p-4 rounded-xl mb-3 mx-auto w-fit">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Execução Rápida</h3>
                <p className="text-blue-100 text-sm">Interface otimizada para operações ágeis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const Icon = getPlanIcon(plan.type);
              const isRecommended = plan.type === 'INDIVIDUAL';
              const isPopular = plan.type === 'CORPORATE';
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-gray-800 border rounded-2xl p-6 transition-all hover:scale-105 ${
                    isRecommended ? 'border-blue-500 ring-2 ring-blue-500/20' :
                    isPopular ? 'border-purple-500 ring-2 ring-purple-500/20' :
                    plan.type === 'FREE' ? 'border-gray-600' :
                    'border-green-500 ring-2 ring-green-500/20'
                  }`}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                        RECOMENDADO
                      </span>
                    </div>
                  )}
                  
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                        MAIS POPULAR
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`bg-gradient-to-r ${getPlanColor(plan.type)} p-4 rounded-xl mb-4 mx-auto w-fit`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(plan.price)}
                      {plan.price > 0 && (
                        <span className="text-sm font-normal text-gray-400">
                          {plan.type === 'ANNUAL_CORPORATE' ? '/mês (anual)' : '/mês'}
                        </span>
                      )}
                    </div>
                    {plan.type === 'ANNUAL_CORPORATE' && (
                      <p className="text-green-400 text-sm font-medium mt-1">
                        💰 Economia de R$ 1.200,00/ano
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                    
                    {/* Technical Specs */}
                    <div className="pt-3 border-t border-gray-700">
                      <div className="flex items-center text-sm mb-2">
                        <Target className="w-4 h-4 text-blue-400 mr-3" />
                        <span className="text-gray-300">
                          {plan.maxStructures === -1 ? 'Estruturas ilimitadas' : `Até ${plan.maxStructures} estruturas`}
                        </span>
                      </div>
                      <div className="flex items-center text-sm mb-2">
                        <Users className="w-4 h-4 text-purple-400 mr-3" />
                        <span className="text-gray-300">
                          {plan.maxUsers === 1 ? '1 usuário' : `Até ${plan.maxUsers} usuários`}
                        </span>
                      </div>
                      {plan.hasAdvancedAnalytics && (
                        <div className="flex items-center text-sm mb-2">
                          <BarChart3 className="w-4 h-4 text-green-400 mr-3" />
                          <span className="text-gray-300">Análises avançadas</span>
                        </div>
                      )}
                      {plan.hasSharedAccess && (
                        <div className="flex items-center text-sm mb-2">
                          <Shield className="w-4 h-4 text-orange-400 mr-3" />
                          <span className="text-gray-300">Acesso compartilhado</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                      plan.type === 'FREE' 
                        ? 'bg-gray-600 text-white hover:bg-gray-700' 
                        : isRecommended
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                        : isPopular
                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                    }`}
                    disabled={plan.type === 'FREE'}
                  >
                    {plan.type === 'FREE' ? 'Sem Acesso' : 'Escolher Plano'}
                  </button>
                  
                  {plan.type === 'FREE' && (
                    <p className="text-center text-red-400 text-xs mt-2 font-medium">
                      🚫 Usuários gratuitos não têm acesso ao produto
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Comparison Table */}
          <div className="mt-12 bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Comparação Detalhada</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Recursos</th>
                    {plans.map(plan => (
                      <th key={plan.id} className="text-center py-4 px-4">
                        <div className="text-white font-bold">{plan.name}</div>
                        <div className="text-gray-400 text-sm">{formatCurrency(plan.price)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-4 px-4 text-gray-300">Estruturas de Opções</td>
                    <td className="text-center py-4 px-4 text-red-400">❌</td>
                    <td className="text-center py-4 px-4 text-green-400">✅ Ilimitadas</td>
                    <td className="text-center py-4 px-4 text-green-400">✅ Ilimitadas</td>
                    <td className="text-center py-4 px-4 text-green-400">✅ Ilimitadas</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-4 px-4 text-gray-300">Análises Avançadas</td>
                    <td className="text-center py-4 px-4 text-red-400">❌</td>
                    <td className="text-center py-4 px-4 text-green-400">✅</td>
                    <td className="text-center py-4 px-4 text-green-400">✅</td>
                    <td className="text-center py-4 px-4 text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-4 px-4 text-gray-300">Usuários</td>
                    <td className="text-center py-4 px-4 text-gray-400">1</td>
                    <td className="text-center py-4 px-4 text-blue-400">1</td>
                    <td className="text-center py-4 px-4 text-purple-400">Até 5</td>
                    <td className="text-center py-4 px-4 text-green-400">Até 5</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-4 px-4 text-gray-300">Acesso Compartilhado</td>
                    <td className="text-center py-4 px-4 text-red-400">❌</td>
                    <td className="text-center py-4 px-4 text-red-400">❌</td>
                    <td className="text-center py-4 px-4 text-green-400">✅</td>
                    <td className="text-center py-4 px-4 text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-4 px-4 text-gray-300">Admin Compartilhada</td>
                    <td className="text-center py-4 px-4 text-red-400">❌</td>
                    <td className="text-center py-4 px-4 text-red-400">❌</td>
                    <td className="text-center py-4 px-4 text-green-400">✅</td>
                    <td className="text-center py-4 px-4 text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-4 px-4 text-gray-300">Relatórios Corporativos</td>
                    <td className="text-center py-4 px-4 text-red-400">❌</td>
                    <td className="text-center py-4 px-4 text-red-400">❌</td>
                    <td className="text-center py-4 px-4 text-green-400">✅</td>
                    <td className="text-center py-4 px-4 text-green-400">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-300">Suporte</td>
                    <td className="text-center py-4 px-4 text-red-400">❌</td>
                    <td className="text-center py-4 px-4 text-blue-400">Prioritário</td>
                    <td className="text-center py-4 px-4 text-purple-400">Dedicado</td>
                    <td className="text-center py-4 px-4 text-green-400">Premium</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Perguntas Frequentes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">O que acontece sem consultoria?</h4>
                  <p className="text-gray-400 text-sm">
                    Usuários sem consultoria não têm acesso ao acompanhamento especializado. 
                    É necessário contratar um plano para ter consultoria personalizada.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Como funciona a consultoria corporativa?</h4>
                  <p className="text-gray-400 text-sm">
                    Nos planos corporativos, até 5 colaboradores recebem consultoria em equipe 
                    com admin compartilhada e relatórios corporativos.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">O que inclui a carteira de dividendos?</h4>
                  <p className="text-gray-400 text-sm">
                    Copy automático via Nelogica, dividendo sintético, acompanhamento de yields 
                    e relatórios especializados de analista CNPI certificado.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Como funciona o analista CNPI?</h4>
                  <p className="text-gray-400 text-sm">
                    Analista certificado CNPI acompanha suas operações, fornece relatórios 
                    personalizados e orientações estratégicas para renda passiva.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Pronto para Fuja do Excel e Ter Consultoria Especializada?
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Junte-se aos investidores que já utilizam a OptionsMaster Pro para gerar 
                renda passiva com operações estruturadas, controle automático de rolagens e consultoria especializada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                  Consultoria Individual - R$ 99,90/mês
                </button>
                <button className="border border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Consultoria Corporativa - R$ 199,90/mês
                </button>
              </div>
              <div className="mt-4">
                <button className="bg-yellow-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-yellow-700 transition-colors">
                  + Carteira de Dividendos - R$ 100,00/mês
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}