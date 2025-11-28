import React from 'react';
import { DollarSign, Calculator, Target } from 'lucide-react';
import { OptionLeg } from '../types/trading';

interface StructureSummaryProps {
  legs: OptionLeg[];
  premioLiquido: number;
  custoMontagem: number;
}

export default function StructureSummary({ legs, premioLiquido, custoMontagem }: StructureSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 text-green-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-green-800">Prêmio Líquido</p>
            <p className={`text-2xl font-bold ${premioLiquido >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {formatCurrency(premioLiquido)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center">
          <Calculator className="w-6 h-6 text-orange-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-orange-800">Custo Montagem</p>
            <p className="text-2xl font-bold text-orange-900">
              {formatCurrency(custoMontagem)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <Target className="w-6 h-6 text-purple-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-purple-800">Total de Pernas</p>
            <p className="text-2xl font-bold text-purple-900">{legs.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}