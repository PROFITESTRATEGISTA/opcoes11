// Mapeamento dos meses para códigos de opções
export const OPTION_MONTH_CODES = {
  CALL: {
    1: 'A',   // Janeiro
    2: 'B',   // Fevereiro
    3: 'C',   // Março
    4: 'D',   // Abril
    5: 'E',   // Maio
    6: 'F',   // Junho
    7: 'G',   // Julho
    8: 'H',   // Agosto
    9: 'I',   // Setembro
    10: 'J',  // Outubro
    11: 'K',  // Novembro
    12: 'L'   // Dezembro
  },
  PUT: {
    1: 'M',   // Janeiro
    2: 'N',   // Fevereiro
    3: 'O',   // Março
    4: 'P',   // Abril
    5: 'Q',   // Maio
    6: 'R',   // Junho
    7: 'S',   // Julho
    8: 'T',   // Agosto
    9: 'U',   // Setembro
    10: 'V',  // Outubro
    11: 'W',  // Novembro
    12: 'X'   // Dezembro
  }
};

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function generateOptionCode(
  ativo: string, 
  tipo: 'CALL' | 'PUT', 
  month: number, 
  year: number, 
  strike: number
): string {
  if (!ativo || !month || !year || !strike) return '';
  
  // Remove números finais do ticker (ITUB4 → ITUB, PETR4 → PETR)
  const baseAsset = ativo.replace(/\d+$/, '');
  
  const monthCode = OPTION_MONTH_CODES[tipo][month as keyof typeof OPTION_MONTH_CODES.CALL];
  const yearCode = year.toString().slice(-1); // Último dígito do ano
  const strikeFormatted = Math.round(strike).toString().padStart(2, '0');
  
  return `${baseAsset.toUpperCase()}${monthCode}${yearCode}${strikeFormatted}`;
}

export function getMonthFromDate(dateString: string): number {
  if (!dateString) return 0;
  return new Date(dateString).getMonth() + 1;
}

export function getYearFromDate(dateString: string): number {
  if (!dateString) return 0;
  return new Date(dateString).getFullYear();
}