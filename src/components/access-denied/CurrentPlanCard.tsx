import React from 'react';

interface CurrentPlanCardProps {
  userPlan: any;
}

export default function CurrentPlanCard({ userPlan }: CurrentPlanCardProps) {
  const formatCurrency = (value: number) => {
    if (value === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-center space-x-4 mb-4">
        <div className="bg-gray-700 p-3 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Plano Atual</h4>
            <p className="text-gray-400">{userPlan?.name || 'Sem Consultoria'}</p>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-white">Valor</h4>
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
  );
}