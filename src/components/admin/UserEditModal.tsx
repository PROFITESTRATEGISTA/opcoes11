import React, { useState } from 'react';
import { X, Save, User, Building, Crown, Zap } from 'lucide-react';
import { UserProfile, UserPlan } from '../../types/trading';

interface UserEditModalProps {
  user: UserProfile;
  plans: UserPlan[];
  onSave: (user: UserProfile) => void;
  onCancel: () => void;
}

export default function UserEditModal({ user, plans, onSave, onCancel }: UserEditModalProps) {
  const [editedUser, setEditedUser] = useState<UserProfile>({ ...user });

  const formatCurrency = (value: number) => {
    if (value === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'FREE':
        return User;
      case 'PESSOA_FISICA':
        return User;
      case 'CORPORATIVO':
        return Building;
      case 'CONSULTORIA':
        return Crown;
      default:
        return User;
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'FREE':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'PESSOA_FISICA':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'CORPORATIVO':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'CONSULTORIA':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleSave = () => {
    if (!editedUser.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }
    
    if (!editedUser.email.trim()) {
      alert('Email é obrigatório');
      return;
    }

    onSave(editedUser);
  };

  const hasAccess = (plan: UserPlan) => {
    return plan.type !== 'FREE';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-8 h-8 mr-3" />
              <div>
                <h3 className="text-2xl font-bold">Editar Usuário</h3>
                <p className="text-blue-100">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Information */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Informações Pessoais</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome completo do usuário"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={editedUser.phone || ''}
                      onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Empresa</label>
                    <input
                      type="text"
                      value={editedUser.company || ''}
                      onChange={(e) => setEditedUser({ ...editedUser, company: e.target.value })}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>
              </div>

              {/* Current Plan Info */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-white mb-3">Plano Atual</h5>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-800`}>
                      {React.createElement(getPlanIcon(editedUser.plan.type), {
                        className: `w-5 h-5 ${editedUser.plan.type === 'FREE' ? 'text-gray-400' : 
                          editedUser.plan.type === 'PESSOA_FISICA' ? 'text-blue-400' :
                          editedUser.plan.type === 'CORPORATIVO' ? 'text-purple-400' : 'text-green-400'}`
                      })}
                    </div>
                    <div>
                      <p className="font-medium text-white">{editedUser.plan.name}</p>
                     <p className="text-sm text-gray-400">Plano de acesso à plataforma</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {hasAccess(editedUser.plan) ? (
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                        ✅ ATIVO
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        🚫 BLOQUEADO
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Alterar Plano</h4>
                
                <div className="space-y-3">
                  {plans.map((plan) => {
                    const Icon = getPlanIcon(plan.type);
                    const isSelected = editedUser.plan.id === plan.id;
                    
                    return (
                      <button
                        key={plan.id}
                        onClick={() => setEditedUser({ ...editedUser, plan })}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? getPlanColor(plan.type).replace('/20', '/30').replace('text-', 'border-').replace('border-gray', 'border-blue')
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              plan.type === 'FREE' ? 'bg-gray-700' :
                              plan.type === 'PESSOA_FISICA' ? 'bg-blue-600' :
                              plan.type === 'CORPORATIVO' ? 'bg-purple-600' :
                              'bg-green-600'
                            }`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-white">{plan.name}</h5>
                              <p className="text-sm text-gray-400">Plano de acesso à plataforma</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {hasAccess(plan) ? (
                              <span className="text-xs text-green-400 font-medium">✅ Acesso Liberado</span>
                            ) : (
                              <span className="text-xs text-red-400 font-medium">🚫 Sem Acesso</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-400">
                          <div className="flex flex-wrap gap-2">
                            {plan.features.slice(0, 2).map((feature, index) => (
                              <span key={index} className="bg-gray-700 px-2 py-1 rounded">
                                {feature}
                              </span>
                            ))}
                            {plan.features.length > 2 && (
                              <span className="text-gray-500">
                                +{plan.features.length - 2} mais
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plan Features Preview */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-white mb-3">Recursos do Plano Selecionado</h5>
                <div className="space-y-2">
                  {editedUser.plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Estruturas:</span>
                    <span className="text-white ml-2 font-medium">
                      {editedUser.plan.maxStructures === -1 ? 'Ilimitadas' : editedUser.plan.maxStructures}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Usuários:</span>
                    <span className="text-white ml-2 font-medium">
                      {editedUser.plan.maxUsers === 1 ? '1 usuário' : `Até ${editedUser.plan.maxUsers}`}
                    </span>
                  </div>
                  {editedUser.plan.hasSharedAccess && (
                    <div className="col-span-2">
                      <span className="text-gray-400">Acesso Compartilhado:</span>
                      <span className="text-green-400 ml-2 font-medium">✅ Disponível</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={onCancel}
              className="px-6 py-3 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}