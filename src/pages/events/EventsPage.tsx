import { useState } from 'react';
import { Calendar, Music, DollarSign, Plus, MapPin, Clock, Ticket, Star } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import { useData } from '../../context/DataContext';
import { useBrewery } from '../../context/BreweryContext';
import { useToast } from '../../components/ui/ToastProvider';
import type { BreweryEvent, Performer } from '../../types';

const typeIcons: Record<string, string> = { 'live-music': '🎵', trivia: '🧠', 'beer-release': '🍺', 'tap-takeover': '🍻', 'pairing-dinner': '🍽️', private: '🔒', family: '👨‍👩‍👧‍👦', tour: '🏭', holiday: '🎄', fundraiser: '❤️' };

const eventTypes: BreweryEvent['type'][] = ['live-music', 'trivia', 'beer-release', 'tap-takeover', 'pairing-dinner', 'private', 'family', 'tour', 'holiday', 'fundraiser'];
const locationOptions: BreweryEvent['location'][] = ['taproom', 'patio', 'beer-garden', 'event-hall', 'outdoor'];

const inputClass = 'w-full bg-brewery-800/50 border border-brewery-600/30 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30';
const labelClass = 'block text-xs font-medium text-brewery-300 mb-1';

export default function EventsPage() {
  const { performers } = useData();
  const { events, addEvent } = useBrewery();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'calendar' | 'performers'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<BreweryEvent | null>(null);
  const [selectedPerformer, setSelectedPerformer] = useState<Performer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<BreweryEvent['type']>('live-music');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState<BreweryEvent['location']>('taproom');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(50);
  const [isTicketed, setIsTicketed] = useState(false);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [isFamilyFriendly, setIsFamilyFriendly] = useState(false);

  const resetForm = () => {
    setTitle('');
    setType('live-music');
    setDate('');
    setStartTime('');
    setEndTime('');
    setLocation('taproom');
    setDescription('');
    setCapacity(50);
    setIsTicketed(false);
    setTicketPrice(0);
    setIsFamilyFriendly(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime || !endTime) {
      toast('error', 'Please fill in all required fields');
      return;
    }
    addEvent({
      title: title.trim(),
      type,
      date,
      startTime,
      endTime,
      location,
      description: description.trim(),
      capacity,
      isTicketed,
      ticketPrice: isTicketed ? ticketPrice : 0,
      isFamilyFriendly,
      status: 'upcoming',
      ticketsSold: 0,
      revenue: 0,
    });
    toast('success', `Event "${title.trim()}" created successfully`);
    resetForm();
    setShowAddModal(false);
  };

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
        <button onClick={() => setShowAddModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-amber-600/20 mb-1">
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

      {/* Add Event Modal */}
      <Modal open={showAddModal} onClose={() => { resetForm(); setShowAddModal(false); }} title="New Event" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>Event Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Brew Fest" className={inputClass} />
          </div>

          {/* Type + Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Event Type</label>
              <select value={type} onChange={e => setType(e.target.value as BreweryEvent['type'])} className={inputClass}>
                {eventTypes.map(t => (
                  <option key={t} value={t}>{typeIcons[t]} {t.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Time row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Time *</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Time *</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Location + Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Location</label>
              <select value={location} onChange={e => setLocation(e.target.value as BreweryEvent['location'])} className={inputClass}>
                {locationOptions.map(loc => (
                  <option key={loc} value={loc}>{loc.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Capacity</label>
              <input type="number" min={1} value={capacity} onChange={e => setCapacity(Number(e.target.value))} className={inputClass} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the event..." className={inputClass} />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isTicketed} onChange={e => setIsTicketed(e.target.checked)} className="w-4 h-4 rounded border-brewery-600 bg-brewery-800 text-amber-500 focus:ring-amber-500/30" />
              <span className="text-sm text-brewery-200">Ticketed Event</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFamilyFriendly} onChange={e => setIsFamilyFriendly(e.target.checked)} className="w-4 h-4 rounded border-brewery-600 bg-brewery-800 text-amber-500 focus:ring-amber-500/30" />
              <span className="text-sm text-brewery-200">Family Friendly</span>
            </label>
          </div>

          {/* Ticket Price (conditional) */}
          {isTicketed && (
            <div className="max-w-xs">
              <label className={labelClass}>Ticket Price ($)</label>
              <input type="number" min={0} step={0.01} value={ticketPrice} onChange={e => setTicketPrice(Number(e.target.value))} className={inputClass} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-brewery-700/30">
            <button type="button" onClick={() => { resetForm(); setShowAddModal(false); }} className="px-4 py-2 text-sm font-medium text-brewery-300 hover:text-brewery-100 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2 rounded-lg text-sm shadow-lg shadow-amber-600/20 transition-colors">
              Create Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
