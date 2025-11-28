import React from 'react';
import { OptionLeg } from '../../types/trading';

interface LegBadgesProps {
  leg: OptionLeg;
  allLegs?: OptionLeg[];
}

export default function LegBadges({ leg, allLegs = [] }: LegBadgesProps) {
  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'CALL':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-purple-100 text-purple-800';
      case 'ACAO':
        return 'bg-gray-100 text-gray-800';
      case 'WIN':
      case 'WDO':
      case 'BIT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLegBadgeColor = (posicao: string) => {
    return posicao === 'COMPRADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getCoverageStatus = () => {
    if (!allLegs || !Array.isArray(allLegs)) {
      return null;
    }
    
    // Lógica apenas para ações
    if (leg.tipo === 'ACAO') {
      const baseAsset = leg.ativo.replace(/\d+$/, '');
      
      if (leg.posicao === 'COMPRADA') {
        // AÇÃO COMPRADA + CALL VENDIDA = "TRAVADA"
        const hasCallVendida = allLegs.some(otherLeg => 
          otherLeg.tipo === 'CALL' && 
          otherLeg.posicao === 'VENDIDA' && 
          (otherLeg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '') === baseAsset ||
           otherLeg.ativo.startsWith(baseAsset)) &&
          otherLeg.quantidade <= leg.quantidade
        );
        
        // AÇÃO COMPRADA + PUT COMPRADA = "HEDGE"
        const hasPutComprada = allLegs.some(otherLeg => 
          otherLeg.tipo === 'PUT' && 
          otherLeg.posicao === 'COMPRADA' && 
          (otherLeg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '') === baseAsset ||
           otherLeg.ativo.startsWith(baseAsset)) &&
          otherLeg.quantidade <= leg.quantidade
        );
        
        if (hasCallVendida) return 'TRAVADA';
        if (hasPutComprada) return 'HEDGE';
        return 'SEM TRAVA';
      }
      
      if (leg.posicao === 'VENDIDA') {
        // AÇÃO VENDIDA + PUT VENDIDA = "TRAVADA"
        const hasPutVendida = allLegs.some(otherLeg => 
          otherLeg.tipo === 'PUT' && 
          otherLeg.posicao === 'VENDIDA' && 
          (otherLeg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '') === baseAsset ||
           otherLeg.ativo.startsWith(baseAsset)) &&
          otherLeg.quantidade <= leg.quantidade
        );
        
        // AÇÃO VENDIDA + CALL COMPRADA = "HEDGE"
        const hasCallComprada = allLegs.some(otherLeg => 
          otherLeg.tipo === 'CALL' && 
          otherLeg.posicao === 'COMPRADA' && 
          (otherLeg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '') === baseAsset ||
           otherLeg.ativo.startsWith(baseAsset)) &&
          otherLeg.quantidade <= leg.quantidade
        );
        
        if (hasPutVendida) return 'TRAVADA';
        if (hasCallComprada) return 'HEDGE';
        return 'DESCOBERTA';
      }
    }
    
    // Lógica para opções vendidas
    if ((leg.tipo === 'CALL' || leg.tipo === 'PUT') && leg.posicao === 'VENDIDA') {
      const baseAsset = leg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '');
      
      if (leg.tipo === 'CALL') {
        // CALL VENDIDA + AÇÃO COMPRADA = "COBERTA"
        const hasAcaoComprada = allLegs.some(otherLeg => 
          otherLeg.tipo === 'ACAO' && 
          otherLeg.posicao === 'COMPRADA' && 
          (otherLeg.ativo.replace(/\d+$/, '') === baseAsset ||
           otherLeg.ativo.startsWith(baseAsset)) &&
          otherLeg.quantidade >= leg.quantidade
        );
        
        return hasAcaoComprada ? 'COBERTA' : 'DESCOBERTA';
      }
      
      if (leg.tipo === 'PUT') {
        // PUT VENDIDA é sempre considerada coberta (cash secured put)
        return 'COBERTA';
      }
    }
    
    return null;
  };

  const coverageStatus = getCoverageStatus();

  return (
    <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoBadgeColor(leg.tipo)}`}>
        {leg.tipo}
      </span>
      
      {coverageStatus && (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
          coverageStatus === 'TRAVADA' 
            ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
            : coverageStatus === 'HEDGE'
            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            : coverageStatus === 'SEM TRAVA'
            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}>
            {coverageStatus}
        </span>
      )}
      
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLegBadgeColor(leg.posicao)}`}>
        {leg.posicao}
      </span>
    </div>
  );
}