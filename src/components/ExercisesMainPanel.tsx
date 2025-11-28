import React, { useState, useEffect } from 'react';
import { 
  Zap, 
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
  Trash2,
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { OptionStructure, ExerciseRecord } from '../types/trading';

interface ExercisesMainPanelProps {
  structures: OptionStructure[];
}

export default function ExercisesMainPanel({ structures }: ExercisesMainPanelProps) {
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Load exercises from localStorage with user isolation
  useEffect(() => {
    const loadExercises = async () => {
      try {
        setLoading(true);
        // Get current user from Supabase
        const { supabase } = await import('../lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const userExercisesKey = `trading_exercises_${user.id}`;
          const savedExercises = localStorage.getItem(userExercisesKey);
          if (savedExercises) {
            setExercises(JSON.parse(savedExercises));
          }
        }
      } catch (error) {
        console.error('Error loading exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'CALL':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PUT':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Filter exercises
  const filteredExercises = exercises.filter(exercise => {
    const matchesStatus = filterStatus === 'all' || exercise.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      exercise.structureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.opcoes.some(opcao => opcao.ativo.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const totalExercises = exercises.length;
  const executedExercises = exercises.filter(e => e.status === 'EXECUTADO').length;
  const totalCost = exercises.reduce((sum, exercise) => sum + exercise.custoTotalExercicio, 0);
  const totalResult = exercises.reduce((sum, exercise) => sum + exercise.resultadoTotalExercicio, 0);
  const totalOptionsExercised = exercises.reduce((sum, exercise) => sum + exercise.opcoes.length, 0);
  const averageResult = totalExercises > 0 ? totalResult / totalExercises : 0;
  const successRate = executedExercises > 0 ? (exercises.filter(e => e.status === 'EXECUTADO' && e.resultadoTotalExercicio > 0).length / executedExercises) * 100 : 0;

  const stats = [
    {
      title: 'Total de Exercícios',
      value: totalExercises,
      icon: Zap,
      color: 'blue',
      format: (value: number) => value.toString()
    },
    {
      title: 'Exercícios Executados',
      value: executedExercises,
      icon: CheckCircle,
      color: 'green',
      format: (value: number) => value.toString()
    },
    {
      title: 'Resultado Total',
      value: totalResult,
      icon: totalResult >= 0 ? TrendingUp : TrendingDown,
      color: totalResult >= 0 ? 'green' : 'red',
      format: formatCurrency
    },
    {
      title: 'Custo Total',
      value: totalCost,
      icon: Calculator,
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Zap className="w-8 h-8 text-blue-400 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-white">Controle de Exercícios</h2>
            <p className="text-gray-400">Carregando exercícios...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Controle de Exercícios</h2>
          <p className="text-gray-400">Strategos Partners - Gestão de exercícios</p>
        </div>
      </div>


      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 lg:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por estrutura ou ativo..."
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
                <option value="EXECUTADO">Executados</option>
                <option value="PENDENTE">Pendentes</option>
                <option value="CANCELADO">Cancelados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">
            Lista de Exercícios ({filteredExercises.length})
          </h3>
        </div>
        
        <div className="p-3 lg:p-6">
          {filteredExercises.length > 0 ? (
            <div className="space-y-4">
              {filteredExercises.map((exercise, index) => (
                <div key={exercise.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4 lg:p-6 hover:border-gray-600 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0">
                      <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm lg:text-lg truncate">{exercise.structureName}</h4>
                        <p className="text-xs lg:text-sm text-gray-400">{formatDate(exercise.dataExercicio)}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(exercise.status)}`}>
                        {exercise.status}
                      </span>
                    </div>
                    <div className="text-right ml-2">
                      <div className={`text-sm lg:text-xl font-bold ${exercise.resultadoTotalExercicio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {exercise.resultadoTotalExercicio >= 0 ? '+' : ''}{formatCurrency(exercise.resultadoTotalExercicio)}
                      </div>
                      <p className="text-xs lg:text-sm text-gray-400">Resultado Total</p>
                    </div>
                  </div>

                  {/* Options Summary */}
                  <div className="bg-gray-800 rounded-lg p-3 lg:p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-purple-300">Opções Exercidas ({exercise.opcoes.length})</h5>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Custo Total</p>
                        <p className="text-sm font-bold text-orange-400">{formatCurrency(exercise.custoTotalExercicio)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      {exercise.opcoes.slice(0, 4).map((opcao, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-700 rounded text-xs">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded ${getTipoColor(opcao.tipo)}`}>
                              {opcao.tipo}
                            </span>
                            <span className="text-white font-medium">{opcao.ativo}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-300">Strike: {formatCurrency(opcao.strike)}</div>
                            <div className={`font-bold ${opcao.resultadoExercicio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(opcao.resultadoExercicio)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {exercise.opcoes.length > 4 && (
                        <div className="text-center text-xs text-gray-400 p-2">
                          +{exercise.opcoes.length - 4} mais opções
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => setSelectedExercise(exercise)}
                      className="px-3 lg:px-4 py-2 bg-blue-600 text-white text-xs lg:text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {exercises.length === 0 ? (
                <>
                  <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhum exercício registrado</p>
                  <p className="text-sm text-gray-500">Os exercícios de opções aparecerão aqui quando executados</p>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhum exercício encontrado</p>
                  <p className="text-sm text-gray-500">Tente ajustar os filtros de busca</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Exercise Details Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Detalhes do Exercício</h3>
                  <p className="text-purple-100">{selectedExercise.structureName}</p>
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-400 mb-1">Resultado Total</p>
                  <p className={`text-2xl font-bold ${selectedExercise.resultadoTotalExercicio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedExercise.resultadoTotalExercicio >= 0 ? '+' : ''}{formatCurrency(selectedExercise.resultadoTotalExercicio)}
                  </p>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-400 mb-1">Custo Total</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {formatCurrency(selectedExercise.custoTotalExercicio)}
                  </p>
                </div>
              </div>

              {/* Exercise Info */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Data do Exercício</p>
                    <p className="font-bold text-white">{formatDate(selectedExercise.dataExercicio)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Status</p>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedExercise.status)}`}>
                      {selectedExercise.status}
                    </span>
                  </div>
                </div>

                {selectedExercise.observacoes && (
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Observações</p>
                    <p className="font-bold text-white">{selectedExercise.observacoes}</p>
                  </div>
                )}
              </div>

              {/* Options Details */}
              <div>
                <h4 className="font-medium text-white mb-4">Opções Exercidas ({selectedExercise.opcoes.length})</h4>
                <div className="space-y-3">
                  {selectedExercise.opcoes.map((opcao, index) => (
                    <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-white text-xs">
                            {index + 1}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTipoColor(opcao.tipo)}`}>
                              {opcao.tipo}
                            </span>
                            <span className="font-medium text-white">{opcao.ativo}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${opcao.resultadoExercicio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {opcao.resultadoExercicio >= 0 ? '+' : ''}{formatCurrency(opcao.resultadoExercicio)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 font-medium">Strike</p>
                          <p className="font-bold text-white">{formatCurrency(opcao.strike)}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 font-medium">Quantidade</p>
                          <p className="font-bold text-white">{opcao.quantidade}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 font-medium">Preço Exercício</p>
                          <p className="font-bold text-white">{formatCurrency(opcao.precoExercicio)}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 font-medium">Custo</p>
                          <p className="font-bold text-orange-400">{formatCurrency(opcao.custoExercicio)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}