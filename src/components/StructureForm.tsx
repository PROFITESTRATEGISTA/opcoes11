import React from 'react';

interface StructureFormProps {
  nome: string;
  ativo: string;
  onNomeChange: (nome: string) => void;
  onAtivoChange: (ativo: string) => void;
}

export default function StructureForm({ nome, ativo, onNomeChange, onAtivoChange }: StructureFormProps) {
  const popularAssets = [
    'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'MGLU3', 'WEGE3', 'RENT3', 'LREN3',
    'JBSS3', 'SUZB3', 'USIM5', 'CSNA3', 'GOAU4', 'CIEL3', 'RADL3', 'HAPV3', 'TOTS3'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome da Estrutura *
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => onNomeChange(e.target.value)}
          placeholder="Ex: Iron Condor PETR4"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ativo (Opcional)
        </label>
        <input
          type="text"
          value={ativo}
          onChange={(e) => onAtivoChange(e.target.value.toUpperCase())}
          placeholder="Ex: PETR4, VALE3..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
        />
        
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-2">Ativos Populares:</p>
          <div className="flex flex-wrap gap-1">
            {popularAssets.map(asset => (
              <button
                key={asset}
                onClick={() => onAtivoChange(asset)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
              >
                {asset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}