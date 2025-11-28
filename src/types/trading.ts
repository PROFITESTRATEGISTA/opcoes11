export interface TradingOperation {
  id: string;
  tipo: 'Swing Trade' | 'Opções' | 'Renda Sintética' | 'Estrutura';
  ativo: string;
  pm: number; // Preço Médio
  strike?: number;
  quantidade: number;
  premio: number;
  taxaColeta: number;
  custoExercicio?: number;
  corretagem?: number;
  alta: number;
  recompensa: number;
  dataEntrada: string;
  dataSaida?: string;
  status: 'Aberta' | 'Fechada' | 'Vencida';
  resultado: number;
  estrutura?: OptionStructure;
}

export interface OptionLeg {
  id: string;
  tipo: 'CALL' | 'PUT' | 'ACAO' | 'WIN' | 'WDO' | 'BIT';
  strike: number;
  vencimento: string;
  selectedMonth?: number;
  selectedYear?: number;
  premio: number;
  quantidade: number;
  posicao: 'COMPRADA' | 'VENDIDA';
  ativo: string;
  precoVista?: number; // Para futuros
  precoEntrada?: number; // Para ações
  customMarginPercentage?: number; // Margem personalizada para operações vendidas
  selectedCallData?: {
    call: OptionLeg;
    precoEntradaOriginal: number;
    ganhoMaximo: number;
  };
}

export interface OptionStructure {
  id?: string;
  nome: string;
  ativo?: string;
  legs: OptionLeg[];
  premioLiquido: number;
  custoMontagem: number;
  dataVencimento: string;
  status: 'MONTANDO' | 'ATIVA' | 'FECHADA' | 'FINALIZADA';
  operacoes?: TradingOperation[];
  dataAtivacao?: string;
  dataFinalizacao?: string;
}

export interface RollPosition {
  id: string;
  structureId: string;
  originalLegs: OptionLeg[];
  newLegs: OptionLeg[];
  dataRoll: string;
  custoRoll: number;
  motivoRoll: string;
  status: 'PENDENTE' | 'EXECUTADO' | 'CANCELADO';
  precoSaidaOriginal?: {[key: string]: number};
  lucroRealizado?: number;
  taxasAdicionais?: number;
  observacoes?: string;
  exercicioOpcoes?: {
    houve: boolean;
    opcoes: {
      legId: string;
      ativo: string;
      tipo: 'CALL' | 'PUT';
      strike: number;
      quantidade: number;
      precoExercicio: number;
      custoExercicio: number;
      resultadoExercicio: number;
    }[];
    custoTotalExercicio: number;
    observacoesExercicio?: string;
  };
}

export interface ExerciseRecord {
  id: string;
  structureId: string;
  structureName: string;
  dataExercicio: string;
  opcoes: {
    legId: string;
    ativo: string;
    tipo: 'CALL' | 'PUT';
    strike: number;
    quantidade: number;
    precoExercicio: number;
    custoExercicio: number;
    resultadoExercicio: number;
  }[];
  custoTotalExercicio: number;
  resultadoTotalExercicio: number;
  observacoes?: string;
  status: 'EXECUTADO' | 'PENDENTE' | 'CANCELADO';
  created_at?: string;
  updated_at?: string;
}
export interface FilterState {
  tipo: string;
  status: string;
  ativo: string;
}

export interface CSVRow {
  ativo: string;
  precoEntrada: number;
  quantidade: number;
  dataEntrada: string;
  tipo?: string;
}

export interface UserPlan {
  id: string;
  type: 'FREE' | 'PESSOA_FISICA' | 'CORPORATIVO' | 'CONSULTORIA' | 'DIVIDEND_PORTFOLIO';
  name: string;
  price?: number;
  features: string[];
  maxStructures: number;
  maxUsers: number;
  hasAdvancedAnalytics: boolean;
  hasSharedAccess: boolean;
  hasAdminControls: boolean;
  isAddon?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  plan: UserPlan;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}