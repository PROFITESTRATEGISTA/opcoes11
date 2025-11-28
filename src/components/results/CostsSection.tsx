import React from 'react';
import { Calculator } from 'lucide-react';

interface CostsSectionProps {
  brokerageCosts: number;
  rollCosts: number;
  emolumentsCosts: number;
  taxCosts: number;
  totalOperations: number;
  totalRolls: number;
  selectedAsset?: string;
}

export default function CostsSection({
  brokerageCosts,
  rollCosts,
  emolumentsCosts,
  taxCosts,
  totalOperations,
  totalRolls,
  selectedAsset = 'all'
}: CostsSectionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const costItems = [
    {
      title: 'Corretagem',
      description: `${totalOperations} operações × R$ 2,50`,
      value: brokerageCosts
    },
    {
      title: 'Custos de Roll',
      description: 'Ajustes e reposicionamentos',
      value: rollCosts
    },
    {
      title: 'Emolumentos',
      description: '0,25% sobre volume negociado',
      value: emolumentsCosts
    },
    {
      title: 'Imposto de Renda',
      description: '15% sobre lucros',
      value: taxCosts
    }
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
      <div className="flex items-center mb-6">
        <Calculator className="w-6 h-6 text-red-400 mr-3" />
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white">Custos Operacionais</h3>
          {selectedAsset !== 'all' && (
            <p className="text-xs text-gray-400">Filtrado por: {selectedAsset}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {costItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-900/50 rounded-lg">
            <div>
              <p className="text-sm sm:text-base text-white font-medium">{item.title}</p>
              <p className="text-xs sm:text-sm text-gray-400">{item.description}</p>
            </div>
            <p className="text-sm sm:text-lg font-bold text-red-400">
              {formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}