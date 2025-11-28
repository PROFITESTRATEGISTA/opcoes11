import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, Target, Activity, Filter, Search, RotateCcw } from 'lucide-react';
import { OptionStructure, TradingOperation, RollPosition } from '../types/trading';

interface AllOperationsPanelProps {
  structures: OptionStructure[];
  rolls: RollPosition[];
  onClose: () => void;
}

export default function AllOperationsPanel({ structures, rolls, onClose }: AllOperationsPanelProps) {
  const [activeTab, setActiveTab] = useState<'operations' | 'rolls'>('operations');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberta':
        return 'bg-blue-100 text-blue-800';
      case 'Fechada':
        return 'bg-green-100 text-green-800';
      case 'Vencida':
        return 'bg-red-100 text-red-800';
      case 'EXECUTADO':
        return 'bg-green-100 text-green-800';
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Opções':
        return 'bg-purple-100 text-purple-800';
      case 'Swing Trade':
        return 'bg-orange-100 text-orange-800';
      case 'Renda Sintética':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Collect all operations from all structures
  const allOperations: (TradingOperation & { structureName: string })[] = [];
  structures.forEach(structure => {
    if (structure.operacoes) {
      structure.operacoes.forEach(operation => {
        allOperations.push({
          ...operation,
          structureName: structure.nome
        });
      });
    }
  });

  // Filter operations
  const filteredOperations = allOperations.filter(operation => {
    const matchesStatus = filterStatus === 'all' || operation.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      operation.ativo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.structureName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter rolls
  const filteredRolls = rolls.filter(roll => {
    const structure = structures.find(s => s.id === roll.structureId);
    const structureName = structure?.nome || '';
    const matchesSearch = searchTerm === '' || 
      structureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roll.motivoRoll.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalResult = allOperations.reduce((sum, op) => sum + op.resultado, 0);
  const totalOperations = allOperations.length;
  const openOperations = allOperations.filter(op => op.status === 'Aberta').length;
  const closedOperations = allOperations.filter(op => op.status === 'Fechada').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Central de Operações</h2>
                <p className="text-blue-200">Visualização completa de operações e rolagens</p>
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
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('operations')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'operations'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Operações ({totalOperations})
            </button>
            <button
              onClick={() => setActiveTab('rolls')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'rolls'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Rolagens ({rolls.length})
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={activeTab === 'operations' ? "Buscar por ativo ou estrutura..." : "Buscar por estrutura ou motivo..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {activeTab === 'operations' && (
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Todos os Status</option>
                  <option value="Aberta">Abertas</option>
                  <option value="Fechada">Fechadas</option>
                  <option value="Vencida">Vencidas</option>
                </select>
              </div>
            )}
          </div>

          {activeTab === 'operations' && (
            <>
              {/* Operations Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Target className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Total</p>
                      <p className="text-2xl font-bold text-blue-900">{totalOperations}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Activity className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Abertas</p>
                      <p className="text-2xl font-bold text-green-900">{openOperations}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Calendar className="w-6 h-6 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-purple-800">Fechadas</p>
                      <p className="text-2xl font-bold text-purple-900">{closedOperations}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    {totalResult >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-600 mr-3" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">Resultado</p>
                      <p className={`text-2xl font-bold ${totalResult >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                        {formatCurrency(totalResult)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operations List */}
              <div className="space-y-3">
                {filteredOperations.length > 0 ? (
                  filteredOperations.map((operation, index) => (
                    <div key={operation.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-gray-700 border">
                            {index + 1}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(operation.tipo)}`}>
                              {operation.tipo}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}>
                              {operation.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{operation.structureName}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${operation.resultado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {operation.resultado >= 0 ? '+' : ''}{formatCurrency(operation.resultado)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 font-medium">Ativo</p>
                          <p className="font-bold text-gray-900">{operation.ativo}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600 font-medium">Preço Médio</p>
                          <p className="font-bold text-gray-900">{formatCurrency(operation.pm)}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600 font-medium">Quantidade</p>
                          <p className="font-bold text-gray-900">{operation.quantidade}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600 font-medium">Prêmio</p>
                          <p className={`font-bold ${operation.premio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(operation.premio)}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-600 font-medium">Data Entrada</p>
                          <p className="font-bold text-gray-900">{formatDate(operation.dataEntrada)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma operação encontrada</p>
                    <p className="text-sm text-gray-500">Tente ajustar os filtros de busca</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'rolls' && (
            <>
              {/* Rolls Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <RotateCcw className="w-6 h-6 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Total de Rolls</p>
                      <p className="text-2xl font-bold text-orange-900">{rolls.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Target className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Executados</p>
                      <p className="text-2xl font-bold text-green-900">
                        {rolls.filter(r => r.status === 'EXECUTADO').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <DollarSign className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Custo Total</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(rolls.reduce((sum, roll) => sum + roll.custoRoll, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rolls List */}
              <div className="space-y-4">
                {filteredRolls.length > 0 ? (
                  filteredRolls.map((roll, index) => {
                    const structure = structures.find(s => s.id === roll.structureId);
                    return (
                      <div key={roll.id} className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{structure?.nome || 'Estrutura não encontrada'}</h4>
                              <p className="text-sm text-gray-600">Roll executado em {formatDate(roll.dataRoll)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(roll.status)}`}>
                              {roll.status}
                            </span>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Custo do Roll</p>
                              <p className={`text-lg font-bold ${roll.custoRoll >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(roll.custoRoll)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Motivo do Roll:</h5>
                          <p className="text-gray-700">{roll.motivoRoll}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3">Posições Originais:</h5>
                            <div className="space-y-2">
                              {roll.originalLegs.map((leg, legIndex) => (
                                <div key={legIndex} className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{leg.ativo}</span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      leg.posicao === 'COMPRADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {leg.posicao}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-gray-600">
                                    {leg.tipo} • Strike: {formatCurrency(leg.strike)} • Prêmio: {formatCurrency(leg.premio)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-900 mb-3">Novas Posições:</h5>
                            <div className="space-y-2">
                              {roll.newLegs.map((leg, legIndex) => (
                                <div key={legIndex} className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{leg.ativo}</span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      leg.posicao === 'COMPRADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {leg.posicao}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-gray-600">
                                    {leg.tipo} • Strike: {formatCurrency(leg.strike)} • Prêmio: {formatCurrency(leg.premio)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma rolagem encontrada</p>
                    <p className="text-sm text-gray-500">As rolagens executadas aparecerão aqui</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Close Button */}
          <div className="flex justify-end mt-8 pt-6 border-t">
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