import React from 'react';
import { OptionLeg } from '../../types/trading';
import CurrencyDisplay from '../ui/CurrencyDisplay';

interface CoveredCallInfoProps {
  callLeg: OptionLeg;
  allLegs: OptionLeg[];
}

export default function CoveredCallInfo({ callLeg, allLegs }: CoveredCallInfoProps) {
  // Encontrar a ação correspondente que cobre esta CALL
  const baseAsset = callLeg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '');
  const stockLeg = allLegs.find(leg => 
    leg.tipo === 'ACAO' && 
    leg.posicao === 'COMPRADA' && 
    (leg.ativo.replace(/\d+$/, '') === baseAsset || leg.ativo.startsWith(baseAsset)) &&
    leg.quantidade >= callLeg.quantidade
  );

  // Se não encontrar ação correspondente, não renderizar
  if (!stockLeg) {
    return null;
  }

  // Usar o preço de entrada original se disponível nos dados da CALL, senão usar o preço atual
  const precoEntrada = stockLeg.selectedCallData?.precoEntradaOriginal || stockLeg.precoEntrada || 0;
  const ganhoMaximo = ((callLeg.strike - precoEntrada) + callLeg.premio) * stockLeg.quantidade;
  const rentabilidade = precoEntrada > 0 ? ((ganhoMaximo / (precoEntrada * stockLeg.quantidade)) * 100) : 0;
  
  // Custos: Corretagem entrada/saída + possível exercício
  const corretagemEntrada = 2.50; // Entrada da ação
  const corretagemSaida = 2.50; // Saída da ação (se exercida)
  const custoExercicio = 0.75; // Custo de exercício da CALL (se exercida)
  const custosTotais = corretagemEntrada + corretagemSaida + custoExercicio;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
        <h4 className="font-semibold text-green-800">Trava Coberta Ativa</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-green-700 font-medium">CALL Associada:</p>
          <p className="font-bold text-green-900">{callLeg.ativo}</p>
          <p className="text-green-600 text-xs">
            Strike: <CurrencyDisplay value={callLeg.strike || 0} /> | 
            Prêmio: <CurrencyDisplay value={callLeg.premio} />
          </p>
        </div>
        
        <div>
          <p className="text-green-700 font-medium">Ganho Máximo:</p>
          <p className="font-bold text-green-900 text-lg">
            <CurrencyDisplay value={ganhoMaximo} />
          </p>
          <p className="text-green-600 text-xs">
            Rentabilidade: {rentabilidade.toFixed(2)}%
          </p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-green-200">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="bg-white rounded p-3 border border-green-300">
            <span className="text-xs font-medium text-green-700">Resultado Total:</span>
            <br />
            <span className="text-lg font-bold text-green-900">
              <CurrencyDisplay value={ganhoMaximo + (callLeg.premio * stockLeg.quantidade)} />
            </span>
            <div className="text-xs text-green-600 mt-1">
              Rentabilidade: {(() => {
                const investimentoTotal = precoEntrada * stockLeg.quantidade;
                const resultadoTotal = ganhoMaximo + (callLeg.premio * stockLeg.quantidade);
                const rentabilidadeTotal = investimentoTotal > 0 ? (resultadoTotal / investimentoTotal) * 100 : 0;
                return `${rentabilidadeTotal.toFixed(2)}%`;
              })()}
            </div>
          </div>
          <div className="bg-white rounded p-3 border border-red-300">
            <span className="text-xs font-medium text-red-700">Custos Totais:</span>
            <br />
            <span className="text-lg font-bold text-red-900">
              <CurrencyDisplay value={custosTotais} />
            </span>
            <div className="text-xs text-red-600 mt-1">
              Entrada + Saída + Exercício
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-xs text-green-700">
          <div>
            <span className="font-medium">Preço Entrada:</span>
            <br />
            <span className="font-bold"><CurrencyDisplay value={precoEntrada} /></span>
          </div>
          <div>
            <span className="font-medium">Strike CALL:</span>
            <br />
            <span className="font-bold"><CurrencyDisplay value={callLeg.strike || 0} /></span>
          </div>
          <div>
            <span className="font-medium">Prêmio Recebido:</span>
            <br />
            <span className="font-bold text-green-600">
              +<CurrencyDisplay value={callLeg.premio * stockLeg.quantidade} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}