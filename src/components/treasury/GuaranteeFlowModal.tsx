import React, { useState, useEffect } from 'react';
import { X, Plus, Shield, TrendingUp, TrendingDown, Eye, Trash2, Calculator } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GuaranteeEntry {
  id: string;
  date: string;
  type: 'GUARANTEE_ADD' | 'GUARANTEE_REMOVE' | 'GUARANTEE_ADJUSTMENT';
  description: string;
  amount: number;
  balance: number;
  asset_symbol?: string;
  related_structure_id?: string;
  created_at?: string;
}

interface GuaranteeFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGuaranteeBalance: number;
  onGuaranteeChange: () => void;
}

export default function GuaranteeFlowModal({ 
  isOpen, 
  onClose, 
  currentGuaranteeBalance,
  onGuaranteeChange 
}: GuaranteeFlowModalProps) {
  const [guaranteeEntries, setGuaranteeEntries] = useState<GuaranteeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<GuaranteeEntry | null>(null);
  const [showStructureGuarantees, setShowStructureGuarantees] = useState(true);
  const [newEntry, setNewEntry] = useState({
    type: 'GUARANTEE_ADD' as const,
    description: '',
    amount: 0,
    asset_symbol: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadGuaranteeEntries();
      loadStructureGuarantees();
    }
  }, [isOpen]);

  const loadGuaranteeEntries = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load guarantee entries from localStorage for now (could be moved to Supabase)
      const savedEntries = localStorage.getItem(`guarantee_entries_${user.id}`);
      if (savedEntries) {
        setGuaranteeEntries(JSON.parse(savedEntries));
      } else {
        setGuaranteeEntries([]);
      }
    } catch (error) {
      console.error('Error loading guarantee entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStructureGuarantees = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load structures from Supabase to get guarantee movements
      const { data: structuresData } = await supabase
        .from('structures')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (structuresData) {
        const structureGuaranteeEntries: GuaranteeEntry[] = [];
        
        structuresData.forEach(structure => {
          if (structure.status === 'ATIVA' || structure.status === 'FINALIZADA') {
            // Calculate guarantee used by this structure
            const legs = structure.legs || [];
            const guaranteeUsed = legs.reduce((sum: number, leg: any) => {
              if (leg.posicao === 'VENDIDA') {
                if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
                  // Use custom margin or default 15%
                  const marginPercentage = (leg.customMarginPercentage || 15) / 100;
                  return sum + (leg.strike * leg.quantidade * marginPercentage);
                } else if (leg.tipo === 'ACAO') {
                  // Use custom margin or default 100%
                  const marginPercentage = (leg.customMarginPercentage || 100) / 100;
                  return sum + ((leg.precoEntrada || 0) * leg.quantidade * marginPercentage);
                }
              }
              return sum;
            }, 0);

            if (guaranteeUsed > 0) {
              // Structure activation - guarantee blocked
              structureGuaranteeEntries.push({
                id: `structure_guarantee_${structure.id}`,
                date: structure.data_ativacao || structure.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                type: 'GUARANTEE_REMOVE',
                description: `Garantia bloqueada - ${structure.nome}`,
                amount: -guaranteeUsed,
                balance: 0, // Will be recalculated
                related_structure_id: structure.id,
                created_at: structure.data_ativacao || structure.created_at
              });
            }

            if (structure.status === 'FINALIZADA' && guaranteeUsed > 0) {
              // Structure finalization - guarantee released
              structureGuaranteeEntries.push({
                id: `structure_guarantee_release_${structure.id}`,
                date: structure.data_finalizacao || new Date().toISOString().split('T')[0],
                type: 'GUARANTEE_ADD',
                description: `Garantia liberada - ${structure.nome}`,
                amount: guaranteeUsed,
                balance: 0, // Will be recalculated
                related_structure_id: structure.id,
                created_at: structure.data_finalizacao
              });
            }
          }
        });

        // Combine manual and structure guarantee entries
        const manualEntries = guaranteeEntries.filter(entry => !entry.related_structure_id);
        const allEntries = [...manualEntries, ...structureGuaranteeEntries]
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Recalculate balances
        let runningBalance = 0;
        const recalculatedEntries = allEntries.map(entry => {
          runningBalance += entry.amount;
          return { ...entry, balance: runningBalance };
        });

        setGuaranteeEntries(recalculatedEntries);
      }
    } catch (error) {
      console.error('Error loading structure guarantees:', error);
    }
  };

  const saveGuaranteeEntries = async (entries: GuaranteeEntry[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      localStorage.setItem(`guarantee_entries_${user.id}`, JSON.stringify(entries));
      setGuaranteeEntries(entries);
      onGuaranteeChange();
    } catch (error) {
      console.error('Error saving guarantee entries:', error);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.description.trim() || newEntry.amount === 0) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    try {
      // Calculate new balance
      const currentBalance = guaranteeEntries.length > 0 
        ? guaranteeEntries[guaranteeEntries.length - 1].balance 
        : 0;
      
      let amount = 0;
      if (newEntry.type === 'GUARANTEE_REMOVE') {
        amount = -Math.abs(newEntry.amount);
      } else if (newEntry.type === 'GUARANTEE_ADD') {
        amount = Math.abs(newEntry.amount);
      } else {
        // GUARANTEE_ADJUSTMENT can be positive or negative
        amount = newEntry.amount;
      }
      
      const newBalance = currentBalance + amount;

      const entry: GuaranteeEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        type: newEntry.type,
        description: newEntry.description,
        amount: amount,
        balance: newBalance,
        asset_symbol: newEntry.asset_symbol || undefined,
        created_at: new Date().toISOString()
      };

      const updatedEntries = [...guaranteeEntries, entry];
      await saveGuaranteeEntries(updatedEntries);

      // Reset form
      setNewEntry({
        type: 'GUARANTEE_ADD',
        description: '',
        amount: 0,
        asset_symbol: ''
      });
      setShowAddEntry(false);
    } catch (error) {
      console.error('Error adding guarantee entry:', error);
      alert('Erro ao adicionar lançamento de garantia');
    }
  };

  const handleDeleteEntry = async (entryToDelete: GuaranteeEntry) => {
    if (!window.confirm(`Tem certeza que deseja excluir este lançamento de garantia?\n\nDescrição: ${entryToDelete.description}\nValor: ${formatCurrency(entryToDelete.amount)}\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const updatedEntries = guaranteeEntries.filter(entry => entry.id !== entryToDelete.id);
      
      // Recalculate balances
      let runningBalance = 0;
      const recalculatedEntries = updatedEntries.map(entry => {
        runningBalance += entry.amount;
        return { ...entry, balance: runningBalance };
      });

      await saveGuaranteeEntries(recalculatedEntries);
    } catch (error) {
      console.error('Error deleting guarantee entry:', error);
      alert('Erro ao excluir lançamento de garantia');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'GUARANTEE_ADD':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'GUARANTEE_REMOVE':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'GUARANTEE_ADJUSTMENT':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case 'GUARANTEE_ADD':
        return TrendingUp;
      case 'GUARANTEE_REMOVE':
        return TrendingDown;
      case 'GUARANTEE_ADJUSTMENT':
        return Calculator;
      default:
        return Shield;
    }
  };

  const currentBalance = guaranteeEntries.length > 0 
    ? guaranteeEntries[guaranteeEntries.length - 1].balance 
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              <div>
                <h3 className="text-2xl font-bold">Fluxo de Garantias</h3>
                <p className="text-orange-100">Controle de garantias adicionais e ajustes</p>
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-orange-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-400">Garantia Manual</p>
                  <p className={`text-xl font-bold ${currentBalance >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
                    {formatCurrency(currentBalance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <Calculator className="w-6 h-6 text-blue-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-400">Garantia Total</p>
                  <p className="text-xl font-bold text-blue-400">
                    {formatCurrency(currentGuaranteeBalance + currentBalance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-green-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-400">Lançamentos</p>
                  <p className="text-xl font-bold text-green-400">{guaranteeEntries.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add Entry Button */}
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-white">Histórico de Garantias</h4>
            <div className="flex items-center space-x-3">
              <label className="flex items-center text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showStructureGuarantees}
                  onChange={(e) => setShowStructureGuarantees(e.target.checked)}
                  className="mr-2 w-4 h-4 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                />
                Mostrar garantias de estruturas
              </label>
              <button
                onClick={() => setShowAddEntry(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Lançamento
              </button>
            </div>
          </div>

          {/* Guarantee Entries Table */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg">
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Carregando lançamentos...</p>
                </div>
              ) : guaranteeEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-3 text-sm font-medium text-gray-400">Data</th>
                        <th className="text-left py-3 px-3 text-sm font-medium text-gray-400">Tipo</th>
                        <th className="text-left py-3 px-3 text-sm font-medium text-gray-400">Descrição</th>
                        <th className="text-left py-3 px-3 text-sm font-medium text-gray-400">Ativo</th>
                        <th className="text-left py-3 px-3 text-sm font-medium text-gray-400">Origem</th>
                        <th className="text-right py-3 px-3 text-sm font-medium text-gray-400">Valor</th>
                        <th className="text-right py-3 px-3 text-sm font-medium text-gray-400">Saldo</th>
                        <th className="text-center py-3 px-3 text-sm font-medium text-gray-400">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guaranteeEntries
                        .filter(entry => showStructureGuarantees || !entry.related_structure_id)
                        .slice().reverse().map((entry) => {
                        const Icon = getEntryTypeIcon(entry.type);
                        const isStructureEntry = !!entry.related_structure_id;
                        return (
                          <tr key={entry.id} className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                            <td className="py-4 px-3">
                              <div className="text-sm text-white">{formatDate(entry.date)}</div>
                            </td>
                            <td className="py-4 px-3">
                              <div className="flex items-center">
                                <Icon className="w-4 h-4 mr-2 text-gray-400" />
                                <span className={`px-2 py-1 text-xs font-medium rounded border ${getEntryTypeColor(entry.type)} ${
                                  isStructureEntry ? 'opacity-75' : ''
                                }`}>
                                  {entry.type.replace('GUARANTEE_', '').replace('_', ' ')}
                                </span>
                                {isStructureEntry && (
                                  <span className="ml-2 px-2 py-1 text-xs font-medium rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    ESTRUTURA
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-3">
                              <div className="text-sm text-white">{entry.description}</div>
                            </td>
                            <td className="py-4 px-3">
                              <div className="text-sm text-white">
                                {entry.asset_symbol || '-'}
                              </div>
                            </td>
                            <td className="py-4 px-3">
                              <div className="text-sm text-white">
                                {isStructureEntry ? (
                                  <span className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-400">
                                    AUTOMÁTICO
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
                                    MANUAL
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-3 text-right">
                              <div className={`text-sm font-bold ${entry.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount)}
                              </div>
                            </td>
                            <td className="py-4 px-3 text-right">
                              <div className={`text-sm font-bold ${entry.balance >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
                                {formatCurrency(entry.balance)}
                              </div>
                            </td>
                            <td className="py-4 px-3 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => setSelectedEntry(entry)}
                                  className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                  title="Visualizar detalhes"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {!isStructureEntry && (
                                  <button
                                    onClick={() => handleDeleteEntry(entry)}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Excluir lançamento"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                                {isStructureEntry && (
                                  <div className="p-2 text-gray-500" title="Lançamento automático - não pode ser excluído">
                                    <Trash2 className="w-4 h-4 opacity-30" />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhum lançamento de garantia</p>
                  <p className="text-sm text-gray-500">Adicione lançamentos para controlar garantias adicionais</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Entry Modal */}
        {showAddEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
              <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Novo Lançamento de Garantia</h3>
                    <p className="text-green-100">Adicionar ou remover garantia</p>
                  </div>
                  <button
                    onClick={() => setShowAddEntry(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                    <select
                      value={newEntry.type}
                      onChange={(e) => setNewEntry({...newEntry, type: e.target.value as any})}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                    >
                      <option value="GUARANTEE_ADD">Adicionar Garantia</option>
                      <option value="GUARANTEE_REMOVE">Remover Garantia</option>
                      <option value="GUARANTEE_ADJUSTMENT">Ajuste de Garantia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ativo (Opcional)</label>
                    <input
                      type="text"
                      value={newEntry.asset_symbol}
                      onChange={(e) => setNewEntry({...newEntry, asset_symbol: e.target.value.toUpperCase()})}
                      placeholder="Ex: PETR4, VALE3..."
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                    <input
                      type="text"
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                      placeholder="Ex: Garantia adicional PETR4, Ajuste de margem..."
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Valor</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newEntry.amount}
                      onChange={(e) => setNewEntry({...newEntry, amount: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Preview */}
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-300 font-medium">Novo Saldo de Garantia:</span>
                      <span className="text-xl font-bold text-white">
                        {formatCurrency((() => {
                          let amount = 0;
                          if (newEntry.type === 'GUARANTEE_REMOVE') {
                            amount = -Math.abs(newEntry.amount);
                          } else if (newEntry.type === 'GUARANTEE_ADD') {
                            amount = Math.abs(newEntry.amount);
                          } else {
                            amount = newEntry.amount;
                          }
                          return currentBalance + amount;
                        })())}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddEntry(false)}
                    className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddEntry}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entry Details Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700">
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Detalhes do Lançamento</h3>
                    <p className="text-purple-100">{formatDate(selectedEntry.date)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Tipo</p>
                      <span className={`px-3 py-1 text-xs font-medium rounded border ${getEntryTypeColor(selectedEntry.type)}`}>
                        {selectedEntry.type.replace('GUARANTEE_', '').replace('_', ' ')}
                      </span>
                      {selectedEntry.related_structure_id && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          ESTRUTURA
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Valor</p>
                      <p className={`text-lg font-bold ${selectedEntry.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedEntry.amount >= 0 ? '+' : ''}{formatCurrency(selectedEntry.amount)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm font-medium">Descrição</p>
                    <p className="text-white">{selectedEntry.description}</p>
                  </div>

                  {selectedEntry.asset_symbol && (
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Ativo</p>
                      <p className="text-white font-medium">{selectedEntry.asset_symbol}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-400 text-sm font-medium">Saldo Após Lançamento</p>
                    <p className={`text-xl font-bold ${selectedEntry.balance >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
                      {formatCurrency(selectedEntry.balance)}
                    </p>
                  </div>

                  {selectedEntry.related_structure_id && (
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Estrutura Relacionada</p>
                      <p className="text-white">ID: {selectedEntry.related_structure_id}</p>
                      <p className="text-xs text-gray-500">Lançamento automático do sistema</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}