import React, { useState } from 'react';
import { OptionStructure, RollPosition, ExerciseRecord } from '../types/trading';
import TreasuryHeader from './treasury/TreasuryHeader';
import BalanceCards from './treasury/BalanceCards';
import BalanceChart from './treasury/BalanceChart';
import AllocationChart from './treasury/AllocationChart';
import CashFlowTable from './treasury/CashFlowTable';
import NewEntryModal from './treasury/NewEntryModal';
import EntryDetailsModal from './treasury/EntryDetailsModal';
import AssetControlModal from './treasury/AssetControlModal';
import AssetsCustodyBreakdown from './treasury/AssetsCustodyBreakdown';
import GuaranteeUsageChart from './treasury/GuaranteeUsageChart';
import TreasuryDataProvider from './treasury/TreasuryDataProvider';
import TreasuryAssetManager from './treasury/TreasuryAssetManager';
import TreasuryCashFlowManager from './treasury/TreasuryCashFlowManager';
import { supabase } from '../lib/supabase';

interface TreasuryPanelProps {
  structures: OptionStructure[];
  rolls: RollPosition[];
  exercises?: ExerciseRecord[];
}

interface CashFlowEntry {
  id: string;
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'STRUCTURE_COST' | 'STRUCTURE_PREMIUM' | 'ROLL_COST' | 'EXERCISE_COST' | 'BROKERAGE' | 'TAX' | 'PROFIT';
  description: string;
  amount: number;
  balance: number;
  relatedStructureId?: string;
  relatedRollId?: string;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  marketPrice: number;
  guaranteeReleased: number;
  usedAsGuarantee: boolean;
  type: 'STOCK' | 'RENDA_FIXA' | 'OPCOES' | 'FUTUROS';
}

