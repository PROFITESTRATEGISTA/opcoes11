import React from 'react';
import { OptionLeg } from '../../types/trading';
import CurrencyDisplay from '../ui/CurrencyDisplay';

interface UncoveredStockInfoProps {
  leg: OptionLeg;
  allLegs: OptionLeg[];
}

export default function UncoveredStockInfo({ leg, allLegs }: UncoveredStockInfoProps) {
  const precoEntrada = leg.precoEntrada || 0;
  const valorOperacao = precoEntrada * leg.quantidade;

  // Verificar cobertura baseado na posição da ação
  const baseAsset = leg.ativo.replace(/\d+$/, '');
  
  let coverageType = '';
  let coverageDescription = '';
  let riskLevel = '';
  
  if (leg.posicao === 'COMPRADA') {
    // AÇÃO COMPRADA + CALL VENDIDA = "TRAVADA"
    const hasCallVendida = allLegs.some(otherLeg => 
      otherLeg.tipo === 'CALL' && 
      otherLeg.posicao === 'VENDIDA' && 
      otherLeg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '') === baseAsset &&
      otherLeg.quantidade <= leg.quantidade
    );
    
    // AÇÃO COMPRADA + PUT COMPRADA = "HEDGE"
    const hasPutComprada = allLegs.some(otherLeg => 
      otherLeg.tipo === 'PUT' && 
      otherLeg.posicao === 'COMPRADA' && 
      otherLeg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '') === baseAsset &&
      otherLeg.quantidade <= leg.quantidade
    );
    
    if (hasCallVendida) {
      coverageType = 'Posição Travada (Covered Call)';
      coverageDescription = 'Protegida por CALL vendida correspondente';
      riskLevel = 'Risco limitado ao upside';
    } else if (hasPutComprada) {
      coverageType = 'Posição com Hedge (Protective Put)';
      coverageDescription = 'Protegida por PUT comprada correspondente';
      riskLevel = 'Risco limitado ao downside';
    } else {
      coverageType = 'Posição Sem Trava';
      coverageDescription = 'Exposição total ao movimento do ativo';
      riskLevel = 'Risco ilimitado';
    }
  } else {
    // AÇÃO VENDIDA + PUT VENDIDA = "TRAVADA"
    const hasPutVendida = allLegs.some(otherLeg => 
      otherLeg.tipo === 'PUT' && 
      otherLeg.posicao === 'VENDIDA' && 
      otherLeg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '') === baseAsset &&
      otherLeg.quantidade <= leg.quantidade
    );
    
    // AÇÃO VENDIDA + CALL COMPRADA = "HEDGE"
    const hasCallComprada = allLegs.some(otherLeg => 
      otherLeg.tipo === 'CALL' && 
      otherLeg.posicao === 'COMPRADA' && 
      otherLeg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '') === baseAsset &&
      otherLeg.quantidade <= leg.quantidade
    );
    
    if (hasPutVendida) {
      coverageType = 'Posição Travada (Short Put Sintético)';
      coverageDescription = 'Protegida por PUT vendida correspondente';
      riskLevel = 'Risco limitado';
    } else if (hasCallComprada) {
      coverageType = 'Posição com Hedge (Short Protegido)';
      coverageDescription = 'Protegida por CALL comprada correspondente';
      riskLevel = 'Risco limitado ao upside';
    } else {
      coverageType = 'Posição Descoberta (Short Naked)';
      coverageDescription = 'Exposição total ao movimento do ativo';
      riskLevel = 'Risco ilimitado';
    }
  }

  const isProtected = coverageType.includes('Travada') || coverageType.includes('Hedge');
  
  return (
    <div className={`border rounded-lg p-4 ${
      leg.posicao === 'COMPRADA' 
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
    }`}>
      <div className="flex items-center mb-3">
        <div className={`w-3 h-3 rounded-full mr-2 ${
          isProtected ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <h4 className={`font-semibold ${
          leg.posicao === 'COMPRADA' ? 'text-blue-800' : 'text-red-800'
        }`}>
          {coverageType}
        </h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className={`font-medium ${leg.posicao === 'COMPRADA' ? 'text-blue-700' : 'text-red-700'}`}>
            Status:
          </p>
          <p className={`font-bold ${isProtected ? 'text-green-900' : 'text-red-900'}`}>
            {coverageType.split('(')[0].trim()}
          </p>
          <p className={`text-xs ${leg.posicao === 'COMPRADA' ? 'text-blue-600' : 'text-red-600'}`}>
            {coverageDescription}
          </p>
        </div>
        
        <div>
          <p className={`font-medium ${leg.posicao === 'COMPRADA' ? 'text-blue-700' : 'text-red-700'}`}>
            {leg.posicao === 'COMPRADA' ? 'Valor Investido:' : 'Valor da Operação:'}
          </p>
          <p className={`font-bold text-lg ${leg.posicao === 'COMPRADA' ? 'text-blue-900' : 'text-red-900'}`}>
            <CurrencyDisplay value={valorOperacao} />
          </p>
          <p className={`text-xs ${leg.posicao === 'COMPRADA' ? 'text-blue-600' : 'text-red-600'}`}>
            {leg.quantidade} ações × <CurrencyDisplay value={precoEntrada} />
          </p>
        </div>
      </div>
      
      <div className={`mt-3 pt-3 border-t ${leg.posicao === 'COMPRADA' ? 'border-blue-200' : 'border-red-200'}`}>
        <div className="flex items-center justify-between text-xs">
          {isProtected ? (
            <>
              <span className={`${leg.posicao === 'COMPRADA' ? 'text-green-700' : 'text-green-700'}`}>
                ✅ {coverageType.includes('Travada') ? 'Posição travada' : 'Posição com hedge'}
              </span>
              <span className={`font-medium ${leg.posicao === 'COMPRADA' ? 'text-green-600' : 'text-green-600'}`}>
                {riskLevel}
              </span>
            </>
          ) : (
            <>
              <span className={`${leg.posicao === 'COMPRADA' ? 'text-blue-700' : 'text-red-700'}`}>
                ⚠️ {leg.posicao === 'COMPRADA' 
                  ? 'Considere vender uma CALL para criar trava' 
                  : 'Considere comprar CALL ou vender PUT para proteção'
                }
              </span>
              <span className={`font-medium ${leg.posicao === 'COMPRADA' ? 'text-blue-600' : 'text-red-600'}`}>
                {riskLevel}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}