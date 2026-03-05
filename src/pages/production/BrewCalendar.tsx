import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import type { BrewDayLog } from '../../types';

function getWeekDates(baseDate: Date): Date[] {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function formatDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const statusStyles: Record<string, string> = {
  scheduled: 'border-2 border-blue-500/50 bg-blue-500/10 text-blue-300',
  in_progress: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  completed: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20 line-through',
};

interface BrewCalendarProps {
  brewDays: BrewDayLog[];
  onScheduleClick?: () => void;
}

export default function BrewCalendar({ brewDays, onScheduleClick }: BrewCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const now = new Date();
  const base = new Date(now);
  base.setDate(base.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(base);

  const brewDaysByDate: Record<string, BrewDayLog[]> = {};
  for (const bd of brewDays) {
    const key = bd.scheduledDate;
    if (!brewDaysByDate[key]) brewDaysByDate[key] = [];
    brewDaysByDate[key].push(bd);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-brewery-300 uppercase tracking-wider">Brew Calendar</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 rounded hover:bg-brewery-800 text-brewery-400 hover:text-brewery-200">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setWeekOffset(0)} className="text-xs text-brewery-400 hover:text-brewery-200 px-2">
            Today
          </button>
          <button onClick={() => setWeekOffset(w => w + 1)} className="p-1 rounded hover:bg-brewery-800 text-brewery-400 hover:text-brewery-200">
            <ChevronRight className="w-4 h-4" />
          </button>
          {onScheduleClick && (
            <button
              onClick={onScheduleClick}
              className="ml-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              Schedule Brew Day
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-brewery-500 uppercase py-1">{d}</div>
        ))}

        {/* Day cells */}
        {weekDates.map((date, i) => {
          const key = formatDateKey(date);
          const isToday = key === formatDateKey(now);
          const events = brewDaysByDate[key] || [];
          return (
            <div
              key={i}
              className={clsx(
                'min-h-[100px] rounded-lg p-2 border transition-all',
                isToday ? 'border-amber-500/40 bg-amber-500/5' : 'border-brewery-700/20 bg-brewery-900/40'
              )}
            >
              <span className={clsx(
                'text-xs font-bold',
                isToday ? 'text-amber-400' : 'text-brewery-400'
              )}>
                {date.getDate()}
              </span>
              <div className="mt-1 space-y-1">
                {events.map(ev => (
                  <div key={ev.id} className={clsx('rounded-md px-2 py-1 text-[10px] font-medium', statusStyles[ev.status] || statusStyles.scheduled)}>
                    <div className="flex items-center gap-1">
                      {ev.status === 'completed' && <CheckCircle className="w-2.5 h-2.5" />}
                      <span className="truncate">{ev.batchBeerName || 'TBD'}</span>
                    </div>
                    {ev.brewerName && <p className="text-[9px] opacity-70 truncate">{ev.brewerName}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
