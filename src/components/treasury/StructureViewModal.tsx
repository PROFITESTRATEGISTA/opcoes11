import React from 'react';
import { X, Target, Calendar, DollarSign, Activity } from 'lucide-react';
import { OptionStructure } from '../../types/trading';

interface StructureViewModalProps {
  isOpen: boolean;
  structure: OptionStructure | null;
  onClose: () => void;
}

export default function StructureViewModal({ isOpen, structure, onClose }: StructureViewModalProps) {
  if (!isOpen || !structure) return null;

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
      case 'MONTANDO':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'ATIVA':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'FINALIZADA':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'CALL':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PUT':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ACAO':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'WIN':
      case 'WDO':
      case 'BIT':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPosicaoColor = (posicao: string) => {
    return posicao === 'COMPRADA' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const totalResult = structure.operacoes?.reduce((sum, op) => sum + op.resultado, 0) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-8 h-8 mr-3" />
              <div>
                <h3 className="text-2xl font-bold">{structure.nome}</h3>
                <p className="text-blue-100">Detalhes completos da estrutura</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Pernas</p>
              <p className="text-xl font-bold text-white">{structure.legs.length}</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Vencimento</p>
              <p className="text-sm font-bold text-white">{formatDate(structure.dataVencimento)}</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Prêmio Teórico</p>
              <p className={`text-lg font-bold ${structure.premioLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(structure.premioLiquido)}
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <Activity className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Status</p>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(structure.status)}`}>
                {structure.status}
              </span>
            </div>
          </div>

          {/* Legs Details */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">Pernas da Estrutura</h4>
            <div className="space-y-3">
              {structure.legs.map((leg, index) => (
                <div key={leg.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white text-sm">
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getTipoColor(leg.tipo)}`}>
                          {leg.tipo}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getPosicaoColor(leg.posicao)}`}>
                          {leg.posicao}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{leg.ativo}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Strike/Preço</p>
                      <p className="font-bold text-white">
                        {formatCurrency(leg.strike || leg.precoEntrada || leg.precoVista || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Prêmio</p>
                      <p className={`font-bold ${leg.premio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(leg.premio)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Quantidade</p>
                      <p className="font-bold text-white">{leg.quantidade}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Vencimento</p>
                      <p className="font-bold text-white">{formatDate(leg.vencimento)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operations Summary */}
          {structure.operacoes && structure.operacoes.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">Resumo das Operações</h4>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Total de Operações</p>
                    <p className="text-xl font-bold text-blue-400">{structure.operacoes.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Operações Fechadas</p>
                    <p className="text-xl font-bold text-green-400">
                      {structure.operacoes.filter(op => op.status === 'Fechada').length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Resultado Total</p>
                    <p className={`text-xl font-bold ${totalResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(totalResult)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
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