import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Target, X, Edit2, Upload, RotateCcw, Activity, DollarSign } from 'lucide-react';
import { OptionStructure } from '../types/trading';
import StatusBadge from '../ui/StatusBadge';
import CurrencyDisplay from '../ui/CurrencyDisplay';
import DateDisplay from '../ui/DateDisplay';

      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoBadgeColor(leg.tipo)}`}>
          {leg.tipo}
        </span>
        
        {/* Tags de cobertura para opções */}
        {(leg.tipo === 'CALL' || leg.tipo === 'PUT') && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
            (() => {
              const baseAsset = leg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '');
              
              if (leg.tipo === 'CALL' && leg.posicao === 'VENDIDA') {
                const hasCorrespondingStock = structure.legs.some(otherLeg => 
                  otherLeg.tipo === 'ACAO' && 
                  otherLeg.posicao === 'COMPRADA' && 
                  (otherLeg.ativo.replace(/\d+$/, '') === baseAsset || otherLeg.ativo.startsWith(baseAsset)) &&
                  otherLeg.quantidade >= leg.quantidade
                );
                return hasCorrespondingStock 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border-red-500/30';
              }
              
              if (leg.tipo === 'PUT' && leg.posicao === 'VENDIDA') {
                return 'bg-green-500/20 text-green-400 border-green-500/30';
              }
              
              if (leg.posicao === 'COMPRADA') {
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
              }
              
              return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            })()
          }`}>
            {(() => {
              const baseAsset = leg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/[A-Z]$/, '');
              
              if (leg.tipo === 'CALL' && leg.posicao === 'VENDIDA') {
                const hasCorrespondingStock = structure.legs.some(otherLeg => 
                  otherLeg.tipo === 'ACAO' && 
                  otherLeg.posicao === 'COMPRADA' && 
                  (otherLeg.ativo === baseAsset || otherLeg.ativo.startsWith(baseAsset)) &&
                  otherLeg.quantidade >= leg.quantidade
                );
                return hasCorrespondingStock ? 'COBERTA' : 'DESCOBERTA';
              }
              
              if (leg.tipo === 'PUT' && leg.posicao === 'VENDIDA') {
                return 'COBERTA';
              }
              
              if (leg.posicao === 'COMPRADA') {
                return 'COMPRADA';
              }
              
              return 'VENDIDA';
            })()}
          </span>
        )}
        
        {/* Tags de trava para ações */}
        {leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA' && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
            (() => {
              const baseAsset = leg.ativo.replace(/[A-Z]$/, '');
              const hasCorrespondingCall = structure.legs.some(otherLeg => 
                otherLeg.tipo === 'CALL' && 
                otherLeg.posicao === 'VENDIDA' && 
                otherLeg.ativo.startsWith(baseAsset) &&
                otherLeg.quantidade === leg.quantidade
              );
              return hasCorrespondingCall 
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                : 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            })()
          }`}>
            {(() => {
              const baseAsset = leg.ativo.replace(/[A-Z]$/, '');
              const hasCorrespondingCall = structure.legs.some(otherLeg => 
                otherLeg.tipo === 'CALL' && 
                otherLeg.posicao === 'VENDIDA' && 
                otherLeg.ativo.startsWith(baseAsset) &&
                otherLeg.quantidade === leg.quantidade
              );
              return hasCorrespondingCall ? 'TRAVADA' : 'SEM TRAVA';
            })()}
          </span>
        )}
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLegBadgeColor(leg.posicao)}`}>
          {leg.posicao}
        </span>

        {structure.legs.slice(0, 4).map((leg, index) => (
          <span
            key={index}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-1">
              <span className={`px-2 py-1 text-xs rounded font-medium ${
                leg.tipo === 'CALL' ? 'bg-blue-500/20 text-blue-400' :
                leg.tipo === 'PUT' ? 'bg-purple-500/20 text-purple-400' :
                leg.tipo === 'ACAO' ? 'bg-green-500/20 text-green-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {leg.tipo}
              </span>
              
              <span className={`px-2 py-1 text-xs rounded font-medium ${
                leg.posicao === 'COMPRADA' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
              }`}>
                {leg.posicao}
              </span>
            </div>
            
            {/* Tags de Cobertura */}
            <div className="flex items-center space-x-1">
              {/* Tags para Opções */}
              {(leg.tipo === 'CALL' || leg.tipo === 'PUT') && (
                <span className={`px-2 py-1 text-xs rounded font-medium border ${
                  (() => {
                    const baseAsset = leg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/[A-Z]$/, '');
                    
                    if (leg.tipo === 'CALL' && leg.posicao === 'VENDIDA') {
                      const hasCorrespondingStock = structure.legs.some(otherLeg => 
                        otherLeg.tipo === 'ACAO' && 
                        otherLeg.posicao === 'COMPRADA' && 
                        (otherLeg.ativo === baseAsset || otherLeg.ativo.startsWith(baseAsset)) &&
                        otherLeg.quantidade >= leg.quantidade
                      );
                      return hasCorrespondingStock 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/30';
                    }
                    
                    if (leg.tipo === 'PUT' && leg.posicao === 'VENDIDA') {
                      return 'bg-green-500/20 text-green-400 border-green-500/30';
                    }
                    
                    if (leg.posicao === 'COMPRADA') {
                      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                    }
                    
                    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                  })()
                }`}>
                  {(() => {
                    const baseAsset = leg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/[A-Z]$/, '');
                    
                    if (leg.tipo === 'CALL' && leg.posicao === 'VENDIDA') {
                      const hasCorrespondingStock = structure.legs.some(otherLeg => 
                        otherLeg.tipo === 'ACAO' && 
                        otherLeg.posicao === 'COMPRADA' && 
                        (otherLeg.ativo === baseAsset || otherLeg.ativo.startsWith(baseAsset)) &&
                        otherLeg.quantidade >= leg.quantidade
                      );
                      return hasCorrespondingStock ? 'COBERTA' : 'DESCOBERTA';
                    }
                    
                    if (leg.tipo === 'PUT' && leg.posicao === 'VENDIDA') {
                      return 'COBERTA';
                    }
                    
                    if (leg.posicao === 'COMPRADA') {
                      return 'COMPRADA';
                    }
                    
                    return 'VENDIDA';
                  })()}
                </span>
              )}
              
              {/* Tags para Ações */}
              {leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA' && (
                <span className={`px-2 py-1 text-xs rounded font-medium border ${
                  (() => {
                    const baseAsset = leg.ativo.replace(/[A-Z]$/, '');
                    const hasCorrespondingCall = structure.legs.some(otherLeg => 
                      otherLeg.tipo === 'CALL' && 
                      otherLeg.posicao === 'VENDIDA' && 
                      otherLeg.ativo.startsWith(baseAsset) &&
                      otherLeg.quantidade === leg.quantidade
                    );
                    return hasCorrespondingCall 
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                      : 'bg-purple-500/20 text-purple-400 border-purple-500/30';
                  })()
                }`}>
                  {(() => {
                    const baseAsset = leg.ativo.replace(/[A-Z]$/, '');
                    const hasCorrespondingCall = structure.legs.some(otherLeg => 
                      otherLeg.tipo === 'CALL' && 
                      otherLeg.posicao === 'VENDIDA' && 
                      otherLeg.ativo.startsWith(baseAsset) &&
                      otherLeg.quantidade === leg.quantidade
                    );
                    return hasCorrespondingCall ? 'TRAVADA' : 'SEM TRAVA';
                  })()}
                </span>
              )}
            </div>
            
            <div className="text-xs text-gray-400 mt-1">
              <CurrencyDisplay value={leg.strike || leg.precoEntrada || 0} />
            </div>
          </span>
        ))}
        {structure.legs.length > 4 && (
          <span className="text-xs text-gray-400">
            +{structure.legs.length - 4} mais
          </span>
        )}
      </div>