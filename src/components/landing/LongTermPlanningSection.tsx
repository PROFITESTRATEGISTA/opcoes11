import React from 'react';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Shield, Target, Users, Calculator, Globe, Heart, Home } from 'lucide-react';
import type { ChartOptions } from 'chart.js';

export default function LongTermPlanningSection() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Dados do gráfico de planejamento de longo prazo (CDI + 3% a.a.)
  const years = Array.from({ length: 21 }, (_, i) => 2024 + i);
  const cdiRate = 0.105; // 10.5% a.a. (CDI atual)
  const strategosRate = cdiRate + 0.03; // CDI + 3% a.a.
  const initialInvestment = 100000; // R$ 100.000 inicial

  const cdiProjection = years.map((year, index) => {
    return initialInvestment * Math.pow(1 + cdiRate, index);
  });

  const strategosProjection = years.map((year, index) => {
    return initialInvestment * Math.pow(1 + strategosRate, index);
  });

  const planningChartData = {
    labels: years.map(year => year.toString()),
    datasets: [
      {
        label: 'CDI (10,5% a.a.)',
        data: cdiProjection,
        borderColor: '#6B7280',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#6B7280',
        pointBorderColor: '#4B5563',
        pointRadius: 3,
        pointHoverRadius: 5
      },
      {
        label: 'Strategos Partners (CDI + 3% a.a.)',
        data: strategosProjection,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#059669',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: window.innerWidth < 768 ? 1.2 : 2,
    plugins: {
      legend: {
        position: window.innerWidth < 768 ? 'bottom' : 'top',
        labels: {
          color: '#F9FAFB',
          font: { size: window.innerWidth < 768 ? 10 : 14 },
          padding: window.innerWidth < 768 ? 10 : 20,
          usePointStyle: true,
          boxWidth: window.innerWidth < 768 ? 8 : 12
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
        ticks: { 
          color: '#9CA3AF', 
          font: { size: window.innerWidth < 768 ? 8 : 12 },
          maxRotation: window.innerWidth < 768 ? 45 : 0,
          maxTicksLimit: window.innerWidth < 768 ? 6 : 12
        },
        grid: { color: '#374151' }
      },
      y: {
        ticks: {
          color: '#9CA3AF',
          font: { size: window.innerWidth < 768 ? 8 : 12 },
          callback: function(value: any) {
            if (window.innerWidth < 768) {
              // Formato compacto para mobile
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                notation: 'compact',
                maximumFractionDigits: 0
              }).format(value);
            }
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              maximumFractionDigits: 0
            }).format(value);
          }
        },
        grid: { color: '#374151' }
      }
    }
  };

  // Dados da carteira de dividendos para aposentadoria
  const dividendYears = Array.from({ length: 31 }, (_, i) => 2024 + i);
  const monthlyContribution = 2000; // R$ 2.000/mês
  const annualDividendYield = 0.08; // 8% a.a. de dividend yield

  const dividendPortfolioValue = dividendYears.map((year, index) => {
    // Valor acumulado com aportes mensais
    const totalContributions = monthlyContribution * 12 * index;
    // Crescimento com reinvestimento de dividendos
    const compoundGrowth = totalContributions * Math.pow(1 + annualDividendYield, index);
    return compoundGrowth;
  });

  const monthlyDividendIncome = dividendYears.map((year, index) => {
    const portfolioValue = dividendPortfolioValue[index];
    return (portfolioValue * annualDividendYield) / 12; // Renda mensal de dividendos
  });

  const dividendChartData = {
    labels: dividendYears.map(year => year.toString()),
    datasets: [
      {
        label: 'Valor da Carteira',
        data: dividendPortfolioValue,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#1E40AF',
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y'
      },
      {
        label: 'Renda Mensal de Dividendos',
        data: monthlyDividendIncome,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#059669',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
        yAxisID: 'y1'
      }
    ]
  };

  const dividendChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: window.innerWidth < 768 ? 1.2 : 2,
    plugins: {
      legend: {
        position: window.innerWidth < 768 ? 'bottom' : 'top',
        labels: {
          color: '#F9FAFB',
          font: { size: window.innerWidth < 768 ? 10 : 14 },
          padding: window.innerWidth < 768 ? 10 : 20,
          usePointStyle: true,
          boxWidth: window.innerWidth < 768 ? 8 : 12
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
        ticks: { 
          color: '#9CA3AF', 
          font: { size: window.innerWidth < 768 ? 8 : 12 },
          maxRotation: window.innerWidth < 768 ? 45 : 0,
          maxTicksLimit: window.innerWidth < 768 ? 6 : 12
        },
        grid: { color: '#374151' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          color: '#9CA3AF',
          font: { size: window.innerWidth < 768 ? 8 : 12 },
          callback: function(value: any) {
            if (window.innerWidth < 768) {
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                notation: 'compact',
                maximumFractionDigits: 0
              }).format(value);
            }
            return formatCurrency(value);
          }
        },
        grid: { color: '#374151' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: {
          color: '#10B981',
          font: { size: window.innerWidth < 768 ? 8 : 12 },
          callback: function(value: any) {
            if (window.innerWidth < 768) {
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                notation: 'compact',
                maximumFractionDigits: 0
              }).format(value);
            }
            return formatCurrency(value);
          }
        },
        grid: {
          drawOnChartArea: false,
        }
      }
    }
  };

  return (
    <section className="py-20 bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
     

  

        {/* Vantagens Competitivas */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 sm:p-8">
          <div className="text-center mb-8">
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-4">Vantagens da Strategos Partners</h4>
            <p className="text-gray-300 text-sm sm:text-base">Operações estruturadas com foco no cliente</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center p-4 sm:p-6">
              <div className="bg-green-500/20 p-3 sm:p-4 rounded-xl mb-4 mx-auto w-fit">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              </div>
              <h5 className="text-base sm:text-lg font-bold text-white mb-3">Sem Comissionamento</h5>
              <p className="text-gray-300 text-xs sm:text-sm">
                Operações estruturadas com foco total no cliente, sem conflitos de interesse
              </p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="bg-blue-500/20 p-3 sm:p-4 rounded-xl mb-4 mx-auto w-fit">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              </div>
              <h5 className="text-base sm:text-lg font-bold text-white mb-3">Sem Spread</h5>
              <p className="text-gray-300 text-xs sm:text-sm">
                Preços justos e transparentes, sem margens ocultas ou spreads abusivos
              </p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="bg-purple-500/20 p-3 sm:p-4 rounded-xl mb-4 mx-auto w-fit">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              </div>
              <h5 className="text-base sm:text-lg font-bold text-white mb-3">Baixo Risco</h5>
              <p className="text-gray-300 text-xs sm:text-sm">
                Estratégias conservadoras com proteção de capital e retornos consistentes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}