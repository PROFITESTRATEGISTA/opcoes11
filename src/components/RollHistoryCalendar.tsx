import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw, DollarSign, TrendingUp, TrendingDown, X, Calculator, BarChart3, PieChart } from 'lucide-react';
import { RollPosition, OptionStructure } from '../types/trading';

interface RollHistoryCalendarProps {
  rolls: RollPosition[];
  structures: OptionStructure[];
  onClose: () => void;
}

export default function RollHistoryCalendar({ rolls, structures, onClose }: RollHistoryCalendarProps) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Histórico de Rolagens</h2>
                <p className="text-blue-200">Visualização em calendário de todas as rolagens executadas</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <RotateCcw className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Total de Rolls</p>
                  <p className="text-2xl font-bold text-blue-900">{rolls.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">Lucro Total Realizado</p>
                  <p className={`text-2xl font-bold ${getTotalRollProfit() >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {formatCurrency(getTotalRollProfit())}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-800">Rolls Executados</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {rolls.filter(r => r.status === 'EXECUTADO').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <Calculator className="w-6 h-6 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Lucro Médio por Roll</p>
                  <p className={`text-2xl font-bold ${getAverageRollProfit() >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {formatCurrency(getAverageRollProfit())}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-6 h-6 text-gray-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Análise de Performance</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <PieChart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700 mb-1">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {rolls.length > 0 ? Math.round((getSuccessfulRolls() / rolls.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700 mb-1">Custo Total dos Rolls</p>
                    <p className={`text-2xl font-bold ${getTotalRollCost() >= 0 ? 'text-red-900' : 'text-green-900'}`}>
                      {formatCurrency(Math.abs(getTotalRollCost()))}
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700 mb-1">ROI dos Rolls</p>
                    <p className={`text-2xl font-bold ${
                      getTotalRollCost() !== 0 
                        ? (getTotalRollProfit() / Math.abs(getTotalRollCost())) >= 0 ? 'text-green-900' : 'text-red-900'
                        : 'text-gray-900'
                    }`}>
                      {getTotalRollCost() !== 0 
                        ? `${Math.round((getTotalRollProfit() / Math.abs(getTotalRollCost())) * 100)}%`
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-semibold text-gray-900 capitalize">
              {getMonthName(currentDate)}
            </h3>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 bg-gray-50">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
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
                    className={`min-h-[100px] p-2 border-r border-b border-gray-200 last:border-r-0 ${
                      day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                    }`}
                  >
                    {day && (
                      <>
                        <div className="text-sm font-medium text-gray-900 mb-2">{day}</div>
                        <div className="space-y-1">
                          {rollsForDay.map(roll => (
                            <button
                              key={roll.id}
                              onClick={() => setSelectedRoll(roll)}
                              className="w-full text-left p-1 bg-orange-100 hover:bg-orange-200 rounded text-xs transition-colors"
                            >
                              <div className="flex items-center">
                                <RotateCcw className="w-3 h-3 text-orange-600 mr-1" />
                                <span className="truncate text-orange-800">
                                  {getStructureName(roll.structureId).substring(0, 15)}...
                                </span>
                              </div>
                              <div className={`text-xs font-medium ${
                                (roll.lucroRealizado || 0) >= 0 ? 'text-green-600' : 'text-red-600'
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

          {/* Roll Details Modal */}
          {selectedRoll && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <RotateCcw className="w-6 h-6 mr-2" />
                      <div>
                        <h3 className="font-bold">Detalhes da Rolagem</h3>
                        <p className="text-orange-100 text-sm">{formatDate(selectedRoll.dataRoll)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRoll(null)}
                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {getStructureName(selectedRoll.structureId)}
                    </h4>
                    <p className="text-gray-700 text-sm">{selectedRoll.motivoRoll}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800">Lucro Realizado</p>
                      <p className={`text-lg font-bold ${
                        (selectedRoll.lucroRealizado || 0) >= 0 ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {formatCurrency(selectedRoll.lucroRealizado || 0)}
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-orange-800">Custo do Roll</p>
                      <p className={`text-lg font-bold ${
                        selectedRoll.custoRoll >= 0 ? 'text-red-900' : 'text-green-900'
                      }`}>
                        {formatCurrency(selectedRoll.custoRoll)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-800">ROI do Roll</p>
                      <p className={`text-lg font-bold ${
                        selectedRoll.custoRoll !== 0 
                          ? ((selectedRoll.lucroRealizado || 0) / Math.abs(selectedRoll.custoRoll)) >= 0 ? 'text-green-900' : 'text-red-900'
                          : 'text-gray-900'
                      }`}>
                        {selectedRoll.custoRoll !== 0 
                          ? `${Math.round(((selectedRoll.lucroRealizado || 0) / Math.abs(selectedRoll.custoRoll)) * 100)}%`
                          : 'N/A'
                        }
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-purple-800">Status</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRoll.status)}`}>
                        {selectedRoll.status}
                      </span>
                    </div>
                  </div>

                  {selectedRoll.observacoes && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800 mb-1">Observações:</p>
                      <p className="text-gray-700 text-sm">{selectedRoll.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}