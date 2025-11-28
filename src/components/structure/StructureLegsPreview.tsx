import React from 'react';
import { OptionLeg } from '../../types/trading';
import CurrencyDisplay from '../ui/CurrencyDisplay';

interface StructureLegsPreviewProps {
  legs: OptionLeg[];
  maxVisible?: number;
}

export default function StructureLegsPreview({ legs, maxVisible = 4 }: StructureLegsPreviewProps) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-400 mb-2">Pernas da Estrutura:</p>
      <div className="flex flex-wrap gap-1">
        {legs.slice(0, maxVisible).map((leg, index) => (
          <span
            key={index}
            className={`px-2 py-1 text-xs rounded ${
              leg.posicao === 'COMPRADA' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {leg.tipo} <CurrencyDisplay value={leg.strike} />
          </span>
        ))}
        {legs.length > maxVisible && (
          <span className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-400">
            +{legs.length - maxVisible}
          </span>
        )}
      </div>
    </div>
  );
}