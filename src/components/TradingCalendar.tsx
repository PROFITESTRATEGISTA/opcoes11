import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  X,
  TrendingUp,
  RotateCcw,
  Target,
  AlertTriangle,
  CheckCircle,
  Plus,
  Zap,
  Clock,
  DollarSign
} from 'lucide-react';
import { OptionStructure, RollPosition } from '../types/trading';
import { 
  getDaysUntilExpiration, 
  formatExpirationWarning, 
  shouldShowExpirationReminder, 
  getExpirationUrgencyLevel, 
  getUrgencyColor,
  getOptionExpirationDates,
  isOptionExpirationDate,
  formatOptionExpirationCode
} from '../utils/dateUtils';

interface TradingCalendarProps {
  structures: OptionStructure[];
  rolls: RollPosition[];
  onClose: () => void;
}

interface CalendarEvent {
  id: string;
  type: 'structure_created' | 'structure_activated' | 'structure_finalized' | 'roll' | 'exercise' | 'expiration_reminder' | 'future_expiration';
  title: string;
  description: string;
  date: string;
  color: string;
  icon: any;
  data?: any;
}

interface DayEventsModalProps {
  date: string;
  events: CalendarEvent[];
  onClose: () => void;
}

function DayEventsModal({ date, events, onClose }: DayEventsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-70">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Eventos do Dia</h3>
              <p className="text-blue-100 capitalize">{formatDate(date)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {events.map((event, index) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className={`border rounded-lg p-4 ${event.color}`}>
                  <div className="flex items-center mb-3">
                    <div className="bg-gray-900/50 p-2 rounded-lg mr-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm opacity-80">{event.description}</p>
                    </div>
                  </div>
                  
                  {event.type === 'roll' && event.data && (
                    <div className="bg-gray-900/30 rounded p-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>Lucro: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(event.data.lucroRealizado || 0)}</div>
                        <div>Custo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(event.data.custoRoll)}</div>
                      </div>
                    </div>
                  )}
                  
                  {(event.type === 'future_expiration' || event.type === 'expiration_reminder') && event.data && (
                    <div className="bg-gray-900/30 rounded p-3 text-sm">
                      {event.data.isFixedExpiration ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>Série: {event.data.monthCode}</div>
                          <div>Estruturas: {event.data.structuresCount}</div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div>Pernas: {event.data.legs?.length || 0}</div>
                          <div>Status: {event.data.status}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TradingCalendar({ structures, rolls, onClose }: TradingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: string; events: CalendarEvent[] } | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Generate all calendar events
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add fixed option expiration dates (third Friday of each month)
    const currentYear = new Date().getFullYear();
    const optionExpirationDates = getOptionExpirationDates(currentYear - 1, currentYear + 2);
    
    optionExpirationDates.forEach(expirationDate => {
      const dateString = expirationDate.toISOString().split('T')[0];
      const monthCode = formatOptionExpirationCode(expirationDate);
      
      // Check if there are structures with this expiration date
      const structuresWithThisExpiration = structures.filter(structure => 
        structure.dataVencimento === dateString
      );
      
      const urgency = getExpirationUrgencyLevel(dateString);
      
      events.push({
        id: `fixed_expiration_${dateString}`,
        type: 'future_expiration',
        title: `Vencimento ${monthCode}`,
        description: structuresWithThisExpiration.length > 0 
          ? `${structuresWithThisExpiration.length} estrutura(s) vencem`
          : 'Data de vencimento de opções',
        date: dateString,
        color: structuresWithThisExpiration.length > 0 
          ? getUrgencyColor(urgency)
          : 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: Clock,
        data: {
          isFixedExpiration: true,
          monthCode,
          structuresCount: structuresWithThisExpiration.length,
          structures: structuresWithThisExpiration
        }
      });
    });

    // Structure events
    structures.forEach(structure => {
      // Structure created
      if (structure.created_at) {
        events.push({
          id: `structure_created_${structure.id}`,
          type: 'structure_created',
          title: `Estrutura Criada`,
          description: structure.nome,
          date: structure.created_at.split('T')[0],
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          icon: Plus,
          data: structure
        });
      }

      // Structure activated
      if (structure.dataAtivacao) {
        events.push({
          id: `structure_activated_${structure.id}`,
          type: 'structure_activated',
          title: `Estrutura Ativada`,
          description: structure.nome,
          date: structure.dataAtivacao,
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          icon: TrendingUp,
          data: structure
        });
      }

      // Structure finalized
      if (structure.dataFinalizacao) {
        events.push({
          id: `structure_finalized_${structure.id}`,
          type: 'structure_finalized',
          title: `Estrutura Zerada`,
          description: structure.nome,
          date: structure.dataFinalizacao,
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          icon: CheckCircle,
          data: structure
        });
      }

      // Expiration reminders (7 days before)
      if (structure.status === 'ATIVA' || structure.status === 'FINALIZADA') {
        const shouldShow = shouldShowExpirationReminder(structure.dataVencimento);
        const urgency = getExpirationUrgencyLevel(structure.dataVencimento);

        // Show reminder only for active structures within warning period
        if (structure.status === 'ATIVA' && shouldShow) {
          events.push({
            id: `expiration_reminder_${structure.id}`,
            type: 'expiration_reminder',
            title: formatExpirationWarning(structure.dataVencimento),
            description: structure.nome,
            date: new Date().toISOString().split('T')[0], // Show today if within warning period
            color: getUrgencyColor(urgency),
            icon: AlertTriangle,
            data: structure
          });
        }
      }
    });

    // Roll events
    rolls.forEach(roll => {
      const structure = structures.find(s => s.id === roll.structureId);
      events.push({
        id: `roll_${roll.id}`,
        type: 'roll',
        title: `Rolagem Executada`,
        description: structure?.nome || 'Estrutura não encontrada',
        date: roll.dataRoll,
        color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        icon: RotateCcw,
        data: roll
      });
    });

    // Exercise events (simulated - you can add real exercise data)
    structures.forEach(structure => {
      if (structure.status === 'ATIVA') {
        const hasExercisableOptions = structure.legs.some(leg => 
          leg.tipo === 'CALL' || leg.tipo === 'PUT'
        );
        
        if (hasExercisableOptions) {
          const expirationDate = new Date(structure.dataVencimento);
          events.push({
            id: `exercise_opportunity_${structure.id}`,
            type: 'exercise',
            title: `Oportunidade de Exercício`,
            description: structure.nome,
            date: structure.dataVencimento,
            color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            icon: Target,
            data: structure
          });
        }
      }
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [structures, rolls]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (day: number) => {
    if (!day) return [];
    
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const targetDateString = targetDate.toISOString().split('T')[0];
    
    return calendarEvents.filter(event => event.date === targetDateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventTypeStats = () => {
    const stats = {
      structures_created: calendarEvents.filter(e => e.type === 'structure_created').length,
      structures_activated: calendarEvents.filter(e => e.type === 'structure_activated').length,
      structures_finalized: calendarEvents.filter(e => e.type === 'structure_finalized').length,
      rolls: calendarEvents.filter(e => e.type === 'roll').length,
      exercises: calendarEvents.filter(e => e.type === 'exercise').length,
      reminders: calendarEvents.filter(e => e.type === 'expiration_reminder').length,
      expirations: calendarEvents.filter(e => e.type === 'future_expiration').length
    };
    return stats;
  };

  const stats = getEventTypeStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Calendário de Trading</h2>
          <p className="text-gray-400">Strategos Partners - Calendário completo</p>
        </div>
      </div>

      {/* Event Type Legend */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tipos de Eventos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">Criadas ({stats.structures_created})</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Ativadas ({stats.structures_activated})</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Zeradas ({stats.structures_finalized})</span>
          </div>
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-300">Rolagens ({stats.rolls})</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Exercícios ({stats.exercises})</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Lembretes ({stats.reminders})</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-sm text-gray-300">Vencimentos ({stats.expirations})</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          
          <h3 className="text-xl font-semibold text-white capitalize">
            {getMonthName(currentDate)}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-gray-800">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-300 border-r border-gray-700 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {getDaysInMonth(currentDate).map((day, index) => {
              const eventsForDay = day ? getEventsForDate(day) : [];
              const isToday = day && 
                new Date().getDate() === day && 
                new Date().getMonth() === currentDate.getMonth() && 
                new Date().getFullYear() === currentDate.getFullYear();
              
              const dayDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
              const isOptionExpiration = dayDate ? isOptionExpirationDate(dayDate) : false;
              
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (day && eventsForDay.length > 0) {
                      setSelectedDayEvents({ 
                        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0], 
                        events: eventsForDay 
                      });
                    }
                  }}
                  className={`min-h-[120px] p-2 border-r border-b border-gray-700 last:border-r-0 cursor-pointer ${
                    day ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-800'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
                    isOptionExpiration && !eventsForDay.length ? 'ring-1 ring-gray-600' : ''
                  }`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${
                        isToday ? 'text-blue-400' : 'text-white'
                      }`}>
                        {day}
                        {isToday && <span className="ml-1 text-xs">(Hoje)</span>}
                      </div>
                      <div className="space-y-1">
                        {eventsForDay.slice(0, 2).map(event => {
                          const Icon = event.icon;
                          return (
                            <button
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className={`w-full text-left p-1 rounded text-xs transition-colors hover:opacity-80 ${event.color}`}
                            >
                              <div className="flex items-center">
                                <Icon className="w-3 h-3 mr-1" />
                                <span className="truncate">
                                  {event.title}
                                </span>
                              </div>
                              <div className="text-xs opacity-80 truncate">
                                {event.description}
                              </div>
                            </button>
                          );
                        })}
                        
                        {eventsForDay.length > 2 && (
                          <div className="w-full text-xs text-center text-blue-400 hover:text-blue-300 mt-1 p-1 rounded hover:bg-blue-500/10 transition-colors font-medium">
                            +{eventsForDay.length - 2} mais eventos
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className={`p-6 rounded-t-xl ${selectedEvent.color.replace('/20', '/30').replace('text-', 'bg-').replace('border-', '')}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <selectedEvent.icon className="w-6 h-6 mr-3 text-white" />
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedEvent.title}</h3>
                    <p className="text-white/80">{formatDate(selectedEvent.date)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <h4 className="font-semibold text-white mb-4">{selectedEvent.description}</h4>
              
              {selectedEvent.type === 'structure_created' && selectedEvent.data && (
                <div className="space-y-3">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Pernas:</p>
                        <p className="text-white font-medium">{selectedEvent.data.legs.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Prêmio Teórico:</p>
                        <p className={`font-medium ${selectedEvent.data.premioLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(selectedEvent.data.premioLiquido)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Status:</p>
                        <p className="text-white font-medium">{selectedEvent.data.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Vencimento:</p>
                        <p className="text-white font-medium">{formatDate(selectedEvent.data.dataVencimento)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedEvent.type === 'roll' && selectedEvent.data && (
                <div className="space-y-3">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Lucro Realizado:</p>
                        <p className={`font-medium ${(selectedEvent.data.lucroRealizado || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(selectedEvent.data.lucroRealizado || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Custo do Roll:</p>
                        <p className="text-red-400 font-medium">{formatCurrency(selectedEvent.data.custoRoll)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Status:</p>
                        <p className="text-white font-medium">{selectedEvent.data.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Pernas Originais:</p>
                        <p className="text-white font-medium">{selectedEvent.data.originalLegs.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Motivo:</p>
                    <p className="text-white">{selectedEvent.data.motivoRoll}</p>
                  </div>
                </div>
              )}

              {selectedEvent.type === 'expiration_reminder' && selectedEvent.data && (
                <div className="space-y-3">
                  <div className={`rounded-lg p-4 ${getUrgencyColor(getExpirationUrgencyLevel(selectedEvent.data.dataVencimento))}`}>
                    <div className="flex items-center mb-3">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      <h5 className="font-medium">Atenção: Vencimento Próximo</h5>
                    </div>
                    <p className="text-sm mb-3">
                      {formatExpirationWarning(selectedEvent.data.dataVencimento)}. Considere suas opções:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-300">
                        <RotateCcw className="w-4 h-4 mr-2 text-orange-400" />
                        Executar rolagem para novo vencimento
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Target className="w-4 h-4 mr-2 text-purple-400" />
                        Exercer opções se estiverem ITM
                      </div>
                      <div className="flex items-center text-gray-300">
                        <CheckCircle className="w-4 h-4 mr-2 text-gray-400" />
                        Deixar vencer se estiverem OTM
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Data de Vencimento:</p>
                        <p className="text-white font-medium">{formatDate(selectedEvent.data.dataVencimento)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(() => {
                            const { businessDays, totalDays } = getDaysUntilExpiration(selectedEvent.data.dataVencimento);
                            return `${totalDays} dias corridos • ${businessDays} dias úteis`;
                          })()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Pernas:</p>
                        <p className="text-white font-medium">{selectedEvent.data.legs.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedEvent.type === 'future_expiration' && selectedEvent.data && (
                <div className="space-y-3">
                  <div className={`rounded-lg p-4 ${
                    event.data.isFixedExpiration 
                      ? event.color
                      : getUrgencyColor(getExpirationUrgencyLevel(event.data.dataVencimento || event.date))
                  }`}>
                    <div className="flex items-center mb-3">
                      {event.data.isFixedExpiration ? (
                        <>
                          <Calendar className="w-5 h-5 mr-2" />
                          <h5 className="font-medium">Vencimento de Opções - {event.data.monthCode}</h5>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 mr-2" />
                          <h5 className="font-medium">Data de Vencimento</h5>
                        </>
                      )}
                    </div>
                    <p className="text-sm">
                      {event.data.isFixedExpiration 
                        ? `Terceira sexta-feira do mês. ${event.data.structuresCount > 0 
                            ? `${event.data.structuresCount} estrutura(s) vencem nesta data.`
                            : 'Data padrão de vencimento de opções.'}`
                        : `${formatExpirationWarning(event.data.dataVencimento)}. Verifique se há necessidade de exercício.`
                      }
                    </p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    {event.data.isFixedExpiration ? (
                      <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-600">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Data de Vencimento:</p>
                            <p className="text-white font-medium">{formatDate(event.date)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Estruturas Associadas:</p>
                            <p className="text-white font-medium">{event.data.structuresCount}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-600">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Data de Vencimento:</p>
                            <p className="text-white font-medium">{formatDate(event.data.dataVencimento)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Tempo Restante:</p>
                            <p className="text-white font-medium">
                              {(() => {
                                const { businessDays, totalDays, isToday, isTomorrow } = getDaysUntilExpiration(event.data.dataVencimento);
                                if (isToday) return 'VENCE HOJE';
                                if (isTomorrow) return 'VENCE AMANHÃ';
                                return `${totalDays} dias (${businessDays} úteis)`;
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {event.data.isFixedExpiration ? (
                      <div>
                        <h5 className="font-medium text-white mb-3">
                          {event.data.structuresCount > 0 
                            ? `Estruturas que Vencem (${event.data.structuresCount}):`
                            : 'Informações do Vencimento:'
                          }
                        </h5>
                        {event.data.structuresCount > 0 ? (
                          <div className="space-y-2">
                            {event.data.structures.map((structure: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <span className="text-white text-sm">{structure.nome}</span>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(structure.status)}`}>
                                    {structure.status}
                                  </span>
                                  <span className="text-gray-400 text-xs">
                                    {structure.legs.length} pernas
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-800 rounded p-3 text-center">
                            <Clock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">
                              Terceira sexta-feira do mês - Data padrão de vencimento de opções
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              Nenhuma estrutura vence nesta data
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h5 className="font-medium text-white mb-3">Pernas que Vencem:</h5>
                        <div className="space-y-2">
                          {event.data.legs
                            .filter((leg: any) => leg.tipo === 'CALL' || leg.tipo === 'PUT')
                            .map((leg: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                              <span className="text-white text-sm">{leg.ativo}</span>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  leg.tipo === 'CALL' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {leg.tipo} {leg.posicao}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  Strike: {formatCurrency(leg.strike)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedEvent.type === 'exercise' && selectedEvent.data && (
                <div className="space-y-3">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Target className="w-5 h-5 text-purple-400 mr-2" />
                      <h5 className="font-medium text-purple-400">Oportunidade de Exercício</h5>
                    </div>
                    <p className="text-purple-300 text-sm">
                      Esta estrutura possui opções compradas que podem ser exercidas.
                    </p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h5 className="font-medium text-white mb-3">Opções Exercíveis:</h5>
                    <div className="space-y-2">
                      {selectedEvent.data.legs
                        .filter((leg: any) => leg.tipo === 'CALL' || leg.tipo === 'PUT')
                        .map((leg: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                          <span className="text-white text-sm">{leg.ativo}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              leg.tipo === 'CALL' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {leg.tipo} {leg.posicao}
                            </span>
                            <span className="text-gray-400 text-xs">
                              Strike: {formatCurrency(leg.strike)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day Events Modal */}
      {selectedDayEvents && (
        <DayEventsModal
          date={selectedDayEvents.date}
          events={selectedDayEvents.events}
          onClose={() => setSelectedDayEvents(null)}
        />
      )}

    </div>
  );
}