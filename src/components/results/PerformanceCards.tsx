import React from 'react';
import { TrendingUp, TrendingDown, Percent, Receipt } from 'lucide-react';

interface PerformanceCardsProps {
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  totalCosts: number;
  selectedAsset?: string;
  allAssets?: string[];
  onAssetChange?: (asset: string) => void;
}

export default function PerformanceCards({ 
  grossProfit, 
  netProfit, 
  profitMargin, 
  totalCosts,
  selectedAsset = 'all',
  allAssets = [],
  onAssetChange
}: PerformanceCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const cards = [
    {
      title: 'Lucro Bruto',
      value: grossProfit,
      icon: TrendingUp,
      color: grossProfit >= 0 ? 'green' : 'red',
      description: 'Resultado antes dos custos',
      format: formatCurrency
    },
    {
      title: 'Lucro Líquido',
      value: netProfit,
      icon: netProfit >= 0 ? TrendingUp : TrendingDown,
      color: netProfit >= 0 ? 'green' : 'red',
      description: 'Resultado após todos os custos',
      format: formatCurrency
    },
    {
      title: 'Margem de Lucro',
      value: profitMargin,
      icon: Percent,
      color: profitMargin >= 0 ? 'green' : 'red',
      description: 'Eficiência operacional',
      format: formatPercentage
    },
    {
      title: 'Custos Totais',
      value: totalCosts,
      icon: Receipt,
      color: 'orange',
      description: 'Todos os custos operacionais',
      format: formatCurrency
    }
  ];

  const getColorClasses = (color: string, isBackground = false) => {
    const colors = {
      green: isBackground ? 'bg-green-500/10 border-green-500/20' : 'text-green-400',
      red: isBackground ? 'bg-red-500/10 border-red-500/20' : 'text-red-400',
      orange: isBackground ? 'bg-orange-500/10 border-orange-500/20' : 'text-orange-400'
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  return (
    <div className="space-y-6">
      {/* Asset Filter */}
      {onAssetChange && allAssets.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Filtrar por Ativo</h3>
            <div className="flex items-center space-x-3">
              <select
                value={selectedAsset}
                onChange={(e) => onAssetChange(e.target.value)}
                className="bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Ativos</option>
                {allAssets.map(asset => (
                  <option key={asset} value={asset}>{asset}</option>
                ))}
              </select>
              {selectedAsset !== 'all' && (
                <button
                  onClick={() => onAssetChange('all')}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Limpar Filtro
                </button>
              )}
            </div>
          </div>
          
          {selectedAsset !== 'all' && (
            <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 font-medium">
                📊 Exibindo resultados apenas para: <span className="font-bold">{selectedAsset}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {cards.map((card, index) => (
        <div key={index} className={`bg-gray-800 border rounded-xl p-4 sm:p-6 ${getColorClasses(card.color, true)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg bg-gray-900/50`}>
              <card.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${getColorClasses(card.color)}`} />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-400">{card.title}</h3>
            <p className={`text-lg sm:text-2xl font-bold ${getColorClasses(card.color)}`}>
              {card.format(card.value)}
            </p>
            <p className="text-xs text-gray-500 hidden sm:block">{card.description}</p>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}