export default function TreasuryPanel({ structures, rolls, exercises = [] }: TreasuryPanelProps) {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAssetControl, setShowAssetControl] = useState(false);
  const [showFutureSettlements, setShowFutureSettlements] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: 'DEPOSIT' as const,
    description: '',
    amount: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);
  
  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAddAsset = async (assetData: Omit<Asset, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('assets_custody')
        .insert({
          user_id: user.id,
          symbol: assetData.symbol,
          name: assetData.name,
          quantity: assetData.quantity,
          average_price: assetData.averagePrice,
          market_price: assetData.marketPrice,
          guarantee_released: assetData.guaranteeReleased,
          used_as_guarantee: assetData.usedAsGuarantee,
          type: assetData.type
        });

      if (error) throw error;
      forceRefresh();
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const handleUpdateAsset = async (id: string, updates: Partial<Asset>) => {
    try {
      const { error } = await supabase
        .from('assets_custody')
        .update({
          symbol: updates.symbol,
          name: updates.name,
          quantity: updates.quantity,
          average_price: updates.averagePrice,
          market_price: updates.marketPrice,
          guarantee_released: updates.guaranteeReleased,
          used_as_guarantee: updates.usedAsGuarantee,
          type: updates.type,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      forceRefresh();
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ativo?')) {
      try {
        const { error } = await supabase
          .from('assets_custody')
          .delete()
          .eq('id', id);

        if (error) throw error;
        forceRefresh();
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const loadCashFlowEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('cash_flow_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Forçar refresh do TreasuryDataProvider
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error loading cash flow entries:', error);
    }
  };

  const handleDeleteEntry = async (entryToDelete: CashFlowEntry) => {
    try {
      // Verificar se é um lançamento que pode ser excluído
      if (entryToDelete.type === 'STRUCTURE_COST' || 
          entryToDelete.type === 'STRUCTURE_PREMIUM' ||
          entryToDelete.relatedStructureId) {
        alert('Este lançamento está vinculado a uma estrutura e não pode ser excluído diretamente. Exclua a estrutura relacionada.');
        return;
      }

      // Confirmar exclusão
      if (!window.confirm(`Tem certeza que deseja excluir este lançamento?\n\nDescrição: ${entryToDelete.description}\nValor: R$ ${entryToDelete.amount.toFixed(2)}\n\nEsta ação não pode ser desfeita.`)) {
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Excluir do Supabase
      const { error } = await supabase
        .from('cash_flow_entries')
        .delete()
        .eq('id', entryToDelete.id)
        .eq('user_id', user.id); // Segurança adicional

      if (error) throw error;

      // Recarregar dados
      await loadCashFlowEntries();
      
      // Forçar refresh do TreasuryDataProvider
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Erro ao excluir lançamento');
    }
  };

  const [selectedEntry, setSelectedEntry] = useState<CashFlowEntry | null>(null);

  return (
    <TreasuryDataProvider 
      key={refreshKey}
      refreshKey={refreshKey}
      structures={structures} 
      rolls={rolls} 
      exercises={exercises}
    >
      {(treasuryData) => {
        const { balances, cashFlowEntries, assets, assetAllocation, futureSettlements, projectedBalance } = treasuryData;
        
        // Asset manager
        const assetManager = TreasuryAssetManager({ 
          assets, 
          onAssetsChange: () => forceRefresh() 
        });

        // Cash flow manager
        const cashFlowManager = TreasuryCashFlowManager({
          onEntriesChange: () => forceRefresh()
        });

        const handleAddEntry = () => {
          handleAddEntryToSupabase();
        };

        const handleAddEntryToSupabase = async () => {
          if (!newEntry.description.trim() || newEntry.amount === 0) {
            alert('Por favor, preencha todos os campos');
            return;
          }

          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get current balance
            const { data: lastEntry } = await supabase
              .from('cash_flow_entries')
              .select('balance')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            const currentBalance = lastEntry?.balance || 0;
            const amount = newEntry.type === 'WITHDRAWAL' ? -Math.abs(newEntry.amount) : Math.abs(newEntry.amount);
            const newBalance = currentBalance + amount;

            const { error } = await supabase
              .from('cash_flow_entries')
              .insert({
                user_id: user.id,
                date: new Date().toISOString().split('T')[0],
                type: newEntry.type,
                description: newEntry.description,
                amount: amount,
                balance: newBalance
              });

            if (error) throw error;

            // Reset form and close modal
            setNewEntry({ type: 'DEPOSIT', description: '', amount: 0 });
            setShowAddEntry(false);
            
            // Force refresh
            forceRefresh();
          } catch (error) {
            console.error('Error adding entry:', error);
            alert('Erro ao adicionar lançamento');
          }
        };

        const handleDeleteEntryLocal = (entry: CashFlowEntry) => {
          const success = cashFlowManager.handleDeleteEntry(entry);
          if (success) {
            // Refresh será chamado automaticamente pelo onEntriesChange
          }
        };
        
        const handleStructureChange = () => {
          // Force refresh when structures change
          forceRefresh();
        };
        
        console.log('🔍 TreasuryPanel - Final Balances:', {
          currentBalance: balances.currentBalance,
          freeAmount: balances.freeAmount,
          totalBalance: balances.totalBalance,
          totalInvested: balances.totalInvested
        });

        return (
          <div className="space-y-6">
            <TreasuryHeader 
              onAddEntry={() => setShowAddEntry(true)}
              onManageAssets={() => setShowAssetControl(true)}
            />

            <BalanceCards
              currentBalance={balances.totalBalance}
              freeAmount={balances.currentBalance}
              totalInvested={balances.totalNocional}
              totalExposure={balances.totalBalance}
              totalGuaranteeAvailable={balances.totalGuaranteeAvailable}
              structures={structures}
              assets={assets}
            />

            <BalanceChart cashFlowEntries={cashFlowEntries} />
            
            <div className="grid grid-cols-1 gap-6">
              <AllocationChart assetAllocation={assetAllocation} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AssetsCustodyBreakdown 
                assets={assets} 
                structures={structures}
                currentBalance={balances.freeAmount}
              />
              <GuaranteeUsageChart 
                assets={assets} 
                structures={structures}
                totalGuaranteeAvailable={balances.totalGuaranteeAvailable}
                guaranteeUsed={balances.guaranteeUsed}
              />
            </div>

            <CashFlowTable
              cashFlowEntries={cashFlowEntries}
              currentBalance={balances.currentBalance}
              structures={structures}
              onViewEntry={setSelectedEntry}
              onDeleteEntry={handleDeleteEntryLocal}
            />

            <NewEntryModal
              isOpen={showAddEntry}
              onClose={() => setShowAddEntry(false)}
              newEntry={newEntry}
              onEntryChange={(field, value) => setNewEntry(prev => ({ ...prev, [field]: value }))}
              onSave={handleAddEntry}
            />

            <EntryDetailsModal
              entry={selectedEntry}
              structures={structures}
              onClose={() => setSelectedEntry(null)}
            />

            <AssetControlModal
              isOpen={showAssetControl}
              onClose={() => setShowAssetControl(false)}
              assets={assets}
              structures={structures}
              onAddAsset={handleAddAsset}
              onUpdateAsset={handleUpdateAsset}
              onDeleteAsset={handleDeleteAsset}
            />
          </div>
        );
      }}
    </TreasuryDataProvider>
  );
}