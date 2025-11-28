import React from 'react';
import { OptionLeg } from '../../types/trading';
import CurrencyDisplay from '../ui/CurrencyDisplay';

interface LegInfoProps {
  leg: OptionLeg;
}

export default function LegInfo({ leg }: LegInfoProps) {
  const getDisplayValue = () => {
    if (leg.tipo === 'ACAO') {
      // Para ações, mostrar o preço de entrada original se existir selectedCallData, senão o preço atual
      if (leg.selectedCallData?.precoEntradaOriginal) {
        return leg.selectedCallData.precoEntradaOriginal;
      }
      return leg.precoEntrada || 0;
    }
    if (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') {
      return leg.precoVista || 0;
    }
    return leg.strike;
  };

  const getDisplayLabel = () => {
    if (leg.tipo === 'ACAO') {
      return 'Preço Entrada';
    }
    if (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') {
      return 'Preço Futuro';
    }
    return 'Strike';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <p className="text-gray-600 font-medium">Ativo</p>
        <p className="font-bold text-gray-900">{leg.ativo}</p>
      </div>
      
      <div>
        <p className="text-gray-600 font-medium">{getDisplayLabel()}</p>
        <p className="font-bold text-gray-900">
          <CurrencyDisplay value={getDisplayValue()} />
        </p>
      </div>
      
      <div>
        <p className="text-gray-600 font-medium">Prêmio</p>
        <p className={`font-bold ${leg.premio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <CurrencyDisplay value={leg.premio} />
        </p>
      </div>
      
      <div>
        <p className="text-gray-600 font-medium">Quantidade</p>
        <p className="font-bold text-gray-900">{leg.quantidade}</p>
      </div>
    </div>
  );
}