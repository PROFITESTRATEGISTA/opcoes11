import React, { useState } from 'react';
import { 
  RotateCcw, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  Eye,
  Calculator,
  Activity,
  Trash2
} from 'lucide-react';
import { RollPosition, OptionStructure } from '../types/trading';

interface RollsMainPanelProps {
  rolls: RollPosition[];
  structures: OptionStructure[];
  onDeleteRoll: (rollId: string) => void;
}

export default function RollsMainPanel({ rolls, structures, onDeleteRoll }: RollsMainPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRoll, setSelectedRoll] = useState<RollPosition | null>(null);
  
  // Debug: Log rolls data
  console.log('RollsMainPanel - rolls recebidos:', rolls);
  console.log('RollsMainPanel - structures recebidas:', structures);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDeleteRoll = (rollId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta rolagem? Esta ação não pode ser desfeita.')) {
      onDeleteRoll(rollId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXECUTADO':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDENTE':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'CANCELADO':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStructureName = (structureId: string) => {
    const structure = structures.find(s => s.id === structureId);
    return structure?.nome || 'Estrutura não encontrada';
  };

  // Filter rolls
  const filteredRolls = rolls.filter(roll => {
    const structureName = getStructureName(roll.structureId);
    const matchesStatus = filterStatus === 'all' || roll.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      structureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roll.motivoRoll.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const totalRolls = rolls.length;
  const executedRolls = rolls.filter(r => r.status === 'EXECUTADO').length;
  const pendingRolls = rolls.filter(r => r.status === 'PENDENTE').length;
  const totalProfit = rolls.reduce((sum, roll) => sum + (roll.lucroRealizado || 0), 0);
  const totalCost = rolls.reduce((sum, roll) => sum + Math.abs(roll.custoRoll), 0);
  const averageProfit = totalRolls > 0 ? totalProfit / totalRolls : 0;
  const successRate = executedRolls > 0 ? (rolls.filter(r => r.status === 'EXECUTADO' && (r.lucroRealizado || 0) > 0).length / executedRolls) * 100 : 0;
  const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  const stats = [
    {
      title: 'Total de Rolagens',
      value: totalRolls,
      icon: RotateCcw,
      color: 'blue',
      format: (value: number) => value.toString()
    },
    {
      title: 'Rolagens Executadas',
      value: executedRolls,
      icon: Activity,
      color: 'green',
      format: (value: number) => value.toString()
    },
    {
      title: 'Lucro Total Realizado',
      value: totalProfit,
      icon: totalProfit >= 0 ? TrendingUp : TrendingDown,
      color: totalProfit >= 0 ? 'green' : 'red',
      format: formatCurrency
    },
    {
      title: 'Custo Total dos Rolls',
      value: totalCost,
      icon: DollarSign,
      color: 'orange',
      format: formatCurrency
    }
  ];

  const getColorClasses = (color: string, isBackground = false) => {
    const colors = {
      blue: isBackground ? 'bg-blue-500/10 border-blue-500/20' : 'text-blue-400',
      green: isBackground ? 'bg-green-500/10 border-green-500/20' : 'text-green-400',
      red: isBackground ? 'bg-red-500/10 border-red-500/20' : 'text-red-400',
      purple: isBackground ? 'bg-purple-500/10 border-purple-500/20' : 'text-purple-400',
      orange: isBackground ? 'bg-orange-500/10 border-orange-500/20' : 'text-orange-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Central de Rolagens</h2>
          <p className="text-gray-400">Strategos Partners - Gestão de rolagens</p>
        </div>
      </div>



      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por estrutura ou motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 sm:py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-w-0 flex-1 sm:flex-none"
              >
                <option value="all">Todos os Status</option>
                <option value="EXECUTADO">Executadas</option>
                <option value="PENDENTE">Pendentes</option>
                <option value="CANCELADO">Canceladas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Rolls List */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">
            Lista de Rolagens ({filteredRolls.length})
          </h3>
        </div>
        
        <div className="p-3 sm:p-6">
          {filteredRolls.length > 0 ? (
            <div className="space-y-4">
              {filteredRolls.map((roll, index) => (
                <div key={roll.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6 hover:border-gray-600 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                      <div className="bg-orange-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm sm:text-lg truncate">{getStructureName(roll.structureId)}</h4>
                        <p className="text-xs sm:text-sm text-gray-400">{formatDate(roll.dataRoll)}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(roll.status)}`}>
                        {roll.status}
                      </span>
                    </div>
                    <div className="text-right ml-2">
                      <div className={`text-sm sm:text-xl font-bold ${(roll.lucroRealizado || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(roll.lucroRealizado || 0) >= 0 ? '+' : ''}{formatCurrency(roll.lucroRealizado || 0)}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400">Lucro Realizado</p>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4">
                    <p className="text-sm font-medium text-gray-300 mb-2">Motivo do Roll:</p>
                    <p className="text-sm text-gray-400">{roll.motivoRoll}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm font-medium">Custo do Roll</p>
                      <p className={`text-sm sm:text-base font-bold ${roll.custoRoll >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {formatCurrency(roll.custoRoll)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm font-medium">ROI do Roll</p>
                      <p className={`text-sm sm:text-base font-bold ${
                        roll.custoRoll !== 0 
                          ? ((roll.lucroRealizado || 0) / Math.abs(roll.custoRoll)) >= 0 ? 'text-green-400' : 'text-red-400'
                          : 'text-gray-400'
                      }`}>
                        {roll.custoRoll !== 0 
                          ? `${Math.round(((roll.lucroRealizado || 0) / Math.abs(roll.custoRoll)) * 100)}%`
                          : 'N/A'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm font-medium">Pernas Originais</p>
                      <p className="text-sm sm:text-base font-bold text-white">{roll.originalLegs.length}</p>
                    </div>
                    
                    {roll.exercicioOpcoes?.houve && (
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Exercícios</p>
                        <p className="font-bold text-purple-400">{roll.exercicioOpcoes.opcoes.length}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => setSelectedRoll(roll)}
                      className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir esta rolagem? Esta ação não pode ser desfeita.')) {
                          handleDeleteRoll(roll.id);
                        }
                      }}
                      className="px-3 sm:px-4 py-2 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      title="Excluir rolagem"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <RotateCcw className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma rolagem encontrada</p>
              <p className="text-sm text-gray-500">As rolagens executadas aparecerão aqui</p>
            </div>
          )}
        </div>
      </div>

      {/* Roll Details Modal */}
      {selectedRoll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Detalhes da Rolagem</h3>
                  <p className="text-blue-200">{getStructureName(selectedRoll.structureId)}</p>
                </div>
                <button
                  onClick={() => setSelectedRoll(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-400 mb-1">Lucro Realizado</p>
                  <p className={`text-2xl font-bold ${(selectedRoll.lucroRealizado || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(selectedRoll.lucroRealizado || 0) >= 0 ? '+' : ''}{formatCurrency(selectedRoll.lucroRealizado || 0)}
                  </p>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-400 mb-1">Custo do Roll</p>
                  <p className={`text-2xl font-bold ${selectedRoll.custoRoll >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {formatCurrency(selectedRoll.custoRoll)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Data da Rolagem</p>
                  <p className="font-bold text-white">{formatDate(selectedRoll.dataRoll)}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm font-medium">Motivo</p>
                  <p className="font-bold text-white">{selectedRoll.motivoRoll}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm font-medium">Status</p>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedRoll.status)}`}>
                    {selectedRoll.status}
                  </span>
                </div>

                {selectedRoll.observacoes && (
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Observações</p>
                    <p className="font-bold text-white">{selectedRoll.observacoes}</p>
                  </div>
                )}

                {selectedRoll.exercicioOpcoes?.houve && (
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="font-medium text-white mb-3">Exercícios de Opções</h4>
                    <div className="space-y-3">
                      {selectedRoll.exercicioOpcoes.opcoes.map((exercicio, index) => (
                        <div key={index} className="bg-purple-500/10 border border-purple-500/20 rounded p-3 text-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-white">{exercicio.ativo}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              exercicio.tipo === 'CALL' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {exercicio.tipo}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                            <div>Strike: {formatCurrency(exercicio.strike)}</div>
                            <div>Qtd: {exercicio.quantidade}</div>
                            <div>Preço: {formatCurrency(exercicio.precoExercicio)}</div>
                            <div className={`font-bold ${exercicio.resultadoExercicio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {exercicio.resultadoExercicio >= 0 ? '+' : ''}{formatCurrency(exercicio.resultadoExercicio)}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-red-300">Custo Total de Exercício:</span>
                          <span className="font-bold text-red-400">
                            {formatCurrency(selectedRoll.exercicioOpcoes.custoTotalExercicio)}
                          </span>
                        </div>
                      </div>
                      
                      {selectedRoll.exercicioOpcoes.observacoesExercicio && (
                        <div className="bg-gray-900 border border-gray-700 rounded p-3">
                          <p className="text-xs text-gray-400 mb-1">Observações do Exercício:</p>
                          <p className="text-sm text-white">{selectedRoll.exercicioOpcoes.observacoesExercicio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-700">
                  <div>
                    <h4 className="font-medium text-white mb-3">Posições Originais ({selectedRoll.originalLegs.length})</h4>
                    <div className="space-y-2">
                      {selectedRoll.originalLegs.map((leg, index) => (
                        <div key={index} className="bg-blue-500/10 border border-blue-500/20 rounded p-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-white">{leg.ativo}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              leg.posicao === 'COMPRADA' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {leg.posicao}
                            </span>
                          </div>
                          <div className="mt-1 text-gray-400">
                            {leg.tipo} • Strike: {formatCurrency(leg.strike)} • Prêmio: {formatCurrency(leg.premio)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-3">Novas Posições ({selectedRoll.newLegs.length})</h4>
                    <div className="space-y-2">
                      {selectedRoll.newLegs.map((leg, index) => (
                        <div key={index} className="bg-green-500/10 border border-green-500/20 rounded p-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-white">{leg.ativo}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              leg.posicao === 'COMPRADA' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {leg.posicao}
                            </span>
                          </div>
                          <div className="mt-1 text-gray-400">
                            {leg.tipo} • Strike: {formatCurrency(leg.strike)} • Prêmio: {formatCurrency(leg.premio)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}