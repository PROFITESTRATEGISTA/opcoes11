import React from 'react';
import { Shield } from 'lucide-react';

interface AccessDeniedHeaderProps {
  userPlan: any;
}

export default function AccessDeniedHeader({ userPlan }: AccessDeniedHeaderProps) {
  const formatCurrency = (value: number) => {
    if (value === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center mb-8">
      <div className="bg-red-500/20 p-6 rounded-full w-fit mx-auto mb-6">
        <Shield className="w-16 h-16 text-red-400" />
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-4">
        Acesso Restrito ao OptionsMaster Pro
      </h1>
      
      <p className="text-gray-300 mb-2">
        Pronto para Ter Renda Passiva com Consultoria Especializada?
        Sua conta atual não possui acesso à consultoria especializada.
      </p>
      
      <p className="text-gray-300 mb-6">
        Junte-se aos investidores que já utilizam a OptionsMaster Pro para gerar 
        renda passiva com operações estruturadas e consultoria especializada.
      </p>
    </div>
  );
}