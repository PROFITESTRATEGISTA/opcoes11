// Utility functions for date calculations considering business days

export function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  // 0 = Sunday, 6 = Saturday
  return dayOfWeek !== 0 && dayOfWeek !== 6;
}

export function addBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < businessDays) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result)) {
      daysAdded++;
    }
  }
  
  return result;
}

export function getBusinessDaysBetween(startDate: Date, endDate: Date): number {
  if (startDate >= endDate) return 0;
  
  let businessDays = 0;
  const current = new Date(startDate);
  
  while (current < endDate) {
    if (isBusinessDay(current)) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

export function getDaysUntilExpiration(expirationDate: string): {
  totalDays: number;
  businessDays: number;
  isExpired: boolean;
  isToday: boolean;
  isTomorrow: boolean;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiration = new Date(expirationDate);
  expiration.setHours(0, 0, 0, 0);
  
  const totalDays = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const businessDays = getBusinessDaysBetween(today, expiration);
  
  return {
    totalDays,
    businessDays,
    isExpired: totalDays < 0,
    isToday: totalDays === 0,
    isTomorrow: totalDays === 1
  };
}

export function formatExpirationWarning(expirationDate: string): string {
  const { totalDays, businessDays, isExpired, isToday, isTomorrow } = getDaysUntilExpiration(expirationDate);
  
  if (isExpired) {
    return 'Esta estrutura já venceu';
  }
  
  if (isToday) {
    return 'Esta estrutura vence HOJE';
  }
  
  if (isTomorrow) {
    return 'Esta estrutura vence AMANHÃ';
  }
  
  if (totalDays <= 7) {
    return `Esta estrutura vence em ${totalDays} ${totalDays === 1 ? 'dia' : 'dias'} (${businessDays} ${businessDays === 1 ? 'dia útil' : 'dias úteis'})`;
  }
  
  return `Esta estrutura vence em ${totalDays} dias (${businessDays} dias úteis)`;
}

export function shouldShowExpirationReminder(expirationDate: string): boolean {
  const { totalDays, isExpired } = getDaysUntilExpiration(expirationDate);
  return !isExpired && totalDays <= 7;
}

export function getExpirationUrgencyLevel(expirationDate: string): 'low' | 'medium' | 'high' | 'critical' {
  const { totalDays, isExpired, isToday, isTomorrow } = getDaysUntilExpiration(expirationDate);
  
  if (isExpired) return 'critical';
  if (isToday) return 'critical';
  if (isTomorrow) return 'high';
  if (totalDays <= 3) return 'high';
  if (totalDays <= 7) return 'medium';
  return 'low';
}

export function getUrgencyColor(urgency: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (urgency) {
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'low':
    default:
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
}

// Utility functions for option expiration dates (third Friday of each month)

export function getThirdFridayOfMonth(year: number, month: number): Date {
  // Get first day of month (month is 0-indexed)
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

export function getOptionExpirationDates(startYear: number, endYear: number): Date[] {
  const expirationDates: Date[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      const thirdFriday = getThirdFridayOfMonth(year, month);
      expirationDates.push(thirdFriday);
    }
  }
  
  return expirationDates;
}

export function getAllOptionExpirationDatesInRange(startDate: Date, endDate: Date): Date[] {
  const expirationDates: Date[] = [];
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      const thirdFriday = getThirdFridayOfMonth(year, month);
      if (thirdFriday >= startDate && thirdFriday <= endDate) {
        expirationDates.push(thirdFriday);
      }
    }
  }
  
  return expirationDates;
}

export function isOptionExpirationDate(date: Date): boolean {
  const thirdFriday = getThirdFridayOfMonth(date.getFullYear(), date.getMonth());
  return date.getDate() === thirdFriday.getDate();
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthIndex];
}

export function formatOptionExpirationCode(date: Date): string {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${getMonthName(date.getMonth()).slice(0, 3)}/${year}`;
}