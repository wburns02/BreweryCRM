import { useState } from 'react';
import { Calendar, Music, DollarSign, Plus, MapPin, Clock, Ticket, Star } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import { events, performers } from '../../data/mockData';
import type { BreweryEvent, Performer } from '../../types';

const typeIcons: Record<string, string> = { 'live-music': '🎵', trivia: '🧠', 'beer-release': '🍺', 'tap-takeover': '🍻', 'pairing-dinner': '🍽️', private: '🔒', family: '👨‍👩‍👧‍👦', tour: '🏭', holiday: '🎄', fundraiser: '❤️' };

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'performers'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<BreweryEvent | null>(null);
  const [selectedPerformer, setSelectedPerformer] = useState<Performer | null>(null);

  const upcoming = events.filter(e => e.status === 'upcoming');
  const totalTicketRevenue = events.reduce((s, e) => s + e.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Upcoming Events" value={upcoming.length} icon={Calendar} iconBg="bg-purple-600/20" iconColor="text-purple-400" />
        <StatCard title="Event Revenue" value={`$${totalTicketRevenue.toLocaleString()}`} icon={DollarSign} iconBg="bg-emerald-600/20" iconColor="text-emerald-400" />
        <StatCard title="Total Performers" value={performers.length} icon={Music} iconBg="bg-amber-600/20" iconColor="text-amber-400" />
        <StatCard title="Tickets Sold" value={events.reduce((s, e) => s + e.ticketsSold, 0)} icon={Ticket} iconBg="bg-blue-600/20" iconColor="text-blue-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brewery-700/30 justify-between items-end">
        <div className="flex gap-1">
          {(['calendar', 'performers'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === tab ? 'text-amber-400 border-amber-400' : 'text-brewery-400 border-transparent hover:text-brewery-200'}`}>
              {tab === 'calendar' ? 'Events Calendar' : 'Performers'}
            </button>
          ))}
        </div>
        <button className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-amber-600/20 mb-1">
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map(event => (
            <div key={event.id} onClick={() => setSelectedEvent(event)} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden cursor-pointer hover:border-amber-500/20 transition-all group">
              {/* Date Banner */}
              <div className={`h-2 ${event.status === 'completed' ? 'bg-brewery-600' : event.status === 'cancelled' ? 'bg-red-600' : 'bg-gradient-to-r from-amber-600 to-purple-600'}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{typeIcons[event.type]}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-brewery-100 group-hover:text-amber-300 transition-colors">{event.title}</h3>
                      <p className="text-[10px] text-brewery-400">{event.type.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <Badge variant={event.status === 'completed' ? 'gray' : event.status === 'cancelled' ? 'red' : 'green'}>{event.status}</Badge>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-brewery-300">
                    <Calendar className="w-3.5 h-3.5 text-brewery-500" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-brewery-300">
                    <Clock className="w-3.5 h-3.5 text-brewery-500" />
                    <span>{event.startTime} — {event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-brewery-300">
                    <MapPin className="w-3.5 h-3.5 text-brewery-500" />
                    <span className="capitalize">{event.location.replace('-', ' ')}</span>
                  </div>
                  {event.performer && (
                    <div className="flex items-center gap-2 text-xs text-brewery-300">
                      <Music className="w-3.5 h-3.5 text-brewery-500" />
                      <span>{event.performer.name} ({event.performer.genre})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-brewery-700/20">
                  <div className="flex gap-2">
                    {event.isFamilyFriendly && <Badge variant="green">Family Friendly</Badge>}
                    {event.isTicketed && <Badge variant="amber">{event.ticketsSold}/{event.capacity} tickets</Badge>}
                    {!event.isTicketed && <Badge variant="gray">Free</Badge>}
                  </div>
                  {event.revenue > 0 && (
                    <span className="text-xs font-medium text-emerald-400">${event.revenue.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'performers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {performers.map(perf => (
            <div key={perf.id} onClick={() => setSelectedPerformer(perf)} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 cursor-pointer hover:border-purple-500/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-brewery-100">{perf.name}</h3>
                  <p className="text-xs text-brewery-400">{perf.genre}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium text-amber-300">{perf.rating}</span>
                </div>
              </div>
              <p className="text-xs text-brewery-300 mb-3 line-clamp-2">{perf.bio}</p>
              <div className="flex items-center justify-between pt-3 border-t border-brewery-700/20">
                <span className="text-xs text-brewery-400">{perf.pastPerformances} shows</span>
                <span className="text-xs font-medium text-emerald-400">${perf.fee}/show</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
      <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={selectedEvent?.title || ''} size="lg">
        {selectedEvent && (
          <div className="space-y-4">
            <p className="text-sm text-brewery-200">{selectedEvent.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-brewery-800/30 text-center">
                <p className="text-lg font-bold text-brewery-100">{selectedEvent.capacity}</p><p className="text-[10px] text-brewery-500">Capacity</p>
              </div>
              <div className="p-3 rounded-lg bg-brewery-800/30 text-center">
                <p className="text-lg font-bold text-amber-400">{selectedEvent.ticketsSold}</p><p className="text-[10px] text-brewery-500">Tickets Sold</p>
              </div>
              <div className="p-3 rounded-lg bg-brewery-800/30 text-center">
                <p className="text-lg font-bold text-emerald-400">${selectedEvent.revenue.toLocaleString()}</p><p className="text-[10px] text-brewery-500">Revenue</p>
              </div>
              <div className="p-3 rounded-lg bg-brewery-800/30 text-center">
                <p className="text-lg font-bold text-brewery-100">${selectedEvent.ticketPrice}</p><p className="text-[10px] text-brewery-500">Ticket Price</p>
              </div>
            </div>
            {selectedEvent.specialBeer && (
              <div className="p-3 rounded-lg bg-amber-600/10 border border-amber-500/20">
                <p className="text-xs text-amber-300">🍺 Featured Beer: <span className="font-semibold">{selectedEvent.specialBeer}</span></p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Performer Detail Modal */}
      <Modal open={!!selectedPerformer} onClose={() => setSelectedPerformer(null)} title={selectedPerformer?.name || ''}>
        {selectedPerformer && (
          <div className="space-y-4">
            <Badge variant="purple">{selectedPerformer.genre}</Badge>
            <p className="text-sm text-brewery-200">{selectedPerformer.bio}</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-brewery-800/30 text-center">
                <p className="text-lg font-bold text-brewery-100">{selectedPerformer.pastPerformances}</p><p className="text-[10px] text-brewery-500">Shows</p>
              </div>
              <div className="p-3 rounded-lg bg-brewery-800/30 text-center">
                <p className="text-lg font-bold text-emerald-400">${selectedPerformer.fee}</p><p className="text-[10px] text-brewery-500">Fee/Show</p>
              </div>
              <div className="p-3 rounded-lg bg-brewery-800/30 text-center">
                <p className="text-lg font-bold text-amber-400">{selectedPerformer.rating}</p><p className="text-[10px] text-brewery-500">Rating</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-brewery-400">{selectedPerformer.contactEmail}</p>
              <p className="text-xs text-brewery-400">{selectedPerformer.contactPhone}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
