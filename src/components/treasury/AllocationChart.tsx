import React from 'react';
import { PieChart } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

interface AssetAllocation {
  type: 'CASH' | 'FIXED_INCOME' | 'VARIABLE_INCOME';
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

interface AllocationChartProps {
  assetAllocation: AssetAllocation[];
}

export default function AllocationChart({ assetAllocation }: AllocationChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const allocationChartData = {
    labels: assetAllocation.map(item => item.label),
    datasets: [
      {
        data: assetAllocation.map(item => item.amount),
        backgroundColor: assetAllocation.map(item => item.color),
        borderColor: assetAllocation.map(item => item.color),
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
                const percentage = assetAllocation[i]?.percentage || 0;
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
            const percentage = assetAllocation[context.dataIndex]?.percentage || 0;
            return `${context.label}: ${formatCurrency(value)} (${percentage.toFixed(1)}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <PieChart className="w-6 h-6 text-purple-400 mr-3" />
        <h3 className="text-lg font-semibold text-white">Alocação de Ativos</h3>
      </div>
      <div className="h-64">
        <Pie data={allocationChartData} options={options} />
      </div>
    </div>
  );
}