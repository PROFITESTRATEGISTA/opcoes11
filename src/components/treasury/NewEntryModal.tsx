import React from 'react';
import { X, Plus } from 'lucide-react';

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEntry: {
    type: 'DEPOSIT' | 'WITHDRAWAL';
    description: string;
    amount: number;
  };
  onEntryChange: (field: string, value: any) => void;
  onSave: () => void;
}

export default function NewEntryModal({ 
  isOpen, 
  onClose, 
  newEntry, 
  onEntryChange, 
  onSave 
}: NewEntryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Novo Lançamento</h3>
              <p className="text-blue-100">Adicionar entrada ou saída de caixa</p>
            </div>
            <button
              onClick={onClose}
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
                onChange={(e) => onEntryChange('type', e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="DEPOSIT">Depósito</option>
                <option value="WITHDRAWAL">Saque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
              <input
                type="text"
                value={newEntry.description}
                onChange={(e) => onEntryChange('description', e.target.value)}
                placeholder="Ex: Depósito inicial, Saque para despesas..."
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Valor</label>
              <input
                type="number"
                step="0.01"
                value={newEntry.amount}
                onChange={(e) => onEntryChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}