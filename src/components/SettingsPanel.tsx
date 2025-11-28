import React, { useState, useEffect } from 'react';
import TeamInviteSystem from './team/TeamInviteSystem';
import { 
  Settings, 
  User, 
  Users,
  Bell, 
  Shield, 
  DollarSign, 
  Calculator, 
  Database,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  Download,
  Upload,
  Plus
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AVAILABLE_PLANS = [
  {
    id: 'free',
    type: 'FREE',
    name: 'Sem Acesso',
    price: 0,
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
    price: 99.90,
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
    name: 'Corporativo',
    price: 199.90,
    features: ['Até 5 colaboradores', 'Acesso compartilhado', 'Relatórios corporativos', 'Suporte dedicado'],
    maxStructures: -1,
    maxUsers: 5,
    hasAdvancedAnalytics: true,
    hasSharedAccess: true,
    hasAdminControls: true
  }
];

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [userPlan, setUserPlan] = useState<any>(null);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  // Trading Settings
  const [tradingSettings, setTradingSettings] = useState({
    defaultBrokerageFee: 2.50,
    emolumentRate: 0.0025,
    taxRate: 0.15,
    exerciseFee: 0.0075 // 0.75% como decimal
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    structureAlerts: true,
    rollAlerts: true,
    profitLossAlerts: true,
    expirationAlerts: true,
    testEmail: ''
  });

  useEffect(() => {
    loadUserProfile();
    loadTradingSettings();
    loadUserPlan();
  }, []);

  const loadTradingSettings = () => {
    const savedSettings = localStorage.getItem('tradingSettings');
    if (savedSettings) {
      setTradingSettings(JSON.parse(savedSettings));
    }
  };
  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfileData(prev => ({
          ...prev,
          name: user.user_metadata?.name || '',
          email: user.email || ''
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadUserPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let plan = AVAILABLE_PLANS.find(p => p.id === user.user_metadata?.plan_id);
        
        // Set admin plan for Pedro's email
        if (user.email === 'pedropardal04@gmail.com') {
          plan = {
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
          };
        } else if (!plan) {
          plan = {
            id: 'free',
            type: 'FREE',
            name: 'Sem Acesso',
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
      }
    } catch (error) {
      console.error('Error loading user plan:', error);
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      // Update profile
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          name: profileData.name,
          phone: profileData.phone,
          company: profileData.company
        }
      });

      if (updateError) throw updateError;

      showMessage('success', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTradingSettingsUpdate = () => {
    // Save to localStorage for now (could be saved to database)
    localStorage.setItem('tradingSettings', JSON.stringify(tradingSettings));
    showMessage('success', 'Configurações de trading atualizadas!');
  };

  const handleNotificationSettingsUpdate = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    showMessage('success', 'Configurações de notificação atualizadas!');
  };

  const handleSendTestEmail = () => {
    if (!testEmail.trim()) {
      showMessage('error', 'Por favor, informe um email para teste');
      return;
    }
    
    // Simulate sending test email
    showMessage('success', `Email de teste enviado para ${testEmail}`);
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'trading', label: 'Custos', icon: Calculator },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'team', label: 'Equipe', icon: Users }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Configurações</h2>
          <p className="text-gray-400">Strategos Partners - Gerencie suas preferências</p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-center ${
          message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
          message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
          'bg-blue-500/10 border-blue-500/20 text-blue-400'
        }`}>
          {message.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
          {message.type === 'error' && <AlertTriangle className="w-5 h-5 mr-2" />}
          {message.type === 'info' && <Info className="w-5 h-5 mr-2" />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Admin Badge */}
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-purple-400 mr-2" />
                  <div>
                    <h4 className="font-medium text-purple-300">Status da Conta</h4>
                    <p className="text-sm text-gray-400">
                      {profileData.email === 'pedropardal04@gmail.com' ? (
                        <span className="text-purple-400 font-medium">👑 Administrador - Acesso Irrestrito</span>
                      ) : (
                        <span className="text-blue-400">👤 Usuário Padrão</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Empresa</label>
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>


              <div className="flex justify-end">
                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {/* Trading Tab */}
          {activeTab === 'trading' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Configurações de Custos Operacionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Corretagem Padrão</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={tradingSettings.defaultBrokerageFee}
                        onChange={(e) => setTradingSettings({...tradingSettings, defaultBrokerageFee: parseFloat(e.target.value)})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Emolumentos (%)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={tradingSettings.emolumentRate * 100}
                      onChange={(e) => setTradingSettings({...tradingSettings, emolumentRate: parseFloat(e.target.value) / 100})}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Imposto (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tradingSettings.taxRate * 100}
                      onChange={(e) => setTradingSettings({...tradingSettings, taxRate: parseFloat(e.target.value) / 100})}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Exercício (%)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">%</span>
                      <input
                        type="number"
                        step="0.001"
                        value={tradingSettings.exerciseFee * 100}
                        onChange={(e) => setTradingSettings({...tradingSettings, exerciseFee: parseFloat(e.target.value) / 100})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Percentual cobrado no exercício de opções
                    </p>
                  </div>
                </div>
              </div>


              <div className="flex justify-end">
                <button
                  onClick={handleTradingSettingsUpdate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Test Email Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Teste de Notificações</h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email para Receber Testes
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendTestEmail}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Teste
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use este email para receber notificações de teste e verificar se está funcionando corretamente
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Preferências de Notificação</h3>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Notificações por Email', description: 'Receber alertas importantes por email' },
                    { key: 'pushNotifications', label: 'Notificações Push', description: 'Notificações no navegador' },
                    { key: 'structureAlerts', label: 'Alertas de Estruturas', description: 'Notificações sobre mudanças nas estruturas' },
                    { key: 'rollAlerts', label: 'Alertas de Rolagem', description: 'Notificações sobre rolagens de posições' },
                    { key: 'profitLossAlerts', label: 'Alertas de P&L', description: 'Notificações sobre lucros e perdas' },
                    { key: 'expirationAlerts', label: 'Alertas de Vencimento', description: 'Notificações sobre vencimentos próximos' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">{setting.label}</h4>
                        <p className="text-sm text-gray-400">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            [setting.key]: e.target.checked
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNotificationSettingsUpdate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Preferências
                </button>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <TeamInviteSystem userPlan={userPlan} currentUser={profileData} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}