import React, { useState } from 'react';
import { 
  Activity, 
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
  Edit2,
  Trash2
} from 'lucide-react';
import { OptionStructure, TradingOperation } from '../types/trading';

interface OperationsMainPanelProps {
  structures: OptionStructure[];
}

export default function OperationsMainPanel({ structures }: OperationsMainPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedOperation, setSelectedOperation] = useState<TradingOperation | null>(null);

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
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Fechada':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Vencida':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Opções':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Swing Trade':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Renda Sintética':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
    const matchesType = filterType === 'all' || operation.tipo === filterType;
    const matchesSearch = searchTerm === '' || 
      operation.ativo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.structureName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });


  return (
    <div className="space-y-4 lg:space-y-6">

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 lg:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ativo ou estrutura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 lg:py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
              />
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 lg:py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base flex-1 lg:flex-none"
              >
                <option value="all">Todos os Status</option>
                <option value="Aberta">Abertas</option>
                <option value="Fechada">Fechadas</option>
                <option value="Vencida">Vencidas</option>
              </select>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 lg:py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base flex-1 lg:flex-none"
            >
              <option value="all">Todos os Tipos</option>
              <option value="Opções">Opções</option>
              <option value="Swing Trade">Swing Trade</option>
              <option value="Renda Sintética">Renda Sintética</option>
            </select>
          </div>
        </div>
      </div>

      {/* Operations List */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">
            Lista de Operações ({filteredOperations.length})
          </h3>
        </div>
        
        <div className="p-3 lg:p-6">
          {filteredOperations.length > 0 ? (
            <div className="overflow-x-auto -mx-3 lg:mx-0 max-w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 lg:py-3 px-1 lg:px-3 text-xs lg:text-sm font-medium text-gray-400 w-12">#</th>
                    <th className="text-left py-2 lg:py-3 px-1 lg:px-3 text-xs lg:text-sm font-medium text-gray-400 min-w-0">Ativo</th>
                    <th className="text-left py-2 lg:py-3 px-1 lg:px-3 text-xs lg:text-sm font-medium text-gray-400 hidden lg:table-cell min-w-0">Estrutura</th>
                    <th className="text-left py-2 lg:py-3 px-1 lg:px-3 text-xs lg:text-sm font-medium text-gray-400 hidden xl:table-cell">Tipo</th>
                    <th className="text-left py-2 lg:py-3 px-1 lg:px-3 text-xs lg:text-sm font-medium text-gray-400">Status</th>
                    <th className="text-right py-2 lg:py-3 px-1 lg:px-3 text-xs lg:text-sm font-medium text-gray-400 hidden xl:table-cell">P. Médio</th>
                    <th className="text-right py-2 lg:py-3 px-1 lg:px-3 text-xs lg:text-sm font-medium text-gray-400 hidden xl:table-cell w-16">Qtd</th>
                    <th className="text-right py-2 lg:py-3 px-1 lg:px-3 text-xs lg:text-sm font-medium text-gray-400 hidden lg:table-cell">Prêmio</th>
                    <th className="text-right py-2 lg:py-3 px-1 lg:px-3 text-xs lg:text-sm font-medium text-gray-400 hidden xl:table-cell">Data</th>
                    <th className="text-right py-2 lg:py-3 px-1 lg:px-3 text-xs lg:text-sm font-medium text-gray-400">Resultado</th>
                    <th className="text-center py-2 lg:py-3 px-1 lg:px-3 text-xs lg:text-sm font-medium text-gray-400 w-20">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOperations.map((operation, index) => (
                    <tr key={operation.id} className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                      <td className="py-2 lg:py-4 px-1 lg:px-3">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs lg:text-sm font-bold">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-2 lg:py-4 px-1 lg:px-3">
                        <div className="font-semibold text-white text-sm lg:text-base truncate">{operation.ativo}</div>
                      </td>
                      <td className="py-2 lg:py-4 px-1 lg:px-3 hidden lg:table-cell">
                        <div className="text-xs lg:text-sm text-gray-300 truncate max-w-24 xl:max-w-32">{operation.structureName}</div>
                      </td>
                      <td className="py-2 lg:py-4 px-1 lg:px-3 hidden xl:table-cell">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getTipoColor(operation.tipo)}`}>
                          {operation.tipo}
                        </span>
                      </td>
                      <td className="py-2 lg:py-4 px-1 lg:px-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(operation.status)}`}>
                          {operation.status}
                        </span>
                      </td>
                      <td className="py-2 lg:py-4 px-1 lg:px-3 text-right hidden xl:table-cell">
                        <div className="font-medium text-white text-sm">{formatCurrency(operation.pm)}</div>
                      </td>
                      <td className="py-2 lg:py-4 px-1 lg:px-3 text-right hidden xl:table-cell">
                        <div className="font-medium text-white text-sm">{operation.quantidade}</div>
                      </td>
                      <td className="py-2 lg:py-4 px-1 lg:px-3 text-right hidden lg:table-cell">
                        <div className={`font-medium text-sm ${operation.premio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(operation.premio)}
                        </div>
                      </td>
                      <td className="py-2 lg:py-4 px-1 lg:px-3 text-right hidden xl:table-cell">
                        <div className="text-xs lg:text-sm text-gray-300">{formatDate(operation.dataEntrada)}</div>
                      </td>
                      <td className="py-2 lg:py-4 px-1 lg:px-3 text-right">
                        <div className={`font-bold text-sm lg:text-base ${operation.resultado >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {operation.resultado >= 0 ? '+' : ''}{formatCurrency(operation.resultado)}
                        </div>
                      </td>
                      <td className="py-2 lg:py-4 px-1 lg:px-3 text-center">
                        <button
                          onClick={() => setSelectedOperation(operation)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center mx-auto"
                        >
                          <Eye className="w-3 h-3 lg:mr-1" />
                          <span className="hidden lg:inline">Ver</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma operação encontrada</p>
              <p className="text-sm text-gray-500">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      </div>

      {/* Operation Details Modal */}
      {selectedOperation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedOperation.ativo}</h3>
                  <p className="text-blue-100">{selectedOperation.structureName}</p>
                </div>
                <button
                  onClick={() => setSelectedOperation(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-400 mb-1">Resultado</p>
                  <p className={`text-2xl font-bold ${selectedOperation.resultado >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedOperation.resultado >= 0 ? '+' : ''}{formatCurrency(selectedOperation.resultado)}
                  </p>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-400 mb-1">Volume</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(selectedOperation.pm * selectedOperation.quantidade)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Tipo</p>
                    <p className="font-bold text-white">{selectedOperation.tipo}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Status</p>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedOperation.status)}`}>
                      {selectedOperation.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Preço Médio</p>
                    <p className="font-bold text-white">{formatCurrency(selectedOperation.pm)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Quantidade</p>
                    <p className="font-bold text-white">{selectedOperation.quantidade}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Prêmio</p>
                    <p className={`font-bold ${selectedOperation.premio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(selectedOperation.premio)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Taxa Coleta</p>
                    <p className="font-bold text-red-400">-{formatCurrency(selectedOperation.taxaColeta)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Data Entrada</p>
                    <p className="font-bold text-white">{formatDate(selectedOperation.dataEntrada)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Data Saída</p>
                    <p className="font-bold text-white">{formatDate(selectedOperation.dataSaida)}</p>
                  </div>
                </div>

                {selectedOperation.strike && (
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Strike</p>
                    <p className="font-bold text-white">{formatCurrency(selectedOperation.strike)}</p>
                  </div>
                )}

                {(selectedOperation.alta > 0 || selectedOperation.recompensa > 0) && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    {selectedOperation.alta > 0 && (
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Preço de Saída</p>
                        <p className="font-bold text-green-400">{formatCurrency(selectedOperation.alta)}</p>
                      </div>
                    )}
                    
                    {selectedOperation.recompensa > 0 && (
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Recompensa</p>
                        <p className="font-bold text-green-400">+{formatCurrency(selectedOperation.recompensa)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}