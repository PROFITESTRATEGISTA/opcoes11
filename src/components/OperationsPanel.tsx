import React from 'react';
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, Target, Activity } from 'lucide-react';
import { OptionStructure, TradingOperation } from '../types/trading';

interface OperationsPanelProps {
  structure: OptionStructure;
  onClose: () => void;
}

export default function OperationsPanel({ structure, onClose }: OperationsPanelProps) {
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

  const totalResult = structure.operacoes?.reduce((sum, op) => sum + op.resultado, 0) || 0;
  const totalOperations = structure.operacoes?.length || 0;
  const openOperations = structure.operacoes?.filter(op => op.status === 'Aberta').length || 0;
  const closedOperations = structure.operacoes?.filter(op => op.status === 'Fechada').length || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Operações da Estrutura</h2>
                <p className="text-blue-200">{structure.nome}</p>
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
          {/* Structure Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Total de Operações</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{totalOperations}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Abertas</span>
                </div>
                <div className="text-2xl font-bold text-green-900">{openOperations}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800">Fechadas</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">{closedOperations}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {totalResult >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-800">Resultado Total</span>
                </div>
                <div className={`text-2xl font-bold ${totalResult >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {formatCurrency(totalResult)}
                </div>
              </div>
            </div>
          </div>

          {/* Operations List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Lista de Operações
            </h3>

            {structure.operacoes && structure.operacoes.length > 0 ? (
              <div className="space-y-3">
                {structure.operacoes.map((operation, index) => (
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
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${operation.resultado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {operation.resultado >= 0 ? '+' : ''}{formatCurrency(operation.resultado)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-gray-600 font-medium">Data Entrada</p>
                        <p className="font-bold text-gray-900">{formatDate(operation.dataEntrada)}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 font-medium">Data Saída</p>
                        <p className="font-bold text-gray-900">{formatDate(operation.dataSaida)}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 font-medium">Taxa Coleta</p>
                        <p className="font-bold text-red-600">-{formatCurrency(operation.taxaColeta)}</p>
                      </div>
                      
                      {operation.strike && (
                        <div>
                          <p className="text-gray-600 font-medium">Strike</p>
                          <p className="font-bold text-gray-900">{formatCurrency(operation.strike)}</p>
                        </div>
                      )}
                    </div>

                    {(operation.alta > 0 || operation.recompensa > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t border-gray-200">
                        {operation.alta > 0 && (
                          <div>
                            <p className="text-gray-600 font-medium">Preço de Saída</p>
                            <p className="font-bold text-green-600">{formatCurrency(operation.alta)}</p>
                          </div>
                        )}
                        
                        {operation.recompensa > 0 && (
                          <div>
                            <p className="text-gray-600 font-medium">Recompensa</p>
                            <p className="font-bold text-green-600">+{formatCurrency(operation.recompensa)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma operação encontrada</p>
                <p className="text-sm text-gray-500">Esta estrutura ainda não possui operações registradas</p>
              </div>
            )}
          </div>

          {/* Summary Footer */}
          {structure.operacoes && structure.operacoes.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Resumo da Estrutura</h4>
                    <p className="text-sm text-gray-600">
                      {totalOperations} operações • {openOperations} abertas • {closedOperations} fechadas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Resultado Consolidado</p>
                    <div className={`text-2xl font-bold ${totalResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalResult >= 0 ? '+' : ''}{formatCurrency(totalResult)}
                    </div>
                  </div>
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