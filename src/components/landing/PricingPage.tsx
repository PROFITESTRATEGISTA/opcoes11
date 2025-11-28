import React, { useState } from 'react';
import { 
  Check, 
  Crown, 
  Building, 
  User, 
  Activity, 
  DollarSign,
  ArrowRight,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';

import Footer from './Footer';

interface PricingPageProps {
  onNavigate: (page: 'login' | 'home') => void;
}

export default function PricingPage({ onNavigate }: PricingPageProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const platformPlans = [
    {
      id: 'individual',
      name: 'Acesso Individual',
      monthlyPrice: 99.90,
      annualPrice: 79.90,
      description: 'Acesso completo à plataforma para pessoa física',
      icon: User,
      color: 'from-blue-500 to-blue-700',
      badge: 'RECOMENDADO',
      badgeColor: 'bg-blue-500',
      features: [
        'Estruturas ilimitadas',
        'Controle de rolagens automático',
        'Exercício de opções',
        'Análises avançadas',
        'Dashboards completos',
        'Suporte prioritário'
      ],
      disclaimer: 'Acesso à plataforma SEM consultoria'
    },
    {
      id: 'corporate',
      name: 'Acesso Corporativo',
      monthlyPrice: 199.90,
      annualPrice: 159.90,
      description: 'Acesso para equipes de até 5 colaboradores',
      icon: Building,
      color: 'from-purple-500 to-purple-700',
      badge: 'MAIS POPULAR',
      badgeColor: 'bg-purple-500', 
      features: [
        'Até 5 colaboradores',
        'Acesso compartilhado',
        'Admin compartilhada',
        'Relatórios corporativos',
        'Controles administrativos',
        'Suporte dedicado'
      ],
      disclaimer: 'Acesso à plataforma SEM consultoria'
    }
  ];

  const consultingPlans = [
    {
      id: 'consulting_conservative',
      name: 'Consultoria Conservadora',
      price: 'Fee Fixo Anual',
      description: 'Fee fixo anual negociável',
      icon: Activity,
      color: 'from-green-500 to-green-700',
      badge: 'CONSERVADOR',
      badgeColor: 'bg-green-500',
      features: [
        'Fee fixo anual negociável',
        'Estratégias conservadoras',
        'Renda fixa estruturada',
        'Baixo risco',
        'Relatórios CNPI',
        'Acompanhamento anual'
      ]
    },
    {
      id: 'consulting_passive_income',
      name: 'Consultoria Renda Passiva',
      price: 150.00,
      description: 'R$ 150 a cada R$ 20.000 supervisionado',
      icon: Activity,
      color: 'from-orange-500 to-orange-700',
      badge: 'RENDA PASSIVA',
      badgeColor: 'bg-orange-500',
      features: [
        'R$ 150 por R$ 20k supervisionado',
        'Recomendações mensais automáticas',
        'Estruturas conservadoras',
        'Renda sintética personalizada',
        'Acompanhamento por patrimônio',
        'Relatórios mensais especializados'
      ]
    },
    {
      id: 'consulting_turbo',
      name: 'Carteira de Custódia Turbinada',
      price: 250.00,
      description: 'Consultoria completa + carteira de dividendos',
      icon: Activity,
      color: 'from-purple-500 to-purple-700',
      badge: 'TURBINADA',
      badgeColor: 'bg-purple-500',
      features: [
        'Consultoria completa',
        'Carteira de dividendos',
        'Dividendo sintético',
        'Copy Nelogica automático',
        'Relatórios CNPI',
        'Acompanhamento especializado'
      ]
    }
  ];

  const addons = [
    {
      id: 'dividend_portfolio',
      name: 'Carteira de Dividendos',
      price: 100.00,
      description: 'Add-on para qualquer plano',
      icon: DollarSign,
      color: 'from-green-500 to-green-700',
      features: [
        'Dividendo sintético via copy',
        'Remuneração automática',
        'Relatórios especializados',
        'Estratégias de yield',
        'Acompanhamento de proventos',
        'Otimização fiscal'
      ]
    }
  ];

  const getPrice = (plan: any) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: any) => {
    if (!isAnnual) return 0;
    return (plan.monthlyPrice - plan.annualPrice) * 12;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Back to Home Button */}
      <button
        onClick={() => onNavigate('home')}
        className="fixed top-6 left-6 z-10 flex items-center px-4 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Home
      </button>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Planos e Preços
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Strategos Partners
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
            Tecnologia em Tesouraria, Consultoria em Patrimônio - Plataforma profissional para gestão patrimonial
          </p>
        </div>
      </section>

      {/* Platform Access Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Acesso à Plataforma
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Controle automático de rolagens, exercícios e gestão completa de operações estruturadas
            </p>
            
            {/* Annual/Monthly Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-lg font-medium ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>
                Mensal
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex items-center h-8 w-16 rounded-full bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span
                  className={`inline-block w-6 h-6 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg font-medium ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
                Anual
              </span>
              {isAnnual && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  💰 Economize até 20%
                </span>
              )}
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-yellow-300 font-medium text-sm">
                ⚠️ IMPORTANTE: Acesso à plataforma é SEM consultoria
              </p>
              <p className="text-yellow-400 text-xs mt-1">
                Usuário apenas usa a plataforma para controle de estruturas, operações, rolagens e exercícios
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {platformPlans.map((plan) => {
              const Icon = plan.icon;
              const currentPrice = getPrice(plan);
              const savings = getSavings(plan);
              
              return (
                <div
                  key={plan.id}
                  className="relative bg-gray-800 border border-gray-700 rounded-2xl p-8 hover:scale-105 transition-all"
                >
                  {/* Badge */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className={`${plan.badgeColor} text-white px-4 py-1 rounded-full text-xs font-bold`}>
                      {plan.badge}
                    </span>
                  </div>
                  
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`bg-gradient-to-r ${plan.color} p-4 rounded-xl mb-4 mx-auto w-fit`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-white">
                      {formatCurrency(currentPrice)}
                      <span className="text-lg font-normal text-gray-400">
                        /mês{isAnnual ? ' (anual)' : ''}
                      </span>
                    </div>
                    {isAnnual && savings > 0 && (
                      <p className="text-green-400 text-sm font-medium mt-1">
                        💰 Economia de {formatCurrency(savings)}/ano
                      </p>
                    )}
                    <p className="text-gray-400 text-sm mt-2">{plan.description}</p>
                    
                    {/* Platform Access Disclaimer */}
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-300 text-xs font-medium">
                        🚫 {plan.disclaimer}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onNavigate('login')}
                    className={`w-full bg-gradient-to-r ${plan.color} text-white py-4 px-6 rounded-xl font-semibold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl`}
                  >
                    Começar Agora
                  </button>
                </div>
              );
            })}
          </div>

          {/* Consulting Services */}
          <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-2xl p-8 mb-16">
            <div className="text-center mb-8">
              <h4 className="text-2xl font-bold text-white mb-4">Serviços de Consultoria Especializada</h4>
              <p className="text-indigo-200">Acompanhamento personalizado com experts em renda passiva</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {consultingPlans.map((plan) => {
                const Icon = plan.icon;
                
                return (
                  <div
                    key={plan.id}
                    className="relative bg-gray-800 border border-indigo-500/50 rounded-xl p-6"
                  >
                    {/* Badge */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className={`${plan.badgeColor} text-white px-4 py-1 rounded-full text-xs font-bold`}>
                        {plan.badge}
                      </span>
                    </div>
                    
                    <div className="text-center mb-6">
                      <div className={`bg-gradient-to-r ${plan.color} p-4 rounded-xl mb-4 mx-auto w-fit`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-white">
                        {typeof plan.price === 'string' ? plan.price : formatCurrency(plan.price)}
                        <span className="text-sm font-normal text-gray-400">
                          {plan.id === 'consulting_passive_income' ? '/20k supervisionado' : 
                           plan.id === 'consulting_conservative' ? '' : '/mês'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">{plan.description}</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => onNavigate('login')}
                      className={`w-full bg-gradient-to-r ${plan.color} text-white py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition-all`}
                    >
                      Contratar Consultoria
                      <ArrowRight className="w-5 h-5 ml-2 inline" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add-ons Section */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h4 className="text-2xl font-bold text-white mb-4">Add-ons Especializados</h4>
              <p className="text-gray-300">Complemente qualquer plano com serviços adicionais</p>
            </div>

            <div className="grid grid-cols-1 max-w-2xl mx-auto">
              {addons.map((addon) => {
                const Icon = addon.icon;
                
                return (
                  <div
                    key={addon.id}
                    className="bg-gray-800 border border-gray-600 rounded-xl p-6 hover:border-green-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className={`bg-gradient-to-r ${addon.color} p-3 rounded-lg mr-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h5 className="text-xl font-bold text-white">{addon.name}</h5>
                          <p className="text-gray-400 text-sm">{addon.description}</p>
                          <p className="text-green-400 text-xs font-medium mt-1">
                            💡 Pode ser turbinada com consultoria personalizada
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {formatCurrency(addon.price)}
                          <span className="text-sm font-normal text-gray-400">/mês</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {addon.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => onNavigate('login')}
                      className={`w-full bg-gradient-to-r ${addon.color} text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-all`}
                    >
                      Adicionar ao Plano
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12">
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Pronto para Começar?
              </h3>
              <p className="text-xl text-blue-100 mb-8">
                Acesse a plataforma profissional de gestão de operações estruturadas
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg inline-flex items-center"
              >
                Acessar Plataforma
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
      
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/5511975333355"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 animate-pulse"
        title="Fale conosco no WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}