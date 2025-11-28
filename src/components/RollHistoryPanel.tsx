import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw, DollarSign, TrendingUp, TrendingDown, Calculator, BarChart3, PieChart, Target } from 'lucide-react';
import { RollPosition, OptionStructure } from '../types/trading';

interface RollHistoryPanelProps {
  rolls: RollPosition[];
  structures: OptionStructure[];
}

export default function RollHistoryPanel({ rolls, structures }: RollHistoryPanelProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoll, setSelectedRoll] = useState<RollPosition | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getRollsForDate = (day: number) => {
    if (!day) return [];
    
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const targetDateString = targetDate.toISOString().split('T')[0];
    
    return rolls.filter(roll => roll.dataRoll === targetDateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getTotalRollProfit = () => {
    return rolls.reduce((sum, roll) => sum + (roll.lucroRealizado || 0), 0);
  };

  const getTotalRollCost = () => {
    return rolls.reduce((sum, roll) => sum + roll.custoRoll, 0);
  };

  const getSuccessfulRolls = () => {
    return rolls.filter(roll => (roll.lucroRealizado || 0) > 0).length;
  };

  const getAverageRollProfit = () => {
    if (rolls.length === 0) return 0;
    return getTotalRollProfit() / rolls.length;
  };

  const getStructureName = (structureId: string) => {
    const structure = structures.find(s => s.id === structureId);
    return structure?.nome || 'Estrutura não encontrada';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Calendar className="w-8 h-8 text-blue-400 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-white">Histórico de Rolagens</h2>
          <p className="text-gray-400">Análise completa de performance das rolagens</p>
        </div>
      </div>

      {/* Summary Stats */}
      {/* Calendar */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          
          <h3 className="text-xl font-semibold text-white capitalize">
            {getMonthName(currentDate)}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-gray-800">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-300 border-r border-gray-700 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {getDaysInMonth(currentDate).map((day, index) => {
              const rollsForDay = day ? getRollsForDate(day) : [];
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border-r border-b border-gray-700 last:border-r-0 ${
                    day ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-800'
                  }`}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium text-white mb-2">{day}</div>
                      <div className="space-y-1">
                        {rollsForDay.slice(0, 2).map(roll => (
                          <button
                            key={roll.id}
                            onClick={() => setSelectedRoll(roll)}
                            className="w-full text-left p-1 bg-orange-500/20 hover:bg-orange-500/30 rounded text-xs transition-colors"
                          >
                            <div className="flex items-center">
                              <RotateCcw className="w-3 h-3 text-orange-400 mr-1" />
                              <span className="truncate text-orange-300">
                                {getStructureName(roll.structureId).substring(0, 15)}...
                              </span>
                            </div>
                            <div className={`text-xs font-medium ${
                              (roll.lucroRealizado || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(roll.lucroRealizado || 0)}
                            </div>
                          </button>
                        ))}
                        
                        {rollsForDay.length > 2 && (
                          <div className="text-xs text-center text-gray-500 mt-1">
                            +{rollsForDay.length - 2} mais
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Roll Details */}
      {selectedRoll && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <RotateCcw className="w-6 h-6 text-orange-400 mr-3" />
              <div>
                <h3 className="text-lg font-bold text-white">Detalhes da Rolagem</h3>
                <p className="text-orange-300 text-sm">{formatDate(selectedRoll.dataRoll)}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedRoll(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-white mb-2">
              {getStructureName(selectedRoll.structureId)}
            </h4>
            <p className="text-gray-300 text-sm">{selectedRoll.motivoRoll}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-sm font-medium text-green-300">Lucro Realizado</p>
              <p className={`text-lg font-bold ${
                (selectedRoll.lucroRealizado || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(selectedRoll.lucroRealizado || 0)}
              </p>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
              <p className="text-sm font-medium text-orange-300">Custo do Roll</p>
              <p className={`text-lg font-bold ${
                selectedRoll.custoRoll >= 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {formatCurrency(selectedRoll.custoRoll)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-300">ROI do Roll</p>
              <p className={`text-lg font-bold ${
                selectedRoll.custoRoll !== 0 
                  ? ((selectedRoll.lucroRealizado || 0) / Math.abs(selectedRoll.custoRoll)) >= 0 ? 'text-green-400' : 'text-red-400'
                  : 'text-gray-400'
              }`}>
                {selectedRoll.custoRoll !== 0 
                  ? `${Math.round(((selectedRoll.lucroRealizado || 0) / Math.abs(selectedRoll.custoRoll)) * 100)}%`
                  : 'N/A'
                }
              </p>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <p className="text-sm font-medium text-purple-300">Status</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                selectedRoll.status === 'EXECUTADO' ? 'bg-green-500/20 text-green-400' : 
                selectedRoll.status === 'PENDENTE' ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-red-500/20 text-red-400'
              }`}>
                {selectedRoll.status}
              </span>
            </div>
          </div>

          {selectedRoll.observacoes && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-300 mb-1">Observações:</p>
              <p className="text-gray-400 text-sm">{selectedRoll.observacoes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}