import React from 'react';
import { PieChart } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { OptionStructure } from '../../types/trading';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  marketPrice: number;
  guaranteeReleased: number;
  usedAsGuarantee: boolean;
  type: 'STOCK' | 'LFT';
}

interface GuaranteeUsageChartProps {
  assets: Asset[];
  structures: OptionStructure[];
  totalGuaranteeAvailable: number;
  guaranteeUsed: number;
}

export default function GuaranteeUsageChart({ assets, structures, totalGuaranteeAvailable, guaranteeUsed }: GuaranteeUsageChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular garantias
  const totalGuaranteeFromAssets = assets.reduce((sum, asset) => 
    sum + ((asset.quantity * asset.marketPrice * asset.guaranteeReleased) / 100), 0
  );
  
  // Calcular margem necessária para estruturas ativas
  const marginRequired = structures
    .filter(s => s.status === 'ATIVA')
    .reduce((sum, structure) => {
      return sum + structure.legs.reduce((legSum, leg) => {
        if (leg.posicao === 'VENDIDA') {
          if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
            // Opções vendidas: 15% do valor nocional como margem
            return legSum + (leg.strike * leg.quantidade * 0.15);
          } else if (leg.tipo === 'ACAO') {
            // Ações vendidas: 100% do valor como margem
            return legSum + (leg.precoEntrada || 0) * leg.quantidade;
          }
        }
        return legSum;
      }, 0);
    }, 0);
  
  const guaranteeFree = Math.max(0, totalGuaranteeAvailable - marginRequired);

  const guaranteeData = [
    {
      label: 'Garantia Utilizada',
      value: marginRequired,
      color: '#EF4444',
      percentage: totalGuaranteeAvailable > 0 ? (marginRequired / totalGuaranteeAvailable) * 100 : 0
    },
    {
      label: 'Garantia Livre',
      value: guaranteeFree,
      color: '#10B981',
      percentage: totalGuaranteeAvailable > 0 ? (guaranteeFree / totalGuaranteeAvailable) * 100 : 0
    }
  ];

  const chartData = {
    labels: guaranteeData.map(item => item.label),
    datasets: [
      {
        data: guaranteeData.map(item => item.value),
        backgroundColor: guaranteeData.map(item => item.color),
        borderColor: guaranteeData.map(item => item.color),
        borderWidth: 2
      }
    ]
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#FFFFFF',
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i] as number;
                const percentage = guaranteeData[i]?.percentage || 0;
                return {
                  text: `${label}: ${formatCurrency(value)} (${percentage.toFixed(1)}%)`,
                  fillStyle: data.datasets[0].backgroundColor?.[i] as string,
                  strokeStyle: data.datasets[0].borderColor?.[i] as string,
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                  fontColor: '#FFFFFF'
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const percentage = guaranteeData[context.dataIndex]?.percentage || 0;
            return `${context.label}: ${formatCurrency(value)} (${percentage.toFixed(1)}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <PieChart className="w-6 h-6 text-orange-400 mr-3" />
        <h3 className="text-lg font-semibold text-white">Garantia Utilizada</h3>
      </div>
      
      {totalGuaranteeAvailable > 0 ? (
        <>
          <div className="h-64 mb-4">
            <Pie data={chartData} options={options} />
          </div>
          
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <div className="text-lg font-bold text-orange-400">
                {formatCurrency(totalGuaranteeAvailable)}
              </div>
              <div className="text-sm text-gray-400">Total Disponível</div>
            </div>
            
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <div className="text-lg font-bold text-red-400">
                {formatCurrency(guaranteeUsed)}
              </div>
              <div className="text-sm text-gray-400">Em Uso</div>
            </div>
            
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <div className="text-lg font-bold text-green-400">
                {formatCurrency(guaranteeFree)}
              </div>
              <div className="text-sm text-gray-400">Livre</div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <PieChart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhuma garantia disponível</p>
          <p className="text-sm text-gray-500">Adicione ativos para liberar garantias</p>
        </div>
      )}
    </div>
  );
}