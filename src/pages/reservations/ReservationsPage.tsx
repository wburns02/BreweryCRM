import { useState } from 'react';
import { BookOpen, Clock, Users, Phone, MapPin, Plus, Armchair, Baby } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useBrewery } from '../../context/BreweryContext';
import { useToast } from '../../components/ui/ToastProvider';

const statusColors: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
  confirmed: 'green', seated: 'blue', completed: 'gray', cancelled: 'red', 'no-show': 'red', waitlist: 'amber',
};

const tables = {
  taproom: ['T-1', 'T-2', 'T-3', 'T-4', 'T-5', 'T-6', 'T-7', 'T-8', 'T-9', 'T-10', 'T-11', 'T-12', 'T-B1', 'T-B2'],
  patio: ['P-1', 'P-2', 'P-3', 'P-4', 'P-5', 'P-6'],
  'beer-garden': ['BG-1', 'BG-2', 'BG-3', 'BG-4', 'BG-5', 'BG-6', 'BG-7', 'BG-8'],
  'private-room': ['PR-1', 'PR-2'],
};

const inputClasses = 'w-full bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50';
const labelClasses = 'block text-xs font-medium text-brewery-400 mb-1';

export default function ReservationsPage() {
  const { reservations, addReservation, updateReservation } = useBrewery();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState<'reservations' | 'floor-plan'>('reservations');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [section, setSection] = useState<'taproom' | 'patio' | 'beer-garden' | 'private-room'>('taproom');
  const [notes, setNotes] = useState('');
  const [isHighChairNeeded, setIsHighChairNeeded] = useState(false);

  const occupiedTables = reservations.filter(r => r.status === 'seated' || r.status === 'confirmed').map(r => r.tableId).filter(Boolean);
  const todayStr = new Date().toISOString().split('T')[0];
  // Show today + upcoming (next 7 days) to handle API data with future-dated reservations
  const sevenDaysOut = new Date(); sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);
  const sevenDaysStr = sevenDaysOut.toISOString().split('T')[0];
  const upcoming = reservations.filter(r => r.date >= todayStr && r.date <= sevenDaysStr);
  const todayOnly = reservations.filter(r => r.date === todayStr);
  const today = todayOnly.length > 0 ? todayOnly : upcoming;
  const confirmed = today.filter(r => r.status === 'confirmed').length;
  const seated = today.filter(r => r.status === 'seated').length;
  const waitlisted = today.filter(r => r.status === 'waitlist').length;

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('');
    setPartySize('2');
    setSection('taproom');
    setNotes('');
    setIsHighChairNeeded(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !time.trim()) {
      toast('error', 'Please fill in customer name and time');
      return;
    }
    addReservation({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: '',
      date,
      time,
      partySize: parseInt(partySize) || 2,
      section,
      status: 'confirmed',
      notes: notes.trim(),
      specialRequests: [],
      isHighChairNeeded,
    });
    toast('success', `Reservation created for ${customerName.trim()}`);
    resetForm();
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-emerald-400" /><span className="text-xs text-brewery-400">Confirmed</span></div>
          <p className="text-2xl font-bold text-emerald-400">{confirmed}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Armchair className="w-4 h-4 text-blue-400" /><span className="text-xs text-brewery-400">Seated</span></div>
          <p className="text-2xl font-bold text-blue-400">{seated}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-amber-400" /><span className="text-xs text-brewery-400">Waitlist</span></div>
          <p className="text-2xl font-bold text-amber-400">{waitlisted}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-brewery-300" /><span className="text-xs text-brewery-400">Total Guests</span></div>
          <p className="text-2xl font-bold text-brewery-50">{today.reduce((s, r) => s + r.partySize, 0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brewery-700/30 justify-between items-end">
        <div className="flex gap-1">
          <button onClick={() => setActiveSection('reservations')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeSection === 'reservations' ? 'text-amber-400 border-amber-400' : 'text-brewery-400 border-transparent hover:text-brewery-200'}`}>Reservations</button>
          <button onClick={() => setActiveSection('floor-plan')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeSection === 'floor-plan' ? 'text-amber-400 border-amber-400' : 'text-brewery-400 border-transparent hover:text-brewery-200'}`}>Floor Plan</button>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 mb-1 shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" /> New Reservation
        </button>
      </div>

      {activeSection === 'reservations' && (
        <div className="space-y-3">
          {today.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brewery-800/50 flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-brewery-500" />
              </div>
              <h3 className="text-base font-semibold text-brewery-200 mb-1">No reservations today</h3>
              <p className="text-sm text-brewery-400 mb-5">Future reservations will appear here. Add one to get started.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-amber-600/20"
              >
                <Plus className="w-4 h-4" /> New Reservation
              </button>
            </div>
          )}
          {today.map(res => (
            <div key={res.id} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 hover:border-amber-500/20 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-amber-600/20 flex flex-col items-center justify-center">
                    {(() => {
                      const [h, m] = res.time.split(':').map(Number);
                      const h12 = h % 12 || 12;
                      const isPM = h >= 12;
                      return (<>
                        <span className="text-lg font-bold text-amber-400">{h12}:{String(m || 0).padStart(2, '0')}</span>
                        <span className="text-[10px] text-amber-500 -mt-1">{isPM ? 'PM' : 'AM'}</span>
                      </>);
                    })()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-brewery-100">{res.customerName}</h3>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-brewery-400"><Users className="w-3 h-3" />{res.partySize} guests</span>
                      <span className="flex items-center gap-1 text-xs text-brewery-400"><MapPin className="w-3 h-3" />{res.section.replace('-', ' ')}</span>
                      {res.tableId && <span className="flex items-center gap-1 text-xs text-brewery-400"><Armchair className="w-3 h-3" />{res.tableId}</span>}
                      {res.customerPhone && <span className="flex items-center gap-1 text-xs text-brewery-400"><Phone className="w-3 h-3" />{res.customerPhone}</span>}
                    </div>
                    {res.notes && <p className="text-xs text-brewery-300 mt-1 italic">{res.notes}</p>}
                    <div className="flex gap-1.5 mt-2">
                      {res.isHighChairNeeded && <Badge variant="blue"><Baby className="w-3 h-3 mr-1" />High Chair</Badge>}
                      {res.specialRequests.map(req => <Badge key={req} variant="gray">{req}</Badge>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 md:mt-0">
                  <Badge variant={statusColors[res.status]}>{res.status}</Badge>
                  {res.status === 'confirmed' && (
                    <button
                      onClick={() => { updateReservation(res.id, { status: 'seated' }); toast('success', `${res.customerName} has been seated`); }}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Seat
                    </button>
                  )}
                  {res.status === 'waitlist' && (
                    <button
                      onClick={() => { toast('info', `Notification sent to ${res.customerName}`); }}
                      className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Notify
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'floor-plan' && (
        <div className="space-y-6">
          {(Object.entries(tables) as [string, string[]][]).map(([sectionKey, tableList]) => (
            <div key={sectionKey}>
              <h3 className="text-sm font-semibold text-brewery-200 mb-3 capitalize">{sectionKey.replace('-', ' ')}</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {tableList.map(table => {
                  const isOccupied = occupiedTables.includes(table);
                  const reservation = reservations.find(r => r.tableId === table);
                  return (
                    <div
                      key={table}
                      onClick={() => {
                        if (reservation) {
                          toast('info', `${table}: ${reservation.customerName} — ${reservation.partySize} guests, ${reservation.time}, ${reservation.status}`);
                        } else {
                          toast('info', `${table}: Available`);
                        }
                      }}
                      className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isOccupied ? 'bg-amber-600/20 border-amber-500/40 hover:border-amber-400' : 'bg-brewery-800/30 border-brewery-700/30 hover:border-emerald-500/40'
                    }`}>
                      <span className="text-xs font-bold text-brewery-200">{table}</span>
                      {reservation && <span className="text-[9px] text-brewery-400 mt-0.5">{reservation.partySize}p</span>}
                      <div className={`w-2 h-2 rounded-full mt-1 ${isOccupied ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex gap-4 text-xs text-brewery-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Available</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Occupied/Reserved</span>
          </div>
        </div>
      )}

      {/* Add Reservation Modal */}
      <Modal open={showAddModal} onClose={() => { resetForm(); setShowAddModal(false); }} title="New Reservation" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="John Smith"
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className={labelClasses}>Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClasses}>Date *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className={labelClasses}>Time *</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className={labelClasses}>Party Size</label>
              <input
                type="number"
                min="1"
                max="20"
                value={partySize}
                onChange={e => setPartySize(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Section</label>
            <select
              value={section}
              onChange={e => setSection(e.target.value as typeof section)}
              className={inputClasses}
            >
              <option value="taproom">Taproom</option>
              <option value="patio">Patio</option>
              <option value="beer-garden">Beer Garden</option>
              <option value="private-room">Private Room</option>
            </select>
          </div>

          <div>
            <label className={labelClasses}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any special requests or notes..."
              rows={2}
              className={inputClasses}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsHighChairNeeded(!isHighChairNeeded)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isHighChairNeeded ? 'bg-amber-500' : 'bg-brewery-700'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isHighChairNeeded ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
            </button>
            <label className="text-xs font-medium text-brewery-400 flex items-center gap-1.5">
              <Baby className="w-3.5 h-3.5" /> High chair needed
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-brewery-700/30">
            <button
              type="button"
              onClick={() => { resetForm(); setShowAddModal(false); }}
              className="px-4 py-2 text-sm font-medium text-brewery-400 hover:text-brewery-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-lg shadow-amber-600/20 transition-colors"
            >
              Create Reservation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
