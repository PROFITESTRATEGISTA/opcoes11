import React, { useState } from 'react';
import { 
  Check, 
  Crown, 
  Building, 
  User, 
  Activity,
  DollarSign, 
  ArrowRight,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface PlansSectionProps {
  onNavigate: (page: 'login') => void;
}

export default function PlansSection({ onNavigate }: PlansSectionProps) {
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

  const consultingPlan = {
    id: 'consulting_plus',
    name: 'Consultoria + Carteira Dividendos',
    price: 199.90,
    description: 'Consultoria completa + carteira de dividendos',
    icon: Activity,
    color: 'from-indigo-500 to-indigo-700',
    badge: 'CONSULTORIA',
    badgeColor: 'bg-indigo-500',
    features: [
      'Consultoria completa',
      'Carteira de dividendos',
      'Dividendo sintético',
      'Copy Nelogica automático',
      'Relatórios CNPI',
      'Acompanhamento especializado'
    ]
  };

  const consultingMonthly = {
    id: 'consulting_monthly',
    name: 'Consultoria Mensal Supervisionada',
    price: 150.00,
    description: 'R$ 150 a cada R$ 20.000 supervisionado',
    icon: Activity,
    color: 'from-orange-500 to-orange-700',
    badge: 'CONSERVADOR',
    badgeColor: 'bg-orange-500',
    features: [
      'Recomendações mensais automáticas',
      'Estruturas conservadoras',
      'Renda sintética personalizada',
      'Acompanhamento por patrimônio',
      'Estratégias de baixo risco',
      'Relatórios mensais especializados'
    ]
  };


  const getPrice = (plan: any) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: any) => {
    if (!isAnnual) return 0;
    return (plan.monthlyPrice - plan.annualPrice) * 12;
  };

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Planos de Acesso à Plataforma
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

        {/* Platform Access Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
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
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Comparative Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-16 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h4 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Comparação Completa de Recursos
            </h4>
            <p className="text-gray-300">
              Todos os módulos e funcionalidades disponíveis na plataforma
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-600">
                  <th className="py-4 px-4 text-white font-bold text-sm lg:text-base">Módulo / Funcionalidade</th>
                  <th className="py-4 px-4 text-center">
                    <div className="text-white font-bold text-sm lg:text-base mb-1">Acesso Individual</div>
                    <div className="text-blue-400 text-xs">R$ 99,90/mês</div>
                  </th>
                  <th className="py-4 px-4 text-center">
                    <div className="text-white font-bold text-sm lg:text-base mb-1">Acesso Corporativo</div>
                    <div className="text-purple-400 text-xs">R$ 199,90/mês</div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800">
                  <td colSpan={3} className="py-3 px-4 text-white font-semibold bg-gray-800/50 text-sm">
                    Módulo de Estruturas
                  </td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Criação de estruturas ilimitadas</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Suporte a opções, futuros e ações</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Estruturas complexas (spreads, straddles, iron condors)</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Templates pré-configurados</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Upload via CSV</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>

                <tr className="border-b border-gray-800">
                  <td colSpan={3} className="py-3 px-4 text-white font-semibold bg-gray-800/50 text-sm">
                    Módulo de Rolagens
                  </td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Controle automático de rolagens</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Histórico completo de rolagens</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Calendário de vencimentos</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Cálculo de custos e resultados</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>

                <tr className="border-b border-gray-800">
                  <td colSpan={3} className="py-3 px-4 text-white font-semibold bg-gray-800/50 text-sm">
                    Módulo de Exercícios
                  </td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Exercício de opções</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Liquidação automática de posições</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Controle de covered calls</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>

                <tr className="border-b border-gray-800">
                  <td colSpan={3} className="py-3 px-4 text-white font-semibold bg-gray-800/50 text-sm">
                    Módulo de Tesouraria
                  </td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Controle de fluxo de caixa</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Gestão de garantias e margem</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Custódia de ativos</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Liquidações futuras automáticas</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Breakdown de custos e receitas</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>

                <tr className="border-b border-gray-800">
                  <td colSpan={3} className="py-3 px-4 text-white font-semibold bg-gray-800/50 text-sm">
                    Análises e Dashboards
                  </td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Simulador de resultados</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Gráficos de payoff e performance</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Métricas de risco e retorno</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Dashboards personalizáveis</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>

                <tr className="border-b border-gray-800">
                  <td colSpan={3} className="py-3 px-4 text-white font-semibold bg-gray-800/50 text-sm">
                    Recursos Corporativos
                  </td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Número de usuários</td>
                  <td className="py-3 px-4 text-center text-sm">1 usuário</td>
                  <td className="py-3 px-4 text-center text-sm">Até 5 usuários</td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Gestão de equipes</td>
                  <td className="py-3 px-4 text-center text-gray-600">—</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Admin compartilhada</td>
                  <td className="py-3 px-4 text-center text-gray-600">—</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Controles administrativos</td>
                  <td className="py-3 px-4 text-center text-gray-600">—</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Relatórios corporativos</td>
                  <td className="py-3 px-4 text-center text-gray-600">—</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>

                <tr className="border-b border-gray-800">
                  <td colSpan={3} className="py-3 px-4 text-white font-semibold bg-gray-800/50 text-sm">
                    Suporte
                  </td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Suporte por email</td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-sm">Tipo de suporte</td>
                  <td className="py-3 px-4 text-center text-sm">Prioritário</td>
                  <td className="py-3 px-4 text-center text-sm">Dedicado</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-300 text-sm text-center">
              Ambos os planos incluem acesso completo a todos os módulos da plataforma. A diferença está no número de usuários e recursos corporativos.
            </p>
          </div>
        </div>

        {/* Serviços Adicionais - Unified Section */}
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-2xl p-8">
          <div className="text-center mb-12">
            <h4 className="text-3xl font-bold text-white mb-4">Serviços Adicionais</h4>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Consultoria especializada, plataformas complementares e serviços opcionais para maximizar seus resultados
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Consultoria Renda Passiva */}
            <div className="relative bg-gray-800 border border-orange-500/50 rounded-xl p-6 hover:border-orange-400 transition-all">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                  CONSULTORIA
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-4 rounded-xl mb-4 mx-auto w-fit">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-xl font-bold text-white mb-2">Consultoria Renda Passiva</h5>
                <div className="text-2xl font-bold text-white">
                  A partir de R$ 150
                  <span className="text-sm font-normal text-gray-400">/mês</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">PL mínimo: R$ 20.000</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  'Recomendações mensais',
                  'Estruturas conservadoras',
                  'Renda sintética personalizada',
                  'Relatórios especializados'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('login')}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-700 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Contratar
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
            </div>

            {/* Carteira de Dividendos */}
            <div className="relative bg-gray-800 border border-purple-500/50 rounded-xl p-6 hover:border-purple-400 transition-all">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                  ADD-ON
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-4 rounded-xl mb-4 mx-auto w-fit">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-xl font-bold text-white mb-2">Carteira de Dividendos</h5>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(100.00)}
                  <span className="text-sm font-normal text-gray-400">/mês</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Balanceamento automático</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  'Balanceamento automático',
                  'Remuneração automática',
                  'Relatórios especializados',
                  'Estratégias de yield'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('login')}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Adicionar
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
            </div>

            {/* Portfolio de IA */}
            <div className="relative bg-gray-800 border border-blue-500/50 rounded-xl p-6 hover:border-blue-400 transition-all">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                  COPY TRADE
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 rounded-xl mb-4 mx-auto w-fit">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-xl font-bold text-white mb-2">Portfolio de IA</h5>
                <div className="text-2xl font-bold text-white">
                  R$ 1.000,00
                  <span className="text-sm font-normal text-gray-400">/mês</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">quantbroker.com.br</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  'Day trade automático',
                  'Inteligência artificial',
                  'Renda R$ 1k a 4k/mês',
                  'Risco R$ 2k/mês'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('login')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Consultar
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="text-center mb-8">
              <h5 className="text-xl font-bold text-white mb-2">Plataforma Complementar</h5>
              <p className="text-gray-400">Gestão quantitativa avançada</p>
            </div>

            <div className="max-w-md mx-auto bg-gray-800 border border-green-500/50 rounded-xl p-6 hover:border-green-400 transition-all">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-green-500 to-green-700 p-4 rounded-xl mb-4 mx-auto w-fit">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-xl font-bold text-white mb-2">Plataforma Quant</h5>
                <p className="text-gray-400 text-sm mb-2">devhubtrader.com.br</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  'Automações',
                  'APIs integração',
                  'Backtesting',
                  'Algoritmos',
                  'Gestão quant',
                  'Monitor 24/7'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://devhubtrader.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-all block text-center"
              >
                Acessar DevHubTrader
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </a>
            </div>
          </div>
        </div>

    
       
   
      </div>
    </section>
  );
}