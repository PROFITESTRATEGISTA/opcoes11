import React, { useState, useEffect } from 'react';
import { Mail, Users, Clock, Check, X, AlertCircle, UserPlus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TeamInvite {
  id: string;
  owner_user_id: string;
  invited_email: string;
  invited_user_id?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  permissions: {
    canCreateStructures: boolean;
    canEditStructures: boolean;
    canExecuteRolls: boolean;
    canViewReports: boolean;
    canManageTreasury: boolean;
  };
  invited_at: string;
  responded_at?: string;
  expires_at: string;
  owner_name?: string;
  owner_email?: string;
}

interface TeamMember {
  id: string;
  owner_user_id: string;
  member_user_id: string;
  permissions: {
    canCreateStructures: boolean;
    canEditStructures: boolean;
    canExecuteRolls: boolean;
    canViewReports: boolean;
    canManageTreasury: boolean;
  };
  joined_at: string;
  last_active_at: string;
  member_name?: string;
  member_email?: string;
}

interface TeamInviteSystemProps {
  userPlan: any;
  currentUser: any;
}

export default function TeamInviteSystem({ userPlan, currentUser }: TeamInviteSystemProps) {
  const [sentInvites, setSentInvites] = useState<TeamInvite[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<TeamInvite[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermissions, setInvitePermissions] = useState({
    canCreateStructures: true,
    canEditStructures: true,
    canExecuteRolls: true,
    canViewReports: true,
    canManageTreasury: false
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadTeamData();
    }
  }, [currentUser]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSentInvites(),
        loadReceivedInvites(),
        loadTeamMembers()
      ]);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSentInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('team_invites')
        .select('*')
        .eq('owner_user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSentInvites(data || []);
    } catch (error) {
      console.error('Error loading sent invites:', error);
    }
  };

  const loadReceivedInvites = async () => {
    try {
      // First get invites by email or user_id
      const { data: invites, error } = await supabase
        .from('team_invites')
        .select('*')
        .or(`invited_email.eq.${currentUser.email},invited_user_id.eq.${currentUser.id}`)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading received invites:', error);
        setReceivedInvites([]);
        return;
      }
      
      // Then get owner details for each invite
      const formattedInvites = [];
      
      for (const invite of invites || []) {
        try {
          const { data: ownerData } = await supabase.auth.admin.getUserById(invite.owner_user_id);
          formattedInvites.push({
            ...invite,
            owner_name: ownerData?.user?.user_metadata?.name || ownerData?.user?.email,
            owner_email: ownerData?.user?.email
          });
        } catch (ownerError) {
          // If can't get owner data, still show invite with basic info
          formattedInvites.push({
            ...invite,
            owner_name: 'Usuário',
            owner_email: 'email@exemplo.com'
          });
        }
      }
      
      setReceivedInvites(formattedInvites);
    } catch (error) {
      console.error('Error loading received invites:', error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      // First get team members
      const { data: members, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('owner_user_id', currentUser.id)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error loading team members:', error);
        setTeamMembers([]);
        return;
      }
      
      // Then get member details for each member
      const formattedMembers = [];
      
      for (const member of members || []) {
        try {
          const { data: memberData } = await supabase.auth.admin.getUserById(member.member_user_id);
          formattedMembers.push({
            ...member,
            member_name: memberData?.user?.user_metadata?.name || memberData?.user?.email,
            member_email: memberData?.user?.email,
            last_active_at: memberData?.user?.last_sign_in_at || member.last_active_at
          });
        } catch (memberError) {
          // If can't get member data, still show with basic info
          formattedMembers.push({
            ...member,
            member_name: 'Usuário',
            member_email: 'email@exemplo.com',
            last_active_at: member.last_active_at
          });
        }
      }
      
      setTeamMembers(formattedMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) {
      alert('Por favor, informe um email válido');
      return;
    }

    if (inviteEmail === currentUser.email) {
      alert('Você não pode convidar a si mesmo');
      return;
    }

    // Check if already invited
    const existingInvite = sentInvites.find(invite => 
      invite.invited_email === inviteEmail && invite.status === 'PENDING'
    );
    
    if (existingInvite) {
      alert('Este email já possui um convite pendente');
      return;
    }

    // Check if already a member
    const existingMember = teamMembers.find(member => 
      member.member_email === inviteEmail
    );
    
    if (existingMember) {
      alert('Este usuário já é membro da equipe');
      return;
    }

    try {
      setSending(true);
      
      const { error } = await supabase
        .from('team_invites')
        .insert({
          owner_user_id: currentUser.id,
          invited_email: inviteEmail.toLowerCase().trim(),
          permissions: invitePermissions,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      setInviteEmail('');
      await loadSentInvites();
      alert('Convite enviado com sucesso!');
    } catch (error) {
      console.error('Error sending invite:', error);
      alert('Erro ao enviar convite. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const cancelInvite = async (inviteId: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar este convite?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('team_invites')
        .update({
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId);

      if (error) throw error;
      await loadSentInvites();
    } catch (error) {
      console.error('Error cancelling invite:', error);
      alert('Erro ao cancelar convite');
    }
  };

  const resendInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('team_invites')
        .update({
          invited_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId);

      if (error) throw error;
      await loadSentInvites();
      alert('Convite reenviado com sucesso!');
    } catch (error) {
      console.error('Error resending invite:', error);
      alert('Erro ao reenviar convite');
    }
  };

  const acceptInvite = async (inviteId: string) => {
    try {
      // Get invite details first
      const { data: invite, error: fetchError } = await supabase
        .from('team_invites')
        .select('*')
        .eq('id', inviteId)
        .single();

      if (fetchError) throw fetchError;

      if (!invite) {
        throw new Error('Convite não encontrado');
      }

      // Update invite status
      const { error: updateError } = await supabase
        .from('team_invites')
        .update({
          status: 'ACCEPTED',
          invited_user_id: currentUser.id,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      // Add to team members
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          owner_user_id: invite.owner_user_id,
          member_user_id: currentUser.id,
          permissions: invite.permissions
        });

      if (memberError) throw memberError;

      await loadTeamData();
      alert('Convite aceito com sucesso! Você agora faz parte da equipe.');
    } catch (error) {
      console.error('Error accepting invite:', error);
      alert('Erro ao aceitar convite');
    }
  };

  const rejectInvite = async (inviteId: string) => {
    if (!window.confirm('Tem certeza que deseja rejeitar este convite?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('team_invites')
        .update({
          status: 'REJECTED',
          invited_user_id: currentUser.id,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId);

      if (error) throw error;
      await loadReceivedInvites();
    } catch (error) {
      console.error('Error rejecting invite:', error);
      alert('Erro ao rejeitar convite');
    }
  };

  const removeMember = async (memberId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este membro da equipe?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      await loadTeamMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Erro ao remover membro');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isInviteExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'ACCEPTED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'CANCELLED':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const canInviteMore = () => {
    if (userPlan?.type === 'ADMIN') return true;
    if (userPlan?.type === 'CORPORATIVO') {
      const totalMembers = teamMembers.length + sentInvites.filter(i => i.status === 'PENDING').length;
      return totalMembers < 5;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Carregando dados da equipe...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Received Invites Section - Show for all users */}
      {receivedInvites.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-300 mb-4">
            Convites Recebidos ({receivedInvites.length})
          </h4>
          
          <div className="space-y-3">
            {receivedInvites.map((invite) => (
              <div key={invite.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-semibold text-white">
                      Convite de {invite.owner_name || invite.owner_email}
                    </h5>
                    <p className="text-sm text-gray-400">
                      Convidado em {formatDate(invite.invited_at)}
                    </p>
                    {isInviteExpired(invite.expires_at) && (
                      <span className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        EXPIRADO
                      </span>
                    )}
                  </div>
                  
                  {!isInviteExpired(invite.expires_at) && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => acceptInvite(invite.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Aceitar
                      </button>
                      <button
                        onClick={() => rejectInvite(invite.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-2">Permissões oferecidas:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(invite.permissions).map(([key, value]) => (
                      <div key={key} className={`flex items-center ${value ? 'text-green-400' : 'text-gray-500'}`}>
                        {value ? '✅' : '❌'} {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Management Section - Only for Corporate/Admin plans */}
      {(userPlan?.type === 'CORPORATIVO' || userPlan?.type === 'ADMIN') && (
        <>
          {/* Send Invite Section */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Convidar Colaborador</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email do Colaborador
                </label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colaborador@empresa.com"
                    className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={!canInviteMore()}
                  />
                  <button
                    onClick={sendInvite}
                    disabled={sending || !canInviteMore() || !inviteEmail.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Convidar
                      </>
                    )}
                  </button>
                </div>
                
                {!canInviteMore() && (
                  <p className="text-red-400 text-sm mt-2">
                    Limite de membros atingido para seu plano
                  </p>
                )}
              </div>

              {/* Permissions */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-300 mb-3">Permissões do Colaborador</h5>
                <div className="space-y-3">
                  {Object.entries(invitePermissions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">
                          {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {key === 'canCreateStructures' && 'Permitir criação de novas estruturas'}
                          {key === 'canEditStructures' && 'Permitir edição de estruturas existentes'}
                          {key === 'canExecuteRolls' && 'Permitir execução de rolagens'}
                          {key === 'canViewReports' && 'Acesso aos relatórios e análises'}
                          {key === 'canManageTreasury' && 'Acesso ao painel de tesouraria'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setInvitePermissions(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              Membros da Equipe ({teamMembers.length + 1})
            </h4>
            
            <div className="space-y-3">
              {/* Current User */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {(currentUser.user_metadata?.name || currentUser.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-medium text-white">
                        {currentUser.user_metadata?.name || currentUser.email}
                      </h5>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-400">{currentUser.email}</p>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                          PROPRIETÁRIO
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                    ONLINE
                  </span>
                </div>
              </div>

              {/* Team Members */}
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {(member.member_name || member.member_email || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium text-white">{member.member_name || member.member_email}</h5>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-400">{member.member_email}</p>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                            COLABORADOR
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Entrou em {formatDate(member.joined_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                        ATIVO
                      </span>
                      <button
                        onClick={() => removeMember(member.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remover colaborador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Sent Invites */}
              {sentInvites.filter(invite => invite.status === 'PENDING').map((invite) => (
                <div key={invite.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {invite.invited_email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium text-white">{invite.invited_email}</h5>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-400">
                            Convite enviado há {Math.ceil((Date.now() - new Date(invite.invited_at).getTime()) / (1000 * 60 * 60 * 24))} dias
                          </p>
                          <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(invite.status)}`}>
                            {invite.status}
                          </span>
                        </div>
                        {isInviteExpired(invite.expires_at) && (
                          <p className="text-xs text-red-400">Convite expirado</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!isInviteExpired(invite.expires_at) && (
                        <button
                          onClick={() => resendInvite(invite.id)}
                          className="px-3 py-1 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors text-xs"
                        >
                          Reenviar
                        </button>
                      )}
                      <button
                        onClick={() => cancelInvite(invite.id)}
                        className="px-3 py-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {teamMembers.length === 0 && sentInvites.filter(i => i.status === 'PENDING').length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-700 rounded-lg">
                  <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Nenhum colaborador na equipe</p>
                  <p className="text-gray-500 text-xs">
                    {userPlan?.type === 'CORPORATIVO' 
                      ? 'Convide até 5 colaboradores para acessar esta conta'
                      : 'Compartilhe o acesso com sua equipe administrativa'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Team Statistics */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-300 mb-3">Estatísticas da Equipe</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-900 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">{teamMembers.length + 1}</p>
                <p className="text-xs text-gray-400">Membros Ativos</p>
              </div>
              <div className="text-center p-3 bg-gray-900 rounded-lg">
                <p className="text-2xl font-bold text-yellow-400">
                  {sentInvites.filter(i => i.status === 'PENDING').length}
                </p>
                <p className="text-xs text-gray-400">Convites Pendentes</p>
              </div>
              <div className="text-center p-3 bg-gray-900 rounded-lg">
                <p className="text-2xl font-bold text-green-400">
                  {userPlan?.type === 'CORPORATIVO' ? '5' : '∞'}
                </p>
                <p className="text-xs text-gray-400">Limite de Membros</p>
              </div>
              <div className="text-center p-3 bg-gray-900 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">
                  {userPlan?.type === 'CORPORATIVO' 
                    ? Math.max(0, 5 - teamMembers.length - sentInvites.filter(i => i.status === 'PENDING').length)
                    : '∞'
                  }
                </p>
                <p className="text-xs text-gray-400">Vagas Disponíveis</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Individual Plan Message */}
      {userPlan?.type === 'INDIVIDUAL' && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 text-center">
          <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-blue-300 mb-2">Plano Individual</h4>
          <p className="text-gray-400 mb-4">
            Seu plano atual não suporta acesso compartilhado
          </p>
          <p className="text-sm text-gray-500">
            Faça upgrade para o plano Corporativo para convidar colaboradores
          </p>
        </div>
      )}
    </div>
  );
}