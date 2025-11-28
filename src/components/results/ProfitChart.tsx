import React from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { BarChart3, Filter, Calendar } from 'lucide-react';
import { OptionStructure, RollPosition, ExerciseRecord } from '../../types/trading';

interface ProfitChartProps {
  profitData: any[];
  structures: OptionStructure[];
  rolls: RollPosition[];
  exercises: ExerciseRecord[];
  selectedCategory: string;
  selectedPeriod: string;
  selectedAsset: string;
  startDate: string;
  endDate: string;
  allAssets: string[];
  onCategoryChange: (category: string) => void;
  onPeriodChange: (period: string) => void;
  onAssetChange: (asset: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export default function ProfitChart({
  profitData,
  structures,
  rolls,
  exercises,
  selectedCategory,
  selectedPeriod,
  selectedAsset,
  startDate,
  endDate,
  allAssets,
  onCategoryChange,
  onPeriodChange,
  onAssetChange,
  onStartDateChange,
  onEndDateChange
}: ProfitChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const profitChartData = {
    labels: profitData.map(entry => new Date(entry.date).toLocaleDateString('pt-BR')),
    datasets: [
      ...(selectedCategory === 'all' || selectedCategory === 'structures' ? [{
        label: 'Lucro Estruturas',
        data: profitData.map(entry => entry.cumulativeStructures),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#1E40AF',
        pointRadius: 4,
        pointHoverRadius: 6
      }] : []),
      ...(selectedCategory === 'all' || selectedCategory === 'rolls' ? [{
        label: 'Lucro Rolagens',
        data: profitData.map(entry => entry.cumulativeRolls),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#D97706',
        pointRadius: 4,
        pointHoverRadius: 6
      }] : []),
      ...(selectedCategory === 'all' || selectedCategory === 'exercises' ? [{
        label: 'Lucro Exercícios',
        data: profitData.map(entry => entry.cumulativeExercises),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#7C3AED',
        pointRadius: 4,
        pointHoverRadius: 6
      }] : []),
      ...(selectedCategory === 'all' ? [{
        label: 'Lucro Total',
        data: profitData.map(entry => entry.cumulativeTotal),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#059669',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3
      }] : [])
    ]
  };

  console.log('🔍 ProfitChart - Chart data:', {
    profitDataLength: profitData.length,
    labels: profitChartData.labels,
    datasets: profitChartData.datasets.length,
    selectedCategory,
    selectedPeriod
  });

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9CA3AF',
          font: { size: 14 }
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
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#9CA3AF', font: { size: 12 } },
        grid: { color: '#374151' }
      },
      y: {
        ticks: {
          color: '#9CA3AF',
          font: { size: 12 },
          callback: function(value: any) {
            return formatCurrency(value);
          }
        },
        grid: { color: '#374151' }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BarChart3 className="w-6 h-6 text-green-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Evolução dos Lucros</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedAsset}
            onChange={(e) => onAssetChange(e.target.value)}
            className="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Ativos</option>
            {allAssets.map(asset => (
              <option key={asset} value={asset}>{asset}</option>
            ))}
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as categorias</option>
            <option value="structures">Apenas Estruturas</option>
            <option value="rolls">Apenas Rolagens</option>
            <option value="exercises">Apenas Exercícios</option>
          </select>
          
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os períodos</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último ano</option>
            <option value="custom">Período personalizado</option>
          </select>
        </div>
      </div>

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
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      <div className="h-96">
        {profitData.length > 0 ? (
          <>
            <Line data={profitChartData} options={options} />
            {/* Debug info */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              Debug: {profitData.length} pontos de dados | Última entrada: {profitData[profitData.length - 1]?.total ? formatCurrency(profitData[profitData.length - 1].total) : 'N/A'}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum dado de lucro encontrado</p>
              <p className="text-sm text-gray-500">
                {selectedPeriod === 'custom' && (!startDate || !endDate) 
                  ? 'Selecione as datas inicial e final'
                  : 'Tente ajustar os filtros de período ou categoria'
                }
              </p>
              <div className="mt-4 p-3 bg-gray-900 rounded-lg text-xs text-left">
                <p className="text-gray-400 mb-2">Debug Info:</p>
                <p>Estruturas: {structures.length}</p>
                <p>Estruturas ativas: {structures.filter(s => s.status === 'ATIVA').length}</p>
                <p>Estruturas finalizadas: {structures.filter(s => s.status === 'FINALIZADA').length}</p>
                <p>Rolagens: {rolls.length}</p>
                <p>Exercícios: {exercises.length}</p>
                <p>Período: {selectedPeriod}</p>
                <p>Categoria: {selectedCategory}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {profitData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Primeiro Lucro</p>
            <p className="text-sm font-bold text-blue-400">
              {formatCurrency(profitData[0]?.total || 0)}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Último Lucro</p>
            <p className="text-sm font-bold text-blue-400">
              {formatCurrency(profitData[profitData.length - 1]?.total || 0)}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Lucro Médio</p>
            <p className="text-sm font-bold text-green-400">
              {formatCurrency(profitData.reduce((sum, entry) => sum + entry.total, 0) / profitData.length)}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Total no Período</p>
            <p className={`text-sm font-bold ${
              profitData.reduce((sum, entry) => sum + entry.total, 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatCurrency(profitData.reduce((sum, entry) => sum + entry.total, 0))}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          {profitData.length > 0 
            ? `Exibindo ${profitData.length} operação${profitData.length > 1 ? 'ões' : ''} ${selectedAsset !== 'all' ? `para ${selectedAsset} ` : ''}no período selecionado`
            : `Nenhuma operação ${selectedAsset !== 'all' ? `para ${selectedAsset} ` : ''}no período selecionado`
          }
        </p>
      </div>
    </div>
  );
}