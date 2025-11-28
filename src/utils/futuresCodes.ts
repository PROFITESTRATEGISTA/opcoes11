// Códigos de vencimento para futuros
export const FUTURES_MONTH_CODES = {
  1: 'F',   // Janeiro
  2: 'G',   // Fevereiro
  3: 'H',   // Março
  4: 'J',   // Abril
  5: 'K',   // Maio
  6: 'M',   // Junho
  7: 'N',   // Julho
  8: 'Q',   // Agosto
  9: 'U',   // Setembro
  10: 'V',  // Outubro
  11: 'X',  // Novembro
  12: 'Z'   // Dezembro
};

export const FUTURES_MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function generateFuturesCode(
  baseAsset: string,
  month: number,
  year: number
): string {
  if (!baseAsset || !month || !year) return '';
  
  const monthCode = FUTURES_MONTH_CODES[month as keyof typeof FUTURES_MONTH_CODES];
  const yearCode = year.toString().slice(-2); // Últimos 2 dígitos do ano
  
  return `${baseAsset.toUpperCase()}${monthCode}${yearCode}`;
}

export function getMonthFromFuturesCode(futuresCode: string): number | null {
  if (!futuresCode || futuresCode.length < 4) return null;
  
  // Extrair o código do mês (penúltimo caractere)
  const monthCode = futuresCode.slice(-3, -2);
  
  // Encontrar o mês correspondente
  for (const [month, code] of Object.entries(FUTURES_MONTH_CODES)) {
    if (code === monthCode) {
      return parseInt(month);
    }
  }
  
  return null;
}

export function getYearFromFuturesCode(futuresCode: string): number | null {
  if (!futuresCode || futuresCode.length < 2) return null;
  
  // Extrair os últimos 2 dígitos
  const yearCode = futuresCode.slice(-2);
  const year = parseInt(yearCode);
  
  if (isNaN(year)) return null;
  
  // Assumir que anos 00-30 são 2000-2030, e 31-99 são 1931-1999
  return year <= 30 ? 2000 + year : 1900 + year;
}

export function getFuturesExpirationDate(month: number, year: number): string {
  // Para futuros, o vencimento é geralmente na última quinta-feira do mês
  const lastDay = new Date(year, month, 0); // Último dia do mês
  const lastThursday = new Date(lastDay);
  
  // Encontrar a última quinta-feira
  while (lastThursday.getDay() !== 4) { // 4 = quinta-feira
    lastThursday.setDate(lastThursday.getDate() - 1);
  }
  
  return lastThursday.toISOString().split('T')[0];
}

export function getAvailableFuturesMonths(): { month: number; year: number; code: string; displayName: string }[] {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const months = [];
  
  // Adicionar próximos 12 meses
  for (let i = 0; i < 12; i++) {
    let month = currentMonth + i;
    let year = currentYear;
    
    if (month > 12) {
      month = month - 12;
      year = year + 1;
    }
    
    const monthCode = FUTURES_MONTH_CODES[month as keyof typeof FUTURES_MONTH_CODES];
    const yearCode = year.toString().slice(-2);
    
    months.push({
      month,
      year,
      code: `${monthCode}${yearCode}`,
      displayName: `${FUTURES_MONTH_NAMES[month - 1]} ${year}`
    });
  }
  
  return months;
}