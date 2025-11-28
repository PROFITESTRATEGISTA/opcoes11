import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { OptionStructure, TradingOperation, RollPosition } from '../types/trading'

export function useStructures() {
  const [structures, setStructures] = useState<OptionStructure[]>([])
  const [rolls, setRolls] = useState<RollPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load rolls from localStorage (since we don't have a rolls table yet)
  const loadRolls = () => {
    try {
      // Get current user first
      const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        return user
      }
      
      getCurrentUser().then(user => {
        if (!user) return
        
        const userRollsKey = `trading_rolls_${user.id}`
        const savedRolls = localStorage.getItem(userRollsKey)
        console.log('Carregando rolls do localStorage para usuário:', user.id, savedRolls)
        if (savedRolls) {
          const parsedRolls = JSON.parse(savedRolls)
          console.log('Rolls carregados para usuário:', user.id, parsedRolls)
          setRolls(parsedRolls)
        } else {
          setRolls([])
        }
      })
    } catch (err) {
      console.error('Error loading rolls:', err)
      setRolls([])
    }
  }

  // Save rolls to localStorage with user isolation
  const saveRolls = async (newRolls: RollPosition[]) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      const userRollsKey = `trading_rolls_${user.id}`
      console.log('Salvando rolls para usuário:', user.id, newRolls)
      localStorage.setItem(userRollsKey, JSON.stringify(newRolls))
      setRolls(newRolls)
    } catch (err) {
      console.error('Error saving rolls:', err)
    }
  }

  // Delete roll
  const deleteRoll = async (rollId: string) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      const updatedRolls = rolls.filter(roll => roll.id !== rollId)
      await saveRolls(updatedRolls)
      return true
    } catch (err) {
      console.error('Error deleting roll:', err)
      setError(err instanceof Error ? err.message : 'Erro ao excluir rolagem')
      return false
    }
  }

  // Load structures from Supabase
  const loadStructures = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found, clearing structures')
        setStructures([])
        setLoading(false)
        return
      }

      // Load rolls from localStorage
      loadRolls()
      
      const { data, error } = await supabase
        .from('structures')
        .select(`
          *,
          operations (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase query error:', error)
        // Don't throw error immediately, try to handle gracefully
        console.warn('Error loading structures, using empty array:', error.message)
        setStructures([])
        setLoading(false)
        return
      }

      if (!data) {
        console.warn('No data returned from Supabase')
        setStructures([])
        setLoading(false)
        return
      }
      const formattedStructures: OptionStructure[] = data.map(item => ({
        id: item.id,
        nome: item.nome,
        ativo: item.ativo,
        legs: item.legs || [],
        premioLiquido: item.premio_liquido,
        custoMontagem: item.custo_montagem,
        dataVencimento: item.data_vencimento,
        status: item.status,
        dataAtivacao: item.data_ativacao,
        dataFinalizacao: item.data_finalizacao,
        operacoes: item.operations?.map((op: any) => ({
          id: op.id,
          tipo: op.tipo,
          ativo: op.ativo,
          pm: op.pm,
          strike: op.strike,
          quantidade: op.quantidade,
          premio: op.premio,
          taxaColeta: op.taxa_coleta,
          alta: op.alta,
          recompensa: op.recompensa,
          dataEntrada: op.data_entrada,
          dataSaida: op.data_saida,
          status: op.status,
          resultado: op.resultado
        })) || []
      }))

      setStructures(formattedStructures)
    } catch (err) {
      console.error('Error in loadStructures:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar estruturas')
      setStructures([]) // Clear structures on error
    } finally {
      setLoading(false)
    }
  }

  // Register structure cost in cash flow
  const registerStructureCashFlow = async (userId: string, structure: OptionStructure) => {
    try {
      // Get current balance
      const { data: lastEntry } = await supabase
        .from('cash_flow_entries')
        .select('balance')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const currentBalance = lastEntry?.balance || 0;
      
      // 1. Register structure assembly cost
      let runningBalance = currentBalance - structure.custoMontagem;
      
      // Register assembly cost
      const { error } = await supabase
        .from('cash_flow_entries')
        .insert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          type: 'STRUCTURE_COST',
          description: `Custo de montagem - ${structure.nome}`,
          amount: -structure.custoMontagem,
          balance: runningBalance,
          related_structure_id: structure.id
        });

      if (error) throw error;
      
      // 2. Group legs by asset to avoid duplicates - CONSOLIDADO
      const consolidatedEntries: {[key: string]: {
        type: 'STOCK' | 'PREMIUM';
        description: string;
        amount: number;
        symbol?: string;
      }} = {};
      
      // Consolidar ações por símbolo
      structure.legs.forEach(leg => {
        if (leg.tipo === 'ACAO') {
          const symbol = leg.ativo;
          const value = (leg.precoEntrada || 0) * leg.quantidade;
          const amount = leg.posicao === 'COMPRADA' ? -value : value;
          
          if (!consolidatedEntries[symbol]) {
            consolidatedEntries[symbol] = {
              type: 'STOCK',
              description: '',
              amount: 0,
              symbol
            };
          }
          
          consolidatedEntries[symbol].amount += amount;
          
          // Update description based on final net position
          const finalAmount = consolidatedEntries[symbol].amount;
          const netQuantity = Math.abs(finalAmount / (leg.precoEntrada || 1));
          consolidatedEntries[symbol].description = `${finalAmount > 0 ? 'Venda' : 'Compra'} líquida ${netQuantity.toFixed(0)} ${symbol} - ${structure.nome}`;
        }
      });
      
      // Consolidar prêmios por estrutura (uma única entrada)
      const totalPremium = structure.legs
        .filter(leg => leg.tipo === 'CALL' || leg.tipo === 'PUT' || leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT')
        .reduce((sum, leg) => sum + ((leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio) * leg.quantidade), 0);
      
      if (totalPremium !== 0) {
        consolidatedEntries[`PREMIUM_${structure.id}`] = {
          type: 'PREMIUM',
          description: `${totalPremium > 0 ? 'Prêmio recebido' : 'Prêmio pago'} - ${structure.nome}`,
          amount: totalPremium
        };
      }
      
      // 3. Register consolidated entries (apenas uma entrada por ativo/prêmio)
      for (const [key, entry] of Object.entries(consolidatedEntries)) {
        if (entry.amount !== 0) {
          runningBalance += entry.amount;
          
          await supabase
            .from('cash_flow_entries')
            .insert({
              user_id: userId,
              date: new Date().toISOString().split('T')[0],
              type: entry.type === 'STOCK' 
                ? (entry.amount > 0 ? 'DEPOSIT' : 'WITHDRAWAL')
                : 'STRUCTURE_PREMIUM',
              description: entry.description,
              amount: entry.amount,
              balance: runningBalance,
              related_structure_id: structure.id
            });
        }
      }
    } catch (error) {
      console.error('Error registering structure cash flow:', error);
    }
  };

  // Register assets in custody automatically
  const registerAssetsInCustody = async (userId: string, structure: OptionStructure) => {
    try {
      // Process stock legs
      const stockLegs = structure.legs.filter(leg => leg.tipo === 'ACAO');
      
      for (const leg of stockLegs) {
        // Check if asset already exists
        const { data: existingAsset } = await supabase
          .from('assets_custody')
          .select('*')
          .eq('user_id', userId)
          .eq('symbol', leg.ativo)
          .single();

        if (existingAsset) {
          // Update existing asset (recalculate average price)
          const newQuantity = leg.posicao === 'COMPRADA' 
            ? existingAsset.quantity + leg.quantidade      // COMPRA = AUMENTA quantidade
            : existingAsset.quantity - leg.quantidade;     // VENDA = DIMINUI quantidade
          
          let newAveragePrice = existingAsset.average_price;
          
          if (leg.posicao === 'COMPRADA' && leg.precoEntrada) {
            const totalValue = (existingAsset.quantity * existingAsset.average_price) + 
                             (leg.quantidade * leg.precoEntrada);
            const totalQuantity = existingAsset.quantity + leg.quantidade;
            newAveragePrice = totalQuantity > 0 ? totalValue / totalQuantity : existingAsset.average_price;
          }

          await supabase
            .from('assets_custody')
            .update({
              quantity: Math.max(0, newQuantity),
              average_price: newAveragePrice,
              market_price: leg.precoEntrada || existingAsset.market_price,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingAsset.id);
        } else {
          // Create new asset only for COMPRADA positions
          if (leg.posicao === 'COMPRADA') {
            await supabase
              .from('assets_custody')
              .insert({
                user_id: userId,
                symbol: leg.ativo,
                name: `Ação ${leg.ativo}`,
                quantity: leg.quantidade,
                average_price: leg.precoEntrada || 0,
                market_price: leg.precoEntrada || 0,
                guarantee_released: 60, // Padrão automático de 60% para ações
                used_as_guarantee: true,
                type: 'STOCK'
              });
          }
        }
      }
      
      // Process option legs (create virtual assets for tracking)
      const optionLegs = structure.legs.filter(leg => 
        (leg.tipo === 'CALL' || leg.tipo === 'PUT') && leg.posicao === 'COMPRADA'
      );
      
      for (const leg of optionLegs) {
        const optionSymbol = `${leg.ativo}_OPT`;
        
        // Check if option asset already exists
        const { data: existingOption } = await supabase
          .from('assets_custody')
          .select('*')
          .eq('user_id', userId)
          .eq('symbol', optionSymbol)
          .single();

        if (existingOption) {
          // Update existing option asset
          const newQuantity = existingOption.quantity + leg.quantidade;
          const totalValue = (existingOption.quantity * existingOption.average_price) + 
                           (leg.quantidade * leg.premio);
          const newAveragePrice = newQuantity > 0 ? totalValue / newQuantity : existingOption.average_price;

          await supabase
            .from('assets_custody')
            .update({
              quantity: newQuantity,
              average_price: newAveragePrice,
              market_price: leg.premio,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingOption.id);
        } else {
          // Create new option asset
          await supabase
            .from('assets_custody')
            .insert({
              user_id: userId,
              symbol: optionSymbol,
              name: `Opção ${leg.ativo} ${leg.tipo}`,
              quantity: leg.quantidade,
              average_price: leg.premio,
              market_price: leg.premio,
              guarantee_released: 0, // Opções não servem como garantia
              used_as_guarantee: false,
              type: 'STOCK'
            });
        }
      }
      
      // Process futures legs
      const futuresLegs = structure.legs.filter(leg => 
        (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') && leg.posicao === 'COMPRADA'
      );
      
      for (const leg of futuresLegs) {
        const futuresSymbol = `${leg.ativo}_FUT`;
        
        // Check if futures asset already exists
        const { data: existingFutures } = await supabase
          .from('assets_custody')
          .select('*')
          .eq('user_id', userId)
          .eq('symbol', futuresSymbol)
          .single();

        if (existingFutures) {
          // Update existing futures asset
          const newQuantity = existingFutures.quantity + leg.quantidade;
          const totalValue = (existingFutures.quantity * existingFutures.average_price) + 
                           (leg.quantidade * (leg.precoVista || 0));
          const newAveragePrice = newQuantity > 0 ? totalValue / newQuantity : existingFutures.average_price;

          await supabase
            .from('assets_custody')
            .update({
              quantity: newQuantity,
              average_price: newAveragePrice,
              market_price: leg.precoVista || existingFutures.market_price,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingFutures.id);
        } else {
          // Create new futures asset
          await supabase
            .from('assets_custody')
            .insert({
              user_id: userId,
              symbol: futuresSymbol,
              name: `Futuro ${leg.ativo}`,
              quantity: leg.quantidade,
              average_price: leg.precoVista || 0,
              market_price: leg.precoVista || 0,
              guarantee_released: 0, // Futuros não servem como garantia direta
              used_as_guarantee: false,
              type: 'STOCK'
            });
        }
      }
    } catch (error) {
      console.error('Error registering assets in custody:', error);
    }
  };

  // Save structure to Supabase
  const saveStructure = async (structure: OptionStructure) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      console.log('Salvando estrutura:', structure);
      
      // Validar dados obrigatórios
      if (!structure.nome || !structure.legs || structure.legs.length === 0) {
        throw new Error('Dados da estrutura incompletos');
      }
      
      const structureData = {
        id: structure.id,
        user_id: user.id,
        nome: structure.nome,
        ativo: structure.ativo,
        legs: structure.legs,
        premio_liquido: structure.premioLiquido,
        custo_montagem: structure.custoMontagem,
        data_vencimento: structure.dataVencimento,
        status: structure.status,
        data_ativacao: structure.dataAtivacao,
        data_finalizacao: structure.dataFinalizacao,
        updated_at: new Date().toISOString()
      }

      console.log('Dados para salvar:', structureData);
      
      const { error } = await supabase
        .from('structures')
        .upsert(structureData)

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      // Register cash flow entry ONLY when activating (status changes to ATIVA)
      if (structure.status === 'ATIVA') {
        await registerStructureCashFlow(user.id, structure);
        await registerAssetsInCustody(user.id, structure);
      }

      console.log('Estrutura salva com sucesso');
      await loadStructures()
      
      // Force refresh of treasury data
      window.dispatchEvent(new CustomEvent('treasuryRefresh'));
      
      return true
    } catch (err) {
      console.error('Erro completo ao salvar:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar estrutura')
      return false
    }
  }

  // Upload operations for a structure
  const uploadOperations = async (structureId: string, operations: TradingOperation[]) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // First, delete existing operations for this structure
      await supabase
        .from('operations')
        .delete()
        .eq('structure_id', structureId)

      // Insert new operations
      const operationsData = operations.map(op => ({
        id: op.id,
        user_id: user.id,
        structure_id: structureId,
        tipo: op.tipo,
        ativo: op.ativo,
        pm: op.pm,
        strike: op.strike,
        quantidade: op.quantidade,
        premio: op.premio,
        taxa_coleta: op.taxaColeta,
        alta: op.alta,
        recompensa: op.recompensa,
        data_entrada: op.dataEntrada,
        data_saida: op.dataSaida,
        status: op.status,
        resultado: op.resultado
      }))

      const { error: opsError } = await supabase
        .from('operations')
        .insert(operationsData)

      if (opsError) throw opsError

      // Update structure status to ATIVA
      const { error: structError } = await supabase
        .from('structures')
        .update({
          status: 'ATIVA',
          data_ativacao: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', structureId)

      if (structError) throw structError

      await loadStructures()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload das operações')
      return false
    }
  }

  // Finalize structure
  const finalizeStructure = async (structureId: string) => {
    try {
      const { error } = await supabase
        .from('structures')
        .update({
          status: 'FINALIZADA',
          data_finalizacao: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', structureId)

      if (error) throw error

      await loadStructures()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar estrutura')
      return false
    }
  }

  // Delete structure
  const deleteStructure = async (structureId: string) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Get structure data before deletion to identify related assets
      const { data: structureData } = await supabase
        .from('structures')
        .select('*')
        .eq('id', structureId)
        .single()

      if (structureData) {
        // Delete related assets from custody
        const legs = structureData.legs || []
        
        for (const leg of legs) {
          if (leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA') {
            // Delete stock asset
            await supabase
              .from('assets_custody')
              .delete()
              .eq('user_id', user.id)
              .eq('symbol', leg.ativo)
          } else if ((leg.tipo === 'CALL' || leg.tipo === 'PUT') && leg.posicao === 'COMPRADA') {
            // Delete option asset
            const optionSymbol = `${leg.ativo}_OPT`
            await supabase
              .from('assets_custody')
              .delete()
              .eq('user_id', user.id)
              .eq('symbol', optionSymbol)
          } else if ((leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') && leg.posicao === 'COMPRADA') {
            // Delete futures asset
            const futuresSymbol = `${leg.ativo}_FUT`
            await supabase
              .from('assets_custody')
              .delete()
              .eq('user_id', user.id)
              .eq('symbol', futuresSymbol)
          }
        }

        // Delete related cash flow entries
        await supabase
          .from('cash_flow_entries')
          .delete()
          .eq('user_id', user.id)
          .eq('related_structure_id', structureId)
      }

      // Delete operations first
      await supabase
        .from('operations')
        .delete()
        .eq('structure_id', structureId)

      // Delete structure
      const { error } = await supabase
        .from('structures')
        .delete()
        .eq('id', structureId)

      if (error) throw error

      await loadStructures()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir estrutura')
      return false
    }
  }

  // Execute roll
  const executeRoll = async (rollData: RollPosition) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      console.log('Executando roll:', rollData)
      
      // Validar dados do roll
      if (!rollData.structureId || !rollData.originalLegs || !rollData.newLegs) {
        throw new Error('Dados de rolagem incompletos')
      }
      
      // Save roll to localStorage first
      const currentRolls = [...rolls, rollData]
      console.log('Salvando rolls:', currentRolls)
      await saveRolls(currentRolls)
      
      // Update structure legs with rolled positions
      // Instead of replacing all legs, update only the rolled ones
      const structureToUpdate = structures.find(s => s.id === rollData.structureId)
      if (!structureToUpdate) {
        throw new Error('Estrutura não encontrada')
      }
      
      const updatedLegs = structureToUpdate.legs.map(originalLeg => {
        // Find if this leg was rolled
        const wasRolled = rollData.originalLegs.some(rolledLeg => rolledLeg.id === originalLeg.id)
        
        if (wasRolled) {
          // Find the corresponding new leg
          const newLeg = rollData.newLegs.find(newLeg => {
            // Match by ID (more reliable)
            return newLeg.id === originalLeg.id
          })
          
          if (newLeg) {
            // Update the original leg with new data
            console.log('Atualizando perna:', {
              original: originalLeg,
              new: newLeg
            })
            return {
              ...originalLeg,
              ativo: newLeg.ativo,
              strike: newLeg.strike,
              premio: newLeg.premio,
              vencimento: newLeg.vencimento,
              selectedMonth: newLeg.selectedMonth,
              selectedYear: newLeg.selectedYear
            }
          }
        }
        
        // Return original leg if not rolled
        return originalLeg
      })
      
      console.log('Pernas atualizadas:', updatedLegs)
      
      const { error: structError } = await supabase
        .from('structures')
        .update({
          legs: updatedLegs,
          updated_at: new Date().toISOString()
        })
        .eq('id', rollData.structureId)

      if (structError) throw structError

      console.log('Roll executado com sucesso')
      await loadStructures()
      return true
    } catch (err) {
      console.error('Erro ao executar roll:', err)
      setError(err instanceof Error ? err.message : 'Erro ao executar roll')
      return false
    }
  }

  useEffect(() => {
    loadStructures()
  }, [])

  return {
    structures,
    rolls,
    loading,
    error,
    saveStructure,
    uploadOperations,
    finalizeStructure,
    deleteStructure,
    executeRoll,
    deleteRoll,
    refreshStructures: loadStructures
  }
}