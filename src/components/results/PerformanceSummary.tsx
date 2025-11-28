import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calculator, AlertTriangle } from 'lucide-react';

interface PerformanceSummaryProps {
  grossProfit: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  selectedAsset?: string;
}

export default function PerformanceSummary({
  grossProfit,
  totalCosts,
  netProfit,
  profitMargin,
  selectedAsset = 'all'
}: PerformanceSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <TrendingUp className="w-6 h-6 text-purple-400 mr-3" />
        <div>
          <h3 className="text-lg font-semibold text-white">Resumo de Performance</h3>
          {selectedAsset !== 'all' && (
            <p className="text-sm text-gray-400">Ativo: {selectedAsset}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-gray-900/50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400 mb-1">
            {formatCurrency(grossProfit)}
          </p>
          <p className="text-sm text-gray-400">Receita Bruta</p>
        </div>

        <div className="text-center p-4 bg-gray-900/50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Calculator className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400 mb-1">
            {formatCurrency(totalCosts)}
          </p>
          <p className="text-sm text-gray-400">Custos Totais</p>
        </div>

        <div className="text-center p-4 bg-gray-900/50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            {netProfit >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-400" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-400" />
            )}
          </div>
          <p className={`text-2xl font-bold mb-1 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(netProfit)}
          </p>
          <p className="text-sm text-gray-400">Lucro Líquido</p>
        </div>
      </div>

      {profitMargin < 10 && grossProfit > 0 && (
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
            <div>
              <p className="text-yellow-400 font-medium">Atenção: Margem de lucro baixa</p>
              <p className="text-sm text-gray-400 mt-1">
                Considere revisar estratégias para otimizar custos operacionais
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}