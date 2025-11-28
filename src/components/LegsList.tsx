import React from 'react';
import { OptionLeg } from '../types/trading';
import LegBadges from './leg/LegBadges';
import LegInfo from './leg/LegInfo';
import LegActions from './leg/LegActions';
import CoveredCallInfo from './leg/CoveredCallInfo';
import UncoveredStockInfo from './leg/UncoveredStockInfo';
import EmptyState from './ui/EmptyState';
import { ShoppingCart } from 'lucide-react';

interface LegsListProps {
  legs: OptionLeg[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

// Utility functions for badge colors
function getTipoBadgeColor(tipo: string): string {
  switch (tipo) {
    case 'ACAO':
    case 'Ação':
      return 'bg-blue-100 text-blue-800';
    case 'CALL':
      return 'bg-green-100 text-green-800';
    case 'PUT':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getLegBadgeColor(posicao: string): string {
  switch (posicao) {
    case 'COMPRADA':
      return 'bg-emerald-100 text-emerald-800';
    case 'VENDIDA':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function LegsList({ legs, onEdit, onDelete }: LegsListProps) {

  if (legs.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Seu carrinho está vazio"
        description="Adicione pernas para montar sua estrutura"
        className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
      />
    );
  }

  return (
    <div className="space-y-4">
      {legs.map((leg, index) => (
        <div key={leg.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoBadgeColor(leg.tipo)}`}>
                  {leg.tipo}
                </span>
                
                {/* Tags de cobertura para opções */}
                {(leg.tipo === 'CALL' || leg.tipo === 'PUT') && leg.posicao === 'VENDIDA' && (() => {
                  const baseAsset = leg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '');
                  
                  if (leg.tipo === 'CALL') {
                    // CALL vendida: verificar se tem ação correspondente
                    const hasCorrespondingStock = legs.some(otherLeg => 
                      otherLeg.tipo === 'ACAO' && 
                      otherLeg.posicao === 'COMPRADA' && 
                      (otherLeg.ativo.replace(/\d+$/, '') === baseAsset || otherLeg.ativo.startsWith(baseAsset)) &&
                      otherLeg.quantidade >= leg.quantidade
                    );
                    return (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hasCorrespondingStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {hasCorrespondingStock ? 'COBERTA' : 'DESCOBERTA'}
                      </span>
                    );
                  }
                  
                  if (leg.tipo === 'PUT') {
                    // PUT vendida: verificar se tem ação vendida correspondente
                    const hasCorrespondingStockSold = legs.some(otherLeg => 
                      otherLeg.tipo === 'ACAO' && 
                      otherLeg.posicao === 'VENDIDA' && 
                      (otherLeg.ativo.replace(/\d+$/, '') === baseAsset || otherLeg.ativo.startsWith(baseAsset)) &&
                      otherLeg.quantidade >= leg.quantidade
                    );
                    return (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hasCorrespondingStockSold 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {hasCorrespondingStockSold ? 'COBERTA' : 'DESCOBERTA'}
                      </span>
                    );
                  }
                  
                  return null;
                })()}
                
                {/* Mostrar status TRAVADA se for uma ação com CALL vendida correspondente */}
                {leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA' && (() => {
                  const baseAsset = leg.ativo.replace(/\d+$/, '');
                  const hasCorrespondingCall = legs.some(otherLeg => 
                    otherLeg.tipo === 'CALL' && 
                    otherLeg.posicao === 'VENDIDA' && 
                    otherLeg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '') === baseAsset &&
                    otherLeg.quantidade === leg.quantidade
                  );
                  return hasCorrespondingCall ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      TRAVADA
                    </span>
                  ) : null;
                })()}
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLegBadgeColor(leg.posicao)}`}>
                  {leg.posicao}
                </span>
              </div>
            </div>
            
            <LegActions onEdit={() => onEdit(index)} onDelete={() => onDelete(index)} />
          </div>

          {/* Tags de Coberto/Descoberto para CALL e PUT */}
          {leg.tipo === 'ACAO' && (
            <div className="mb-3">
              <LegBadges leg={leg} allLegs={legs} />
            </div>
          )}

          <LegInfo leg={leg} />

          {/* Informações específicas para Covered Call */}
          {leg.tipo === 'CALL' && leg.posicao === 'VENDIDA' && (
            <CoveredCallInfo callLeg={leg} allLegs={legs} />
          )}

          {/* Informações específicas para Ação Descoberta */}
          {leg.tipo === 'ACAO' && (
            <UncoveredStockInfo leg={leg} allLegs={legs} />
          )}
        </div>
      ))}
    </div>
  );
}