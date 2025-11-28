// Utility functions for option expiration dates

export interface ExpirationDate {
  date: string;
  displayName: string;
  monthCode: string;
}

export function getNextExpirationDates(currentExpiration: string, count: number = 3): ExpirationDate[] {
  const current = new Date(currentExpiration);
  const expirations: ExpirationDate[] = [];
  
  // Start from next month
  let nextMonth = new Date(current);
  nextMonth.setMonth(current.getMonth() + 1);
  
  for (let i = 0; i < count; i++) {
    const expDate = getThirdFridayOfMonth(nextMonth.getFullYear(), nextMonth.getMonth());
    
    expirations.push({
      date: expDate.toISOString().split('T')[0],
      displayName: `${getMonthName(nextMonth.getMonth())}/${nextMonth.getFullYear()}`,
      monthCode: getMonthCode(nextMonth.getMonth() + 1)
    });
    
    // Move to next month
    nextMonth.setMonth(nextMonth.getMonth() + 1);
  }
  
  return expirations;
}

export function getThirdFridayOfMonth(year: number, month: number): Date {
  // Get first day of month
  const firstDay = new Date(year, month, 1);
  
  // Find first Friday
  let firstFriday = 1;
  while (new Date(year, month, firstFriday).getDay() !== 5) {
    firstFriday++;
  }
  
  // Third Friday is first Friday + 14 days
  const thirdFriday = firstFriday + 14;
  
  return new Date(year, month, thirdFriday);
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  return months[monthIndex];
}

export function getMonthCode(month: number): string {
  const codes = ['', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'];
  return codes[month] || '';
}

export function generateNextOptionCode(currentCode: string, newExpiration: string): string {
  // Extract base asset from current code (remove month/year/strike)
  const baseAsset = currentCode.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '');
  
  // Extract strike from current code
  const strikeMatch = currentCode.match(/(\d+)$/);
  const strike = strikeMatch ? strikeMatch[1] : '00';
  
  // Get new month and year
  const expDate = new Date(newExpiration);
  const month = expDate.getMonth() + 1;
  const year = expDate.getFullYear();
  
  // Determine if it's CALL or PUT based on current code
  const isCall = /[A-EGJKLM]/.test(currentCode.slice(-3, -2));
  const monthCode = isCall ? 
    ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'][month] :
    ['', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'][month];
  
  const yearCode = year.toString().slice(-1);
  
  return `${baseAsset}${monthCode}${yearCode}${strike}`;
}