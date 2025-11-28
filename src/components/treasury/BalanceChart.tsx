import React, { useState, useMemo } from 'react';
import { BarChart3, Calendar, Filter } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

interface BalanceChartProps {
  cashFlowEntries: any[];
}

export default function BalanceChart({ cashFlowEntries }: BalanceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filter entries based on selected period and date range
  const filteredEntries = useMemo(() => {
    let filtered = [...cashFlowEntries];
    const now = new Date();

    // Apply period filter
    if (selectedPeriod !== 'all') {
      const cutoffDate = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'semester':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'custom':
          // Custom date range will be handled separately
          break;
      }

      if (selectedPeriod !== 'custom') {
        filtered = filtered.filter(entry => new Date(entry.date) >= cutoffDate);
      }
    }

    // Apply custom date range filter
    if (selectedPeriod === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });
    }

    return filtered;
  }, [cashFlowEntries, selectedPeriod, startDate, endDate]);

  const balanceChartData = {
    labels: filteredEntries.map(entry => formatDate(entry.date)),
    datasets: [
      {
        label: 'Saldo da Conta',
        data: filteredEntries.map(entry => Number(entry.balance)),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#1E40AF',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9CA3AF',
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `Saldo: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12
          }
        },
        grid: {
          color: '#374151'
        }
      },
      y: {
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12
          },
          callback: function(value: any) {
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0
            }).format(value);
          }
        },
        grid: {
          color: '#374151'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Calculate period statistics
  const periodStats = useMemo(() => {
    if (filteredEntries.length === 0) return null;

    const firstEntry = filteredEntries[0];
    const lastEntry = filteredEntries[filteredEntries.length - 1];
    const variation = lastEntry.balance - firstEntry.balance;
    const variationPercentage = firstEntry.balance !== 0 ? (variation / Math.abs(firstEntry.balance)) * 100 : 0;

    return {
      startBalance: firstEntry.balance,
      endBalance: lastEntry.balance,
      variation,
      variationPercentage,
      entries: filteredEntries.length
    };
  }, [filteredEntries]);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BarChart3 className="w-6 h-6 text-blue-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Evolução do Saldo</h3>
        </div>
        
        {/* Period Filter */}
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os períodos</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
            <option value="quarter">Último trimestre</option>
            <option value="semester">Último semestre</option>
            <option value="year">Último ano</option>
            <option value="custom">Período personalizado</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      {selectedPeriod === 'custom' && (
        <div className="mb-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
          <div className="flex items-center mb-3">
            <Calendar className="w-5 h-5 text-blue-400 mr-2" />
            <h4 className="text-sm font-medium text-white">Período Personalizado</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Period Statistics */}
      {periodStats && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Saldo Final</p>
            <p className="text-sm font-bold text-blue-400">
              {formatCurrency(periodStats.endBalance)}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Variação</p>
            <p className={`text-sm font-bold ${periodStats.variation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {periodStats.variation >= 0 ? '+' : ''}{formatCurrency(periodStats.variation)}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Variação %</p>
            <p className={`text-sm font-bold ${periodStats.variationPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {periodStats.variationPercentage >= 0 ? '+' : ''}{periodStats.variationPercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Chart */}
      <div className="h-96">
        {filteredEntries.length > 0 ? (
          <Line data={balanceChartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum dado encontrado</p>
              <p className="text-sm text-gray-500">
                {selectedPeriod === 'custom' && (!startDate || !endDate) 
                  ? 'Selecione as datas inicial e final'
                  : 'Tente ajustar o filtro de período'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          {filteredEntries.length > 0 
            ? `Exibindo ${filteredEntries.length} lançamento${filteredEntries.length > 1 ? 's' : ''} no período selecionado`
            : 'Nenhum lançamento no período selecionado'
          }
        </p>
      </div>
    </div>
  );
}