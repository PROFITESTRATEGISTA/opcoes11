import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Upload, Edit2, Trash2, Calendar, TrendingUp, TrendingDown, RotateCcw, Activity, Target, Menu } from 'lucide-react';
import { OptionStructure, TradingOperation, RollPosition } from './types/trading';
import { useStructures } from './hooks/useStructures';
import { supabase } from './lib/supabase';
import AuthPage from './components/AuthPage';
import LandingLayout from './components/landing/LandingLayout';
import Sidebar from './components/Sidebar';
import StructureDashboard from './components/StructureDashboard';
import StructureBuilder from './components/StructureBuilder';
import StructureCSVUploader from './components/StructureCSVUploader';
import RollManager from './components/RollManager';
import OperationsPanel from './components/OperationsPanel';
import AllOperationsPanel from './components/AllOperationsPanel';
import RollHistoryCalendar from './components/RollHistoryCalendar';
import TradingCalendar from './components/TradingCalendar';
import ResultsPanel from './components/ResultsPanel';
import SimulationPanel from './components/SimulationPanel';
import OperationsMainPanel from './components/OperationsMainPanel';
import RollsMainPanel from './components/RollsMainPanel';
import SettingsPanel from './components/SettingsPanel';
import ExercisesMainPanel from './components/ExercisesMainPanel';
import ExerciseOptionsModal from './components/ExerciseOptionsModal';
import TreasuryPanel from './components/TreasuryPanel';
import AdminPanel from './components/AdminPanel';
import AccessDeniedPage from './components/AccessDeniedPage';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('treasury');

  const {
    structures,
    rolls,
    loading: structuresLoading,
    error,
    saveStructure,
    uploadOperations,
    finalizeStructure,
    deleteStructure,
    executeRoll,
    deleteRoll
  } = useStructures();

  const [showStructureBuilder, setShowStructureBuilder] = useState(false);
  const [showStructureCSVUploader, setShowStructureCSVUploader] = useState(false);
  const [showRollManager, setShowRollManager] = useState(false);
  const [showRollDropdown, setShowRollDropdown] = useState(false);
  const [selectedStructureForUpload, setSelectedStructureForUpload] = useState<OptionStructure | undefined>();
  const [selectedStructureForRoll, setSelectedStructureForRoll] = useState<OptionStructure | undefined>();
  const [selectedStructureForOperations, setSelectedStructureForOperations] = useState<OptionStructure | undefined>();
  const [showOperationsPanel, setShowOperationsPanel] = useState(false);
  const [showAllOperationsPanel, setShowAllOperationsPanel] = useState(false);
  const [editingStructure, setEditingStructure] = useState<OptionStructure | undefined>();
  const [showRollHistoryCalendar, setShowRollHistoryCalendar] = useState(false);
  const [showZeroStructureUploader, setShowZeroStructureUploader] = useState(false);
  const [selectedStructureForZero, setSelectedStructureForZero] = useState<OptionStructure | undefined>();
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedStructureForExercise, setSelectedStructureForExercise] = useState<OptionStructure | undefined>();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setUserPlan(null);
          setLoading(false);
          return;
        }
        
        setUser(session?.user ?? null);
        if (session?.user) {
          // Load user plan from database or metadata
          let plan = null;
          
          try {
            // Try to get plan from users table first
            const { data: userData } = await supabase
              .from('users')
              .select('plan')
              .eq('id', session.user.id)
              .single();
            
            plan = userData?.plan || session.user.user_metadata?.plan;
          } catch (dbError) {
            console.warn('Could not load plan from database, using metadata:', dbError);
            plan = session.user.user_metadata?.plan;
          }
          
          // Set admin plan for Pedro's email
          if (session.user.email === 'pedropardal04@gmail.com') {
            plan = {
              type: 'ADMIN',
              name: 'Administrador',
              price: 0,
              features: ['Acesso irrestrito', 'Painel administrativo', 'Gestão de usuários'],
              maxStructures: -1,
              maxUsers: -1,
              hasAdvancedAnalytics: true,
              hasSharedAccess: true,
              hasAdminControls: true
            };
          } else if (!plan) {
            plan = {
              type: 'FREE',
              name: 'Plano Gratuito',
              price: 0,
              features: ['Sem acesso ao produto'],
              maxStructures: 0,
              maxUsers: 1,
              hasAdvancedAnalytics: false,
              hasSharedAccess: false,
              hasAdminControls: false
            };
          }
          setUserPlan(plan);
          
          // Ensure user exists in users table
          try {
            await supabase
              .from('users')
              .upsert({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email,
                plan: plan
              }, {
                onConflict: 'id'
              });
          } catch (upsertError) {
            console.warn('Could not upsert user to users table:', upsertError);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setUserPlan(null);
        setLoading(false);
      }
    };
    
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Load plan from database or metadata
        const loadUserPlan = async () => {
          let plan = null;
          
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('plan')
              .eq('id', session.user.id)
              .single();
            
            plan = userData?.plan || session.user.user_metadata?.plan;
          } catch (dbError) {
            plan = session.user.user_metadata?.plan;
          }
        
          // Set admin plan for Pedro's email
          if (session.user.email === 'pedropardal04@gmail.com') {
            plan = {
              type: 'ADMIN',
              name: 'Administrador',
              price: 0,
              features: ['Acesso irrestrito', 'Painel administrativo', 'Gestão de usuários'],
              maxStructures: -1,
              maxUsers: -1,
              hasAdvancedAnalytics: true,
              hasSharedAccess: true,
              hasAdminControls: true
            };
          } else if (!plan) {
            plan = {
              type: 'FREE',
              name: 'Plano Gratuito',
              price: 0,
              features: ['Sem acesso ao produto'],
              maxStructures: 0,
              maxUsers: 1,
              hasAdvancedAnalytics: false,
              hasSharedAccess: false,
              hasAdminControls: false
            };
          }
          setUserPlan(plan);
          
          // Ensure user exists in users table
          try {
            await supabase
              .from('users')
              .upsert({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email,
                plan: plan
              }, {
                onConflict: 'id'
              });
          } catch (upsertError) {
            console.warn('Could not upsert user to users table:', upsertError);
          }
        };
        
        loadUserPlan();
      } else {
        setUserPlan(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserPlan(null);
  };

  const hasAccess = () => {
    if (!userPlan) return false;
    // Admin sempre tem acesso
    if (user?.email === 'pedropardal04@gmail.com') return true;
    return userPlan.type !== 'FREE';
  };

  const handleSaveStructure = async (structureData: OptionStructure) => {
    try {
      const success = await saveStructure(structureData);
      if (success) {
        setShowStructureBuilder(false);
        setEditingStructure(undefined);
      } else {
        console.error('Erro ao salvar estrutura');
      }
    } catch (error) {
      console.error('Erro ao salvar estrutura:', error);
      alert('Erro ao salvar estrutura. Tente novamente.');
    }
  };

  const handleActivateStructure = (structure: OptionStructure) => {
    // Confirmar ativação antes de executar
    if (window.confirm(`Confirmar ativação da estrutura "${structure.nome}"?\n\nEsta ação irá:\n• Registrar os lançamentos no fluxo de caixa\n• Registrar ativos em custódia\n• Ativar a estrutura para operação\n\nEsta ação não pode ser desfeita.`)) {
      const activateStructure = async () => {
        const success = await saveStructure({
          ...structure,
          status: 'ATIVA',
          dataAtivacao: new Date().toISOString().split('T')[0]
        });
        
        if (success) {
          // Force refresh of treasury data
          window.location.reload();
        }
      };
      activateStructure();
    }
  };

  const handleStructureUpload = async (operations: TradingOperation[]) => {
    if (!selectedStructureForUpload) return;

    const success = await uploadOperations(selectedStructureForUpload.id, operations);
    if (success) {
      setShowStructureCSVUploader(false);
      setSelectedStructureForUpload(undefined);
    }
  };

  const handleFinalizeStructure = async (structureId: string) => {
    if (window.confirm('Tem certeza que deseja finalizar esta estrutura?')) {
      await finalizeStructure(structureId);
    }
  };

  const handleZeroStructure = (structure: OptionStructure) => {
    setSelectedStructureForZero(structure);
    setShowZeroStructureUploader(true);
  };

  const handleZeroStructureUpload = async (operations: TradingOperation[]) => {
    if (!selectedStructureForZero) return;

    // Atualizar operações existentes com preços de saída
    const success = await uploadOperations(selectedStructureForZero.id, operations);
    if (success) {
      // Finalizar estrutura após zerar
      await finalizeStructure(selectedStructureForZero.id);
      setShowZeroStructureUploader(false);
      setSelectedStructureForZero(undefined);
    }
  };

  const handleExerciseOptions = async (exerciseData: any) => {
    console.log('Exercício de opções:', exerciseData);
    // Aqui você pode implementar a lógica para processar o exercício
    // Por exemplo, criar operações de exercício, calcular custos, etc.
    
    setShowExerciseModal(false);
    setSelectedStructureForExercise(undefined);
    
    // Opcional: mostrar confirmação
    alert(`Exercício processado com sucesso!\nOpções exercidas: ${exerciseData.options.length}\nCusto total: R$ ${exerciseData.totalCost.toFixed(2)}`);
  };

  const handleDeleteStructure = async (structureId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta estrutura? Esta ação não pode ser desfeita.')) {
      await deleteStructure(structureId);
    }
  };

  const handleEditStructure = (structure: OptionStructure) => {
    setEditingStructure(structure);
    setShowStructureBuilder(true);
  };

  const handleRollStructure = (structure: OptionStructure) => {
    console.log('handleRollStructure - structure:', structure);
    console.log('handleRollStructure - structure.legs:', structure.legs);
    setSelectedStructureForRoll(structure);
    setShowRollManager(true);
  };

  const handleExecuteRoll = async (rollData: RollPosition) => {
    const success = await executeRoll(rollData);
    if (success) {
      setShowRollManager(false);
      setSelectedStructureForRoll(undefined);
    }
  };

  const handleViewOperations = (structure: OptionStructure) => {
    setSelectedStructureForOperations(structure);
    setShowOperationsPanel(true);
  };

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'MONTANDO':
        return 'Em Montagem';
      case 'ATIVA':
        return 'Em Operação';
      case 'FINALIZADA':
        return 'Finalizada';
      default:
        return status;
    }
  };

  const renderContent = () => {
    if (structuresLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-blue-500 mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Carregando Estruturas</h3>
            <p className="text-gray-400 text-sm">Conectando com o banco de dados...</p>
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-lg mx-auto">
              <div className="bg-red-500/20 p-4 rounded-full w-fit mx-auto mb-6">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-400 mb-3">Problema de Conexão</h2>
              <p className="text-red-300 mb-6 text-sm leading-relaxed">{error}</p>
              {error.includes('environment variables') && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <p className="text-blue-300 text-sm">
                    💡 <strong>Dica:</strong> Clique no botão "Connect to Supabase" no canto superior direito para configurar a conexão.
                  </p>
                </div>
              )}
              <button
                onClick={() => {
                  setError(null);
                  window.location.reload();
                }}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🔄 Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'treasury':
        return <TreasuryPanel structures={structures} rolls={rolls} exercises={[]} />;
      case 'results':
        return <ResultsPanel structures={structures} rolls={rolls} />;
      case 'simulation':
        return <SimulationPanel structures={structures} rolls={rolls} exercises={[]} />;
      case 'calendar':
        return <TradingCalendar structures={structures} rolls={rolls} onClose={() => {}} />;
      case 'operations':
        return <OperationsMainPanel structures={structures} />;
      case 'rolls':
        return <RollsMainPanel rolls={rolls} structures={structures} onDeleteRoll={deleteRoll} />;
      case 'exercises':
        return <ExercisesMainPanel structures={structures} />;
      case 'settings':
        return <SettingsPanel />;
      case 'admin':
        return <AdminPanel />;
      default:
        return (
          <div className="space-y-6">

            {/* Structures Grid */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl">
              <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-medium text-white">
                  Estruturas de Opções ({structures.length})
                </h2>
                <button
                  onClick={() => setShowStructureBuilder(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Estrutura
                </button>
              </div>
              
              <div className="p-6">
                {structures.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhuma estrutura criada ainda</p>
                    <p className="text-sm text-gray-500">Monte suas primeiras estruturas de opções</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {structures.map((structure) => {
                      const totalResult = structure.operacoes?.reduce((sum, op) => sum + op.resultado, 0) || 0;
                      
                      return (
                        <div key={structure.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6 hover:border-gray-600 transition-all">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white text-base sm:text-lg mb-1 truncate">{structure.nome}</h3>
                              {structure.ativo && (
                                <p className="text-xs sm:text-sm text-blue-400 font-medium">Ativo: {structure.ativo}</p>
                              )}
                            </div>
                            <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(structure.status)} ml-2`}>
                              {getStatusText(structure.status)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-400">Garantia em Uso:</span>
                            <span className="font-bold text-xs sm:text-sm text-orange-400">
                              {formatCurrency((() => {
                                // Calcular margem necessária para esta estrutura usando margem personalizada
                                return structure.legs.reduce((sum, leg) => {
                                  if (leg.posicao === 'VENDIDA') {
                                    if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
                                      // Opções vendidas: usar margem personalizada ou 15% padrão
                                      const marginPercentage = (leg.customMarginPercentage || 15) / 100;
                                      return sum + (leg.strike * leg.quantidade * marginPercentage);
                                    } else if (leg.tipo === 'ACAO') {
                                      // Ações vendidas: usar margem personalizada ou 100% padrão
                                      const marginPercentage = (leg.customMarginPercentage || 100) / 100;
                                      return sum + ((leg.precoEntrada || 0) * leg.quantidade * marginPercentage);
                                    }
                                  }
                                  return sum;
                                }, 0);
                              })())}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-400">Nocional Total:</span>
                            <span className="font-bold text-xs sm:text-sm text-blue-400">
                              {formatCurrency((() => {
                                // Calcular nocional total (exposição)
                                return structure.legs.reduce((sum, leg) => {
                                  if (leg.tipo === 'ACAO') {
                                    return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                                  } else if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
                                    return sum + (leg.strike * leg.quantidade);
                                  } else if (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') {
                                    return sum + ((leg.precoVista || 0) * leg.quantidade);
                                  }
                                  return sum;
                                }, 0);
                              })())}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-400">Duration Médio:</span>
                            <span className="font-bold text-xs sm:text-sm text-blue-400">
                              {(() => {
                                // Calcular duration médio das operações com vencimento
                                const legsWithExpiration = structure.legs.filter(leg => 
                                  leg.vencimento && leg.tipo !== 'ACAO'
                                );
                                
                                if (legsWithExpiration.length === 0) return 'N/A';
                                
                                const today = new Date();
                                const totalDays = legsWithExpiration.reduce((sum, leg) => {
                                  const expDate = new Date(leg.vencimento);
                                  const days = Math.max(0, Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                                  return sum + days;
                                }, 0);
                                
                                const averageDays = Math.round(totalDays / legsWithExpiration.length);
                                return `${averageDays} dias`;
                              })()}
                            </span>
                          </div>

                          {/* Structure Info */}
                          <div className="space-y-1 sm:space-y-2 mb-4">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-400">Pernas:</span>
                              <span className="font-medium text-white">{structure.legs.length}</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-400">Vencimento:</span>
                              <span className="font-medium text-white">{formatDate(structure.dataVencimento)}</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-400">Prêmio Teórico:</span>
                              <span className={`font-bold text-xs sm:text-sm ${structure.premioLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(structure.premioLiquido)}
                              </span>
                            </div>
                          </div>

                          {/* Status-specific info */}
                          {structure.status === 'ATIVA' && structure.dataAtivacao && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                              <div className="flex items-center mb-2">
                                <Calendar className="w-4 h-4 text-green-400 mr-2" />
                                <p className="text-xs text-green-300">Ativada em: {formatDate(structure.dataAtivacao)}</p>
                              </div>
                              {structure.operacoes && structure.operacoes.length > 0 && (
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs text-green-300">Operações:</p>
                                    <p className="text-sm font-medium text-green-400">{structure.operacoes.length}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-green-300">Resultado Real:</p>
                                    <div className={`flex items-center text-sm font-bold ${
                                      totalResult >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                      {totalResult >= 0 ? (
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                      ) : (
                                        <TrendingDown className="w-3 h-3 mr-1" />
                                      )}
                                      {formatCurrency(totalResult)}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {structure.status === 'FINALIZADA' && structure.dataFinalizacao && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center mb-1">
                                    <Calendar className="w-4 h-4 text-blue-400 mr-2" />
                                    <p className="text-xs text-blue-300">Finalizada em:</p>
                                  </div>
                                  <p className="text-sm font-medium text-blue-400">{formatDate(structure.dataFinalizacao)}</p>
                                </div>
                                {structure.operacoes && structure.operacoes.length > 0 && (
                                  <div className="text-right">
                                    <p className="text-xs text-blue-300">Resultado Final:</p>
                                    <div className={`flex items-center text-sm font-bold ${
                                      totalResult >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                      {totalResult >= 0 ? (
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                      ) : (
                                        <TrendingDown className="w-3 h-3 mr-1" />
                                      )}
                                      {formatCurrency(totalResult)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Legs preview */}
                          <div className="mb-4">
                            <p className="text-xs text-gray-400 mb-2">Pernas da Estrutura:</p>
                            <div className="flex flex-wrap gap-1">
                              {structure.legs.slice(0, 3).map((leg, index) => (
                                <span
                                  key={index}
                                  className={`px-2 py-1 text-xs rounded flex items-center space-x-1 font-medium ${
                                    leg.posicao === 'COMPRADA' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  <span className="font-medium">{leg.ativo}</span>
                                  <span className="opacity-90">
                                    {leg.tipo === 'ACAO' ? 
                                      formatCurrency(leg.precoEntrada || 0) : 
                                      formatCurrency(leg.strike)
                                    }
                                  </span>
                                  <span className="text-xs opacity-80 font-bold">
                                    {leg.tipo}
                                  </span>
                                </span>
                              ))}
                              {structure.legs.length > 3 && (
                                <span className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-400">
                                  +{structure.legs.length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex justify-between items-center">
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {structure.status === 'MONTANDO' && (
                                <>
                                  <button
                                    onClick={() => handleActivateStructure(structure)}
                                    className="px-2 sm:px-3 py-1 sm:py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                  >
                                    <Upload className="w-3 h-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Ativar</span>
                                  </button>
                                  <button
                                    onClick={() => handleEditStructure(structure)}
                                    className="px-2 sm:px-3 py-1 sm:py-2 text-blue-400 hover:text-blue-300 text-xs border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-colors flex items-center"
                                  >
                                    <Edit2 className="w-3 h-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Editar</span>
                                  </button>
                                </>
                              )}
                              
                              {structure.status === 'ATIVA' && (
                                <>
                                  <button
                                    onClick={() => handleRollStructure(structure)}
                                    className="px-2 sm:px-3 py-1 sm:py-2 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                                  >
                                    <RotateCcw className="w-3 h-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Rolagem</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedStructureForExercise(structure);
                                      setShowExerciseModal(true);
                                    }}
                                    className="px-2 sm:px-3 py-1 sm:py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                                  >
                                    <Target className="w-3 h-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Exercer</span>
                                  </button>
                                  <button
                                    onClick={() => handleZeroStructure(structure)}
                                    className="px-2 sm:px-3 py-1 sm:py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    <span className="hidden sm:inline">Zerar</span>
                                    <span className="sm:hidden">0</span>
                                  </button>
                                </>
                              )}
                              
                              {(structure.status === 'ATIVA' || structure.status === 'FINALIZADA') && structure.operacoes && structure.operacoes.length > 0 && (
                                <button
                                  onClick={() => handleViewOperations(structure)}
                                  className="px-2 sm:px-3 py-1 sm:py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                                >
                                  <Activity className="w-3 h-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Ver Operações</span>
                                  <span className="sm:hidden">Ver</span>
                                </button>
                              )}
                              
                              {structure.status === 'FINALIZADA' && (
                                <span className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-700 text-gray-400 text-xs rounded-lg">
                                  <span className="hidden sm:inline">Concluída</span>
                                  <span className="sm:hidden">OK</span>
                                </span>
                              )}
                            </div>

                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteStructure(structure.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Excluir estrutura"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingLayout onAuthSuccess={() => setUser(true)} />;
  }

  // Check if user has access to the product
  if (!hasAccess()) {
    return <AccessDeniedPage userPlan={userPlan} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            setSidebarOpen(false);
          }}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <header className="bg-gray-900 border-b border-gray-800 px-3 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center lg:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors mr-4"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex items-center">
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {activeSection === 'default' ? 'Estruturas' :
                     activeSection === 'operations' ? 'Operações' :
                     activeSection === 'rolls' ? 'Rolagens' :
                     activeSection === 'exercises' ? 'Exercícios' :
                     activeSection === 'treasury' ? 'Tesouraria' :
                     activeSection === 'results' ? 'Resultados' :
                     activeSection === 'calendar' ? 'Histórico de Rolagens' :
                     activeSection === 'settings' ? 'Configurações' :
                     activeSection === 'admin' ? 'Painel de Administração' :
                     'Strategos Partners'}
                  </h1>
                  <p className="text-sm text-gray-400">
                    Tecnologia em Tesouraria, Consultoria em Patrimônio
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {structures.some(s => s.status === 'ATIVA') && (
                  <div className="relative group">
                    <button
                      onClick={() => {
                        const activeStructures = structures.filter(s => s.status === 'ATIVA');
                        if (activeStructures.length === 1) {
                          handleRollStructure(activeStructures[0]);
                        } else {
                          setShowRollDropdown(!showRollDropdown);
                        }
                      }}
                      className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Rolagem</span>
                      {structures.filter(s => s.status === 'ATIVA').length > 1 && (
                        <span className="ml-2 text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full">
                          {structures.filter(s => s.status === 'ATIVA').length}
                        </span>
                      )}
                    </button>
                    
                    {showRollDropdown && structures.filter(s => s.status === 'ATIVA').length > 1 && (
                      <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                        <div className="p-2">
                          <div className="text-xs font-medium text-gray-400 px-3 py-2 border-b border-gray-700">
                            Selecione a estrutura para rolar:
                          </div>
                          {structures.filter(s => s.status === 'ATIVA').map(structure => (
                            <button
                              key={structure.id}
                              onClick={() => {
                                handleRollStructure(structure);
                                setShowRollDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <div className="font-medium text-white">{structure.nome}</div>
                              <div className="text-xs text-gray-400">
                                {structure.legs.length} pernas • Venc: {formatDate(structure.dataVencimento)}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => setShowStructureBuilder(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Nova Estrutura</span>
                  <span className="sm:hidden">Nova</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="p-3 sm:p-4 md:p-6 lg:p-6 xl:p-8 max-w-full overflow-hidden">
            {/* Connection Error Alert */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <div className="bg-red-500/20 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-red-300 font-medium">Erro de Conexão</h3>
                    <p className="text-red-400 text-sm">{error}</p>
                    {error.includes('environment variables') && (
                      <p className="text-red-300 text-xs mt-1">
                        Clique no botão "Connect to Supabase" no canto superior direito para configurar a conexão.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* User Profile Section */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {(user?.user_metadata?.name || user?.email || 'Usuario').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {user?.user_metadata?.name || user?.email || 'Usuario'}
                    </h3>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                    {user?.email === 'pedropardal04@gmail.com' && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-gradient-to-r from-purple-500 to-purple-700 text-white px-2 py-1 rounded-full font-medium">
                          👑 Administrador
                        </span>
                        <span className="ml-2 text-xs bg-gradient-to-r from-green-500 to-green-700 text-white px-2 py-1 rounded-full font-medium">
                          🎯 Consultoria Premium
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Estruturas Ativas</p>
                    <p className="text-xl font-bold text-blue-400">
                      {structures.filter(s => s.status === 'ATIVA').length}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Total de Operações</p>
                    <p className="text-xl font-bold text-green-400">
                      {structures.reduce((sum, s) => sum + (s.operacoes?.length || 0), 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Resultado Geral</p>
                    <p className={`text-xl font-bold ${
                      structures.reduce((sum, s) => sum + (s.operacoes?.reduce((opSum, op) => opSum + op.resultado, 0) || 0), 0) >= 0 
                        ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(structures.reduce((sum, s) => sum + (s.operacoes?.reduce((opSum, op) => opSum + op.resultado, 0) || 0), 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {renderContent()}
          </main>
        </div>
      </div>

      {/* Modals */}
      {showStructureBuilder && (
        <StructureBuilder
          onSave={handleSaveStructure}
          onCancel={() => {
            setShowStructureBuilder(false);
            setEditingStructure(undefined);
          }}
          editingStructure={editingStructure}
        />
      )}

      {showStructureCSVUploader && selectedStructureForUpload && (
        <StructureCSVUploader
          structure={selectedStructureForUpload}
          onUpload={handleStructureUpload}
          onCancel={() => {
            setShowStructureCSVUploader(false);
            setSelectedStructureForUpload(undefined);
          }}
        />
      )}

      {showRollManager && selectedStructureForRoll && (
        <RollManager
          structure={selectedStructureForRoll}
          onSaveRoll={handleExecuteRoll}
          onCancel={() => {
            setShowRollManager(false);
            setSelectedStructureForRoll(undefined);
            setShowRollDropdown(false);
          }}
        />
      )}

      {showOperationsPanel && selectedStructureForOperations && (
        <OperationsPanel
          structure={selectedStructureForOperations}
          onClose={() => {
            setShowOperationsPanel(false);
            setSelectedStructureForOperations(undefined);
          }}
        />
      )}

      {showAllOperationsPanel && (
        <AllOperationsPanel
          structures={structures}
          rolls={rolls}
          onClose={() => setShowAllOperationsPanel(false)}
        />
      )}

      {showRollHistoryCalendar && (
        <RollHistoryCalendar
          rolls={rolls}
          structures={structures}
          onClose={() => setShowRollHistoryCalendar(false)}
        />
      )}

      {showZeroStructureUploader && selectedStructureForZero && (
        <StructureCSVUploader
          structure={selectedStructureForZero}
          onUpload={handleZeroStructureUpload}
          onCancel={() => {
            setShowZeroStructureUploader(false);
            setSelectedStructureForZero(undefined);
          }}
          isZeroMode={true}
        />
      )}

      {showExerciseModal && selectedStructureForExercise && (
        <ExerciseOptionsModal
          structure={selectedStructureForExercise}
          onConfirm={handleExerciseOptions}
          onCancel={() => {
            setShowExerciseModal(false);
            setSelectedStructureForExercise(undefined);
          }}
        />
      )}
    </div>
  );
}

export default App;