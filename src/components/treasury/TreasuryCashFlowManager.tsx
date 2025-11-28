import React from 'react';

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

interface TreasuryCashFlowManagerProps {
  onEntriesChange: () => void;
}

export default function TreasuryCashFlowManager({ onEntriesChange }: TreasuryCashFlowManagerProps) {
  const handleAddEntry = (entryData: {
    type: 'DEPOSIT' | 'WITHDRAWAL';
    description: string;
    amount: number;
  }) => {
    if (!entryData.description.trim() || entryData.amount === 0) {
      alert('Por favor, preencha todos os campos');
      return false;
    }

    const entry: CashFlowEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      type: entryData.type,
      description: entryData.description,
      amount: entryData.type === 'WITHDRAWAL' ? -Math.abs(entryData.amount) : Math.abs(entryData.amount),
      balance: 0 // Will be recalculated
    };

    // Save to localStorage
    const savedEntries = localStorage.getItem('treasury_manual_entries');
    const existingEntries = savedEntries ? JSON.parse(savedEntries) : [];
    const updatedEntries = [...existingEntries, entry];
    localStorage.setItem('treasury_manual_entries', JSON.stringify(updatedEntries));

    onEntriesChange();
    return true;
  };

  const handleDeleteEntry = (entryToDelete: CashFlowEntry) => {
    try {
      // Verificar se é um lançamento que pode ser excluído
      if (entryToDelete.type === 'STRUCTURE_COST' || 
          entryToDelete.type === 'STRUCTURE_PREMIUM' ||
          entryToDelete.relatedStructureId) {
        alert('Este lançamento está vinculado a uma estrutura e não pode ser excluído diretamente. Exclua a estrutura relacionada.');
        return false;
      }

      // Confirmar exclusão
      if (!window.confirm(`Tem certeza que deseja excluir este lançamento?\n\nDescrição: ${entryToDelete.description}\nValor: R$ ${entryToDelete.amount.toFixed(2)}\n\nEsta ação não pode ser desfeita.`)) {
        return false;
      }
      
      onEntriesChange();
      return true;
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error);
      return false;
    }
  };
  return {
    handleAddEntry,
    handleDeleteEntry
  };
}