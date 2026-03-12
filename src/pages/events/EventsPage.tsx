import { useState, useMemo } from 'react';
import { Calendar, Music, DollarSign, Plus, MapPin, Clock, Ticket, Star, CheckCircle2, Users, ScanLine, Search, QrCode, TrendingUp } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import SlidePanel from '../../components/ui/SlidePanel';
import StatCard from '../../components/ui/StatCard';
import { useData } from '../../context/DataContext';
import { useBrewery } from '../../context/BreweryContext';
import { useToast } from '../../components/ui/ToastProvider';
import type { BreweryEvent, Performer } from '../../types';
import { clsx } from 'clsx';

const typeIcons: Record<string, string> = { 'live-music': '🎵', trivia: '🧠', 'beer-release': '🍺', 'tap-takeover': '🍻', 'pairing-dinner': '🍽️', private: '🔒', family: '👨‍👩‍👧‍👦', tour: '🏭', holiday: '🎄', fundraiser: '❤️' };

const eventTypes: BreweryEvent['type'][] = ['live-music', 'trivia', 'beer-release', 'tap-takeover', 'pairing-dinner', 'private', 'family', 'tour', 'holiday', 'fundraiser'];
const locationOptions: BreweryEvent['location'][] = ['taproom', 'patio', 'beer-garden', 'event-hall', 'outdoor'];

const inputClass = 'w-full bg-brewery-800/50 border border-brewery-600/30 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30';
const labelClass = 'block text-xs font-medium text-brewery-300 mb-1';

type ActiveTab = 'calendar' | 'ticketing' | 'performers';

export default function EventsPage() {
  const { performers } = useData();
  const { events, ticketSales, addEvent, sellTickets, checkInTicket } = useBrewery();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<BreweryEvent | null>(null);
  const [selectedPerformer, setSelectedPerformer] = useState<Performer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Ticket selling state
  const [sellEventId, setSellEventId] = useState<string | null>(null);
  const [saleConfirmed, setSaleConfirmed] = useState<{ buyerName: string; quantity: number; total: number; ticketCode: string } | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [ticketQty, setTicketQty] = useState(1);

  // Check-in panel state
  const [checkinEventId, setCheckinEventId] = useState<string | null>(null);
  const [checkinSearch, setCheckinSearch] = useState('');

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
    setTitle(''); setType('live-music'); setDate(''); setStartTime(''); setEndTime('');
    setLocation('taproom'); setDescription(''); setCapacity(50);
    setIsTicketed(false); setTicketPrice(0); setIsFamilyFriendly(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime || !endTime) {
      toast('error', 'Please fill in all required fields');
      return;
    }
    addEvent({
      title: title.trim(), type, date, startTime, endTime, location,
      description: description.trim(), capacity, isTicketed,
      ticketPrice: isTicketed ? ticketPrice : 0, isFamilyFriendly,
      status: 'upcoming', ticketsSold: 0, revenue: 0,
    });
    toast('success', `Event "${title.trim()}" created successfully`);
    resetForm();
    setShowAddModal(false);
  };

  const handleSellTickets = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellEventId || !buyerName.trim() || !buyerEmail.trim()) {
      toast('error', 'Please fill in buyer details');
      return;
    }
    const event = events.find(ev => ev.id === sellEventId);
    if (!event) return;
    const remaining = event.capacity - event.ticketsSold;
    if (ticketQty > remaining) {
      toast('error', `Only ${remaining} tickets remaining`);
      return;
    }
    const totalAmount = event.ticketPrice * ticketQty;
    const eventPrefix = sellEventId.substring(0, 4).toUpperCase();
    const generatedCode = `BH-${eventPrefix}-${String(Date.now()).slice(-4)}`;
    sellTickets({ eventId: sellEventId, buyerName: buyerName.trim(), buyerEmail: buyerEmail.trim(), quantity: ticketQty, totalAmount });
    setSaleConfirmed({ buyerName: buyerName.trim(), quantity: ticketQty, total: totalAmount, ticketCode: generatedCode });
    setBuyerName(''); setBuyerEmail(''); setTicketQty(1);
  };

  const upcoming = events.filter(e => e.status === 'upcoming');
  const totalTicketRevenue = events.reduce((s, e) => s + e.revenue, 0);
  const ticketedEvents = events.filter(e => e.isTicketed);

  // Ticketing tab stats
  const totalSold = ticketedEvents.reduce((s, e) => s + e.ticketsSold, 0);
  const checkedInCount = ticketSales.filter(s => s.checkedIn).length;
  const totalCheckedInGuests = ticketSales.filter(s => s.checkedIn).reduce((sum, s) => sum + s.quantity, 0);
  const totalGuestsSold = ticketSales.reduce((sum, s) => sum + s.quantity, 0);
  const checkinRate = totalGuestsSold > 0 ? Math.round((totalCheckedInGuests / totalGuestsSold) * 100) : 0;

  // Check-in panel data
  const checkinEvent = checkinEventId ? events.find(e => e.id === checkinEventId) : null;
  const checkinSales = useMemo(() => {
    if (!checkinEventId) return [];
    return ticketSales
      .filter(s => s.eventId === checkinEventId)
      .filter(s => !checkinSearch || s.buyerName.toLowerCase().includes(checkinSearch.toLowerCase()) || s.buyerEmail.toLowerCase().includes(checkinSearch.toLowerCase()) || s.ticketCode.toLowerCase().includes(checkinSearch.toLowerCase()));
  }, [ticketSales, checkinEventId, checkinSearch]);

  const sellEvent = sellEventId ? events.find(e => e.id === sellEventId) : null;
  const remainingTickets = sellEvent ? sellEvent.capacity - sellEvent.ticketsSold : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Upcoming Events" value={upcoming.length} icon={Calendar} iconBg="bg-purple-600/20" iconColor="text-purple-400" />
        <StatCard title="Ticket Revenue" value={`$${totalTicketRevenue.toLocaleString()}`} icon={DollarSign} iconBg="bg-emerald-600/20" iconColor="text-emerald-400" />
        <StatCard title="Tickets Sold" value={totalSold} icon={Ticket} iconBg="bg-blue-600/20" iconColor="text-blue-400" />
        <StatCard title="Total Performers" value={performers.length} icon={Music} iconBg="bg-amber-600/20" iconColor="text-amber-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brewery-700/30 justify-between items-end">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {([['calendar', 'Events Calendar'], ['ticketing', 'Ticketing'], ['performers', 'Performers']] as [ActiveTab, string][]).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={clsx(
              'px-4 py-2.5 text-sm font-medium transition-all border-b-2 whitespace-nowrap',
              activeTab === tab ? 'text-amber-400 border-amber-400' : 'text-brewery-400 border-transparent hover:text-brewery-200'
            )}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-amber-600/20 mb-1 whitespace-nowrap flex-shrink-0">
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {/* ── CALENDAR TAB ── */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map(event => (
            <div key={event.id} onClick={() => setSelectedEvent(event)} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden cursor-pointer hover:border-amber-500/20 transition-all group">
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
                  <div className="flex gap-2 flex-wrap">
                    {event.isFamilyFriendly && <Badge variant="green">Family</Badge>}
                    {event.isTicketed && <Badge variant="amber">{event.ticketsSold}/{event.capacity} tickets</Badge>}
                    {!event.isTicketed && <Badge variant="gray">Free</Badge>}
                  </div>
                  {event.revenue > 0 && <span className="text-xs font-medium text-emerald-400">${event.revenue.toLocaleString()}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TICKETING TAB ── */}
      {activeTab === 'ticketing' && (
        <div className="space-y-6">
          {/* Ticketing KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
              <p className="text-[11px] font-medium text-brewery-400 uppercase tracking-wider mb-1">Ticketed Events</p>
              <p className="text-2xl font-bold text-amber-400">{ticketedEvents.length}</p>
              <p className="text-xs text-brewery-500 mt-1">{ticketedEvents.filter(e => e.status === 'upcoming').length} upcoming</p>
            </div>
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
              <p className="text-[11px] font-medium text-brewery-400 uppercase tracking-wider mb-1">Tickets Sold</p>
              <p className="text-2xl font-bold text-blue-400">{totalSold.toLocaleString()}</p>
              <p className="text-xs text-brewery-500 mt-1">across all events</p>
            </div>
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
              <p className="text-[11px] font-medium text-brewery-400 uppercase tracking-wider mb-1">Ticket Revenue</p>
              <p className="text-2xl font-bold text-emerald-400">${totalTicketRevenue.toLocaleString()}</p>
              <p className="text-xs text-brewery-500 mt-1">total collected</p>
            </div>
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
              <p className="text-[11px] font-medium text-brewery-400 uppercase tracking-wider mb-1">Check-in Rate</p>
              <p className="text-2xl font-bold text-purple-400">{checkinRate}%</p>
              <p className="text-xs text-brewery-500 mt-1">{checkedInCount} of {ticketSales.length} orders</p>
            </div>
          </div>

          {/* Ticketed Events List */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-brewery-200">Ticketed Events</h2>
            {ticketedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-brewery-900/40 border border-brewery-700/30 rounded-xl">
                <Ticket className="w-10 h-10 text-brewery-600 mb-3" />
                <p className="text-brewery-300 font-medium mb-1">No ticketed events yet</p>
                <p className="text-brewery-500 text-sm">Create an event with ticketing enabled to get started.</p>
              </div>
            ) : (
              ticketedEvents.map(event => {
                const soldPct = event.capacity > 0 ? (event.ticketsSold / event.capacity) * 100 : 0;
                const eventSales = ticketSales.filter(s => s.eventId === event.id);
                const checkedInGuests = eventSales.filter(s => s.checkedIn).reduce((sum, s) => sum + s.quantity, 0);
                const totalGuests = eventSales.reduce((sum, s) => sum + s.quantity, 0);
                const eventCheckinPct = totalGuests > 0 ? Math.round((checkedInGuests / totalGuests) * 100) : 0;
                const remaining = event.capacity - event.ticketsSold;
                const isSoldOut = remaining <= 0;

                return (
                  <div key={event.id} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{typeIcons[event.type]}</span>
                          <h3 className="text-sm font-semibold text-brewery-100 truncate">{event.title}</h3>
                          <Badge variant={event.status === 'completed' ? 'gray' : event.status === 'cancelled' ? 'red' : 'green'}>{event.status}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-brewery-400 mb-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.startTime}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location.replace('-', ' ')}</span>
                          <span className="font-medium text-amber-400">${event.ticketPrice}/ticket</span>
                        </div>

                        {/* Capacity bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-brewery-400">Tickets sold</span>
                            <span className={clsx('font-semibold', isSoldOut ? 'text-red-400' : soldPct >= 80 ? 'text-amber-400' : 'text-emerald-400')}>
                              {event.ticketsSold} / {event.capacity}
                              {isSoldOut ? ' — SOLD OUT' : ` (${remaining} left)`}
                            </span>
                          </div>
                          <div className="h-2 bg-brewery-800 rounded-full overflow-hidden">
                            <div
                              className={clsx('h-full rounded-full transition-all', isSoldOut ? 'bg-red-500' : soldPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500')}
                              style={{ width: `${Math.min(soldPct, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Revenue + check-in */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-400 font-medium">${event.revenue.toLocaleString()}</span>
                            <span className="text-brewery-500">revenue</span>
                          </div>
                          {eventSales.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                              <span className="text-purple-400 font-medium">{eventCheckinPct}%</span>
                              <span className="text-brewery-500">checked in</span>
                            </div>
                          )}
                          {eventSales.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <Users className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-blue-400 font-medium">{eventSales.length}</span>
                              <span className="text-brewery-500">orders</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex sm:flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => { setSellEventId(event.id); setBuyerName(''); setBuyerEmail(''); setTicketQty(1); }}
                          disabled={isSoldOut || event.status === 'completed' || event.status === 'cancelled'}
                          className={clsx(
                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            isSoldOut || event.status === 'completed' || event.status === 'cancelled'
                              ? 'bg-brewery-800/50 text-brewery-600 cursor-not-allowed'
                              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20'
                          )}
                        >
                          <Ticket className="w-4 h-4" />
                          Sell Tickets
                        </button>
                        <button
                          onClick={() => { setCheckinEventId(event.id); setCheckinSearch(''); }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/20 transition-colors"
                        >
                          <ScanLine className="w-4 h-4" />
                          Check-in
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── PERFORMERS TAB ── */}
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

      {/* ── Event Detail Modal ── */}
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
            {selectedEvent.isTicketed && selectedEvent.status !== 'completed' && (
              <div className="flex gap-3">
                <button
                  onClick={() => { setSelectedEvent(null); setSellEventId(selectedEvent.id); setActiveTab('ticketing'); }}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-sm"
                >
                  <Ticket className="w-4 h-4" /> Sell Tickets
                </button>
                <button
                  onClick={() => { setSelectedEvent(null); setCheckinEventId(selectedEvent.id); setActiveTab('ticketing'); }}
                  className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/20 font-medium px-4 py-2 rounded-lg text-sm"
                >
                  <ScanLine className="w-4 h-4" /> Check-in
                </button>
              </div>
            )}
            {selectedEvent.specialBeer && (
              <div className="p-3 rounded-lg bg-amber-600/10 border border-amber-500/20">
                <p className="text-xs text-amber-300">🍺 Featured Beer: <span className="font-semibold">{selectedEvent.specialBeer}</span></p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Performer Detail Modal ── */}
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

      {/* ── Sell Tickets Modal ── */}
      <Modal open={!!sellEventId} onClose={() => { setSellEventId(null); setSaleConfirmed(null); }} title={saleConfirmed ? 'Sale Complete' : 'Sell Tickets'} size="lg">
        {saleConfirmed ? (
          /* ── Sale Confirmation Screen ── */
          <div className="flex flex-col items-center text-center py-4 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brewery-100 mb-1">Tickets Sold!</h3>
              <p className="text-sm text-brewery-400">{saleConfirmed.quantity} ticket{saleConfirmed.quantity > 1 ? 's' : ''} for <span className="text-brewery-200 font-medium">{saleConfirmed.buyerName}</span></p>
            </div>
            <div className="w-full bg-brewery-800/50 border border-brewery-700/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <QrCode className="w-12 h-12 text-brewery-400 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs text-brewery-500 mb-1">Ticket Code</p>
                  <p className="text-xl font-mono font-bold text-amber-400 tracking-wider">{saleConfirmed.ticketCode}</p>
                </div>
              </div>
              <div className="border-t border-brewery-700/30 pt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-brewery-500">Quantity</p>
                  <p className="text-base font-semibold text-brewery-100">{saleConfirmed.quantity} ticket{saleConfirmed.quantity > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-[11px] text-brewery-500">Total Charged</p>
                  <p className="text-base font-semibold text-emerald-400">${saleConfirmed.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-brewery-500">Provide this code to the buyer for entry check-in</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setSaleConfirmed(null)} className="flex-1 py-2.5 text-sm font-medium bg-brewery-800/50 hover:bg-brewery-700/50 border border-brewery-600/30 rounded-lg text-brewery-200 transition-colors">
                Sell Another
              </button>
              <button onClick={() => { setSellEventId(null); setSaleConfirmed(null); }} className="flex-1 py-2.5 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors">
                Done
              </button>
            </div>
          </div>
        ) : sellEvent ? (
          <form onSubmit={handleSellTickets} className="space-y-5">
            {/* Event summary */}
            <div className="bg-brewery-800/40 border border-brewery-700/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{typeIcons[sellEvent.type]}</span>
                <h3 className="text-sm font-semibold text-brewery-100">{sellEvent.title}</h3>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-brewery-400">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(sellEvent.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{sellEvent.startTime}</span>
                <span className="font-medium text-amber-400">${sellEvent.ticketPrice}/ticket</span>
                <span className={clsx('font-medium', remainingTickets <= 5 ? 'text-red-400' : 'text-emerald-400')}>
                  {remainingTickets} remaining
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Buyer Name *</label>
                <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Full name" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Email Address *</label>
                <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="email@example.com" className={inputClass} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Quantity</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setTicketQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg bg-brewery-800 border border-brewery-600/30 text-brewery-200 flex items-center justify-center hover:bg-brewery-700 transition-colors text-lg font-bold">−</button>
                  <span className="flex-1 text-center text-lg font-bold text-brewery-100">{ticketQty}</span>
                  <button type="button" onClick={() => setTicketQty(q => Math.min(remainingTickets, q + 1))} className="w-9 h-9 rounded-lg bg-brewery-800 border border-brewery-600/30 text-brewery-200 flex items-center justify-center hover:bg-brewery-700 transition-colors text-lg font-bold">+</button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Total Amount</label>
                <div className="h-10 flex items-center px-3 bg-brewery-800/30 border border-brewery-600/30 rounded-lg">
                  <span className="text-lg font-bold text-emerald-400">${(sellEvent.ticketPrice * ticketQty).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Ticket code preview */}
            <div className="flex items-center gap-3 p-3 bg-brewery-800/30 border border-brewery-700/30 rounded-lg">
              <QrCode className="w-8 h-8 text-brewery-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-brewery-400">Ticket code will be generated on purchase</p>
                <p className="text-xs text-brewery-500">Format: BH-{sellEvent.id.substring(0, 4).toUpperCase()}-XXXX</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-brewery-700/30">
              <button type="button" onClick={() => setSellEventId(null)} className="px-4 py-2 text-sm font-medium text-brewery-300 hover:text-brewery-100 transition-colors">Cancel</button>
              <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2 rounded-lg text-sm shadow-lg shadow-amber-600/20 transition-colors flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Complete Sale — ${(sellEvent.ticketPrice * ticketQty).toFixed(2)}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>

      {/* ── Add Event Modal ── */}
      <Modal open={showAddModal} onClose={() => { resetForm(); setShowAddModal(false); }} title="New Event" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Event Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Brew Fest" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Event Type</label>
              <select value={type} onChange={e => setType(e.target.value as BreweryEvent['type'])} className={inputClass}>
                {eventTypes.map(t => <option key={t} value={t}>{typeIcons[t]} {t.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Time *</label>
              <input
                type="time"
                value={startTime}
                onChange={e => {
                  setStartTime(e.target.value);
                  if (!endTime && e.target.value) {
                    const [h, m] = e.target.value.split(':').map(Number);
                    const endH = (h + 2) % 24;
                    setEndTime(`${String(endH).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}`);
                  }
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Time *</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Location</label>
              <select value={location} onChange={e => setLocation(e.target.value as BreweryEvent['location'])} className={inputClass}>
                {locationOptions.map(loc => <option key={loc} value={loc}>{loc.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Capacity</label>
              <input type="number" min={1} value={capacity} onChange={e => setCapacity(Number(e.target.value))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the event..." className={inputClass} />
          </div>
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
          {isTicketed && (
            <div className="max-w-xs">
              <label className={labelClass}>Ticket Price ($)</label>
              <input type="number" min={0} step={0.01} value={ticketPrice} onChange={e => setTicketPrice(Number(e.target.value))} className={inputClass} />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2 border-t border-brewery-700/30">
            <button type="button" onClick={() => { resetForm(); setShowAddModal(false); }} className="px-4 py-2 text-sm font-medium text-brewery-300 hover:text-brewery-100 transition-colors">Cancel</button>
            <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2 rounded-lg text-sm shadow-lg shadow-amber-600/20 transition-colors">Create Event</button>
          </div>
        </form>
      </Modal>

      {/* ── Check-in Slide Panel ── */}
      <SlidePanel isOpen={!!checkinEventId} onClose={() => setCheckinEventId(null)} title={`Check-in: ${checkinEvent?.title ?? ''}`} width="w-[520px]">
        {checkinEvent && (
          <div className="flex flex-col h-full">
            {/* Event header */}
            <div className="bg-brewery-800/40 border border-brewery-700/30 rounded-xl p-4 mb-4">
              <div className="flex flex-wrap gap-4 text-xs text-brewery-400">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(checkinEvent.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{checkinEvent.startTime} — {checkinEvent.endTime}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{checkinEvent.ticketsSold} sold</span>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brewery-500" />
              <input
                type="text"
                value={checkinSearch}
                onChange={e => setCheckinSearch(e.target.value)}
                placeholder="Search by name, email, or ticket code..."
                className="w-full bg-brewery-800/50 border border-brewery-600/30 rounded-lg pl-9 pr-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-brewery-800/40 rounded-lg p-2.5 text-center">
                <p className="text-sm font-bold text-brewery-100">{ticketSales.filter(s => s.eventId === checkinEventId).length}</p>
                <p className="text-[10px] text-brewery-500">Orders</p>
              </div>
              <div className="bg-brewery-800/40 rounded-lg p-2.5 text-center">
                <p className="text-sm font-bold text-emerald-400">{ticketSales.filter(s => s.eventId === checkinEventId && s.checkedIn).length}</p>
                <p className="text-[10px] text-brewery-500">Checked In</p>
              </div>
              <div className="bg-brewery-800/40 rounded-lg p-2.5 text-center">
                <p className="text-sm font-bold text-amber-400">{ticketSales.filter(s => s.eventId === checkinEventId && !s.checkedIn).length}</p>
                <p className="text-[10px] text-brewery-500">Awaiting</p>
              </div>
            </div>

            {/* Attendee list */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {checkinSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Ticket className="w-8 h-8 text-brewery-600 mb-2" />
                  <p className="text-brewery-400 text-sm">{checkinSearch ? 'No matching tickets found' : 'No tickets sold yet'}</p>
                </div>
              ) : (
                checkinSales.map(sale => (
                  <div key={sale.id} className={clsx(
                    'flex items-center gap-3 p-3.5 rounded-xl border transition-all',
                    sale.checkedIn
                      ? 'bg-emerald-900/20 border-emerald-700/30'
                      : 'bg-brewery-900/60 border-brewery-700/30 hover:border-amber-500/20'
                  )}>
                    <div className={clsx(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      sale.checkedIn ? 'bg-emerald-600/20' : 'bg-brewery-800/60'
                    )}>
                      {sale.checkedIn
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        : <Ticket className="w-5 h-5 text-brewery-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brewery-100 truncate">{sale.buyerName}</p>
                      <p className="text-xs text-brewery-400 truncate">{sale.buyerEmail}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-brewery-500">{sale.ticketCode}</span>
                        <span className="text-[10px] text-brewery-600">•</span>
                        <span className="text-[10px] text-brewery-500">{sale.quantity} {sale.quantity === 1 ? 'guest' : 'guests'}</span>
                        {sale.checkedIn && sale.checkedInAt && (
                          <>
                            <span className="text-[10px] text-brewery-600">•</span>
                            <span className="text-[10px] text-emerald-600">Checked in {new Date(sale.checkedInAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {!sale.checkedIn && (
                      <button
                        onClick={() => { checkInTicket(sale.id); toast('success', `${sale.buyerName} checked in!`); }}
                        className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Check In
                      </button>
                    )}
                    {sale.checkedIn && (
                      <Badge variant="green">Done</Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
