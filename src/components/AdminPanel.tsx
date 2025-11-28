import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, TrendingUp, Search, Filter, Eye, Trash2, X, Edit2, Crown, Building, User, Target, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile, UserPlan } from '../types/trading';
import PricingHeroSection from './pricing/PricingHeroSection';
import UserEditModal from './admin/UserEditModal';

const AVAILABLE_PLANS: UserPlan[] = [
  {
    id: 'free',
    type: 'FREE',
    name: 'Sem Acesso',
    features: ['Sem acesso ao produto', 'Apenas visualização de preços'],
    maxStructures: 0,
    maxUsers: 1,
    hasAdvancedAnalytics: false,
    hasSharedAccess: false,
    hasAdminControls: false
  },
  {
    id: 'individual',
    type: 'INDIVIDUAL',
    name: 'Pessoa Física',
    features: ['Acesso completo à plataforma', 'Estruturas ilimitadas', 'Análises avançadas', 'Suporte prioritário'],
    maxStructures: -1,
    maxUsers: 1,
    hasAdvancedAnalytics: true,
    hasSharedAccess: false,
    hasAdminControls: false
  },
  {
    id: 'corporativo',
    type: 'CORPORATIVO',
    name: 'Corporativo/Consultoria',
    features: ['Até 5 colaboradores', 'Acesso compartilhado', 'Relatórios corporativos', 'Consultoria especializada'],
    maxStructures: -1,
    maxUsers: 5,
    hasAdvancedAnalytics: true,
    hasSharedAccess: true,
    hasAdminControls: true
  }
];

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newThisMonth: number;
  totalStructures: number;
  totalOperations: number;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newThisMonth: 0,
    totalStructures: 0,
    totalOperations: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPricingHero, setShowPricingHero] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUsers();
      loadStats();
    }
  }, [currentUser]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        setLoading(false);
        return;
      }
      console.log('Current user:', user.email);
      setCurrentUser(user);
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin access:', error);
      setCurrentUser(null);
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      if (!currentUser) {
        console.log('No current user, skipping user load');
        setUsers([]);
        return;
      }

      // Check if current user is admin
      const isCurrentUserAdmin = currentUser?.email === 'pedropardal04@gmail.com';
      console.log('Is admin?', isCurrentUserAdmin);
      
      if (!isCurrentUserAdmin) {
        // Non-admin users only see their own data
        const userProfile: UserProfile = {
          id: currentUser.id,
          email: currentUser.email || '',
          name: currentUser.user_metadata?.name || currentUser.email || '',
          phone: currentUser.user_metadata?.phone || '',
          company: currentUser.user_metadata?.company || '',
          plan: AVAILABLE_PLANS.find(p => p.id === currentUser.user_metadata?.plan_id) || AVAILABLE_PLANS[0],
          isActive: true,
          createdAt: currentUser.created_at,
          lastLoginAt: currentUser.last_sign_in_at || undefined
        };
        setUsers([userProfile]);
        return;
      }

      // Admin users can see all users
      const adminProfile: UserProfile = {
        id: currentUser.id,
        email: currentUser.email || '',
        name: currentUser.user_metadata?.name || currentUser.email || '',
        phone: currentUser.user_metadata?.phone || '',
        company: currentUser.user_metadata?.company || '',
        plan: {
          id: 'admin',
          type: 'ADMIN',
          name: 'Administrador',
          price: 0,
          features: ['Acesso irrestrito', 'Painel administrativo', 'Gestão de usuários'],
          maxStructures: -1,
          maxUsers: -1,
          hasAdvancedAnalytics: true,
          hasSharedAccess: true,
          hasAdminControls: true
        },
        isActive: true,
        createdAt: currentUser.created_at,
        lastLoginAt: currentUser.last_sign_in_at || undefined
      };
      setUsers([adminProfile]);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadStats = async () => {
    try {
      if (!currentUser) {
        console.log('No current user, using default stats');
        setStats({
          totalUsers: 1,
          activeUsers: 1,
          newThisMonth: 0,
          totalStructures: 0,
          totalOperations: 0
        });
        return;
      }

      // Get structures count
      const { count: structuresCount } = await supabase
        .from('structures')
        .select('*', { count: 'exact', head: true });

      // Get operations count
      const { count: operationsCount } = await supabase
        .from('operations')
        .select('*', { count: 'exact', head: true });

      // Calculate stats
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const newThisMonth = users.filter(user => 
        new Date(user.createdAt) >= thisMonth
      ).length;

      const activeUsers = users.filter(user => 
        user.lastLoginAt && 
        new Date(user.lastLoginAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length;

      setStats({
        totalUsers: users.length,
        activeUsers,
        newThisMonth,
        totalStructures: structuresCount || 0,
        totalOperations: operationsCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback stats
      setStats({
        totalUsers: 1,
        activeUsers: 1,
        newThisMonth: 0,
        totalStructures: 0,
        totalOperations: 0
      });
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async (updatedUser: UserProfile) => {
    try {
      // Update user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          name: updatedUser.name,
          phone: updatedUser.phone,
          company: updatedUser.company,
          plan: updatedUser.plan
        }
      });

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };
      
  const getPlanBadge = (plan: UserPlan) => {
    const colors = {
      FREE: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      INDIVIDUAL: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      CORPORATIVO: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    const icons = {
      FREE: User,
      INDIVIDUAL: User,
      CORPORATIVO: Building,
      ADMIN: Shield
    };
    
    const Icon = icons[plan.type];
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${colors[plan.type]} flex items-center`}>
        <Icon className="w-3 h-3 mr-1" />
        {plan.name}
      </span>
    );
  };

  const hasAccess = (user: UserProfile) => {
    return user.plan.type !== 'FREE';
  };

  // Check if current user is admin
  const isAdmin = currentUser?.email === 'pedropardal04@gmail.com' || currentUser?.user_metadata?.isAdmin;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Shield className="w-8 h-8 text-blue-400 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-white">Painel Administrativo</h2>
            <p className="text-gray-400">Carregando...</p>
          </div>
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando painel de administração...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Shield className="w-8 h-8 text-red-400 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-white">Erro de Autenticação</h2>
            <p className="text-gray-400">Não foi possível verificar o usuário atual</p>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">Erro de Conexão</h3>
            <p className="text-gray-400">Verifique sua conexão e tente novamente.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Shield className="w-8 h-8 text-red-400 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-white">Acesso Negado</h2>
            <p className="text-gray-400">Você não tem permissão para acessar este painel</p>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">Acesso Restrito</h3>
            <p className="text-gray-400">Apenas administradores podem acessar este painel.</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const isActive = user.lastLoginAt && 
      new Date(user.lastLoginAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    if (statusFilter === 'active') return matchesSearch && isActive;
    if (statusFilter === 'inactive') return matchesSearch && !isActive;
    
    return matchesSearch;
  });

  const getStatusBadge = (user: UserProfile) => {
    const isOnline = user.id === currentUser?.id;
    const isActive = user.lastLoginAt && 
      new Date(user.lastLoginAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (isOnline) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Online</span>;
    } else if (isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Ativo</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inativo</span>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const deleteUser = async (userId: string) => {
    // User deletion requires secure backend implementation
    alert('Funcionalidade de exclusão requer implementação backend segura.');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Shield className="w-8 h-8 text-blue-400 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-white">Painel Administrativo</h2>
            <p className="text-gray-400">Carregando dados...</p>
          </div>
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando dados do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Painel Administrativo - Strategos Partners</h2>
          <p className="text-gray-400">Tecnologia em Tesouraria, Consultoria em Patrimônio</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total de Usuários</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Usuários Ativos</p>
              <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Novos Este Mês</p>
              <p className="text-2xl font-bold text-white">{stats.newThisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Estruturas</p>
              <p className="text-2xl font-bold text-white">{stats.totalStructures}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Operações</p>
              <p className="text-2xl font-bold text-white">{stats.totalOperations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Management */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Gestão de Usuários ({filteredUsers.length})</h2>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="divide-y divide-gray-700">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum usuário encontrado</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className={`p-6 hover:bg-gray-800/50 transition-colors ${!hasAccess(user) ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-sm">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-white">{user.name || user.email}</h3>
                        {user.id === currentUser?.id && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">
                            👑 Você
                          </span>
                        )}
                        {!hasAccess(user) && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30">
                            🚫 SEM ACESSO
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                        <span>{user.email}</span>
                        <span>Criado em {formatDate(user.createdAt)}</span>
                        <span>Último acesso {formatDate(user.lastLoginAt || null)}</span>
                        {getStatusBadge(user)}
                        {getPlanBadge(user.plan)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Editar usuário"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Detalhes do Usuário</h3>
                  <p className="text-purple-100">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Nome</label>
                    <p className="text-white font-medium">{selectedUser.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-400">Email</label>
                    <p className="text-white">{selectedUser.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-400">Telefone</label>
                    <p className="text-white">{selectedUser.phone || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-400">Empresa</label>
                    <p className="text-white">{selectedUser.company || 'Não informado'}</p>
                  </div>
                </div>

                {/* Plan Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Plano Atual</label>
                    <div className="mt-2">
                      {getPlanBadge(selectedUser.plan)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-400">Preço Mensal</label>
                    <p className="text-white font-bold text-lg">Sem cobrança na plataforma</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-400">Acesso ao Sistema</label>
                    <div className="mt-1">
                      {hasAccess(selectedUser) ? (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                          ✅ LIBERADO
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                          🚫 BLOQUEADO
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-400">Recursos</label>
                    <div className="mt-2 space-y-1">
                      {selectedUser.plan.features.map((feature, index) => (
                        <div key={index} className="text-xs text-gray-300 flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-400">Data de Criação</label>
                    <p className="text-white">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-gray-400">Último Acesso</label>
                    <p className="text-white">{selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Nunca'}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Hero Modal */}
      {showPricingHero && (
        <PricingHeroSection
          onClose={() => setShowPricingHero(false)}
          plans={AVAILABLE_PLANS}
        />
      )}

      {/* User Edit Modal */}
      {showEditModal && editingUser && (
        <UserEditModal
          user={editingUser}
          plans={AVAILABLE_PLANS}
          onSave={handleSaveUser}
          onCancel={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}