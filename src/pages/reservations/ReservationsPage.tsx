import { useState } from 'react';
import { BookOpen, Clock, Users, Phone, MapPin, Plus, Armchair, Baby } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { reservations } from '../../data/mockData';

const statusColors: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
  confirmed: 'green', seated: 'blue', completed: 'gray', cancelled: 'red', 'no-show': 'red', waitlist: 'amber',
};

const tables = {
  taproom: ['T-1', 'T-2', 'T-3', 'T-4', 'T-5', 'T-6', 'T-7', 'T-8', 'T-9', 'T-10', 'T-11', 'T-12', 'T-B1', 'T-B2'],
  patio: ['P-1', 'P-2', 'P-3', 'P-4', 'P-5', 'P-6'],
  'beer-garden': ['BG-1', 'BG-2', 'BG-3', 'BG-4', 'BG-5', 'BG-6', 'BG-7', 'BG-8'],
  'private-room': ['PR-1', 'PR-2'],
};

const occupiedTables = reservations.filter(r => r.status === 'seated' || r.status === 'confirmed').map(r => r.tableId).filter(Boolean);

export default function ReservationsPage() {
  const [activeSection, setActiveSection] = useState<'reservations' | 'floor-plan'>('reservations');
  const today = reservations.filter(r => r.date === '2026-03-04');
  const confirmed = today.filter(r => r.status === 'confirmed').length;
  const seated = today.filter(r => r.status === 'seated').length;
  const waitlisted = today.filter(r => r.status === 'waitlist').length;

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
        <button className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 mb-1 shadow-lg shadow-amber-600/20">
          <Plus className="w-4 h-4" /> New Reservation
        </button>
      </div>

      {activeSection === 'reservations' && (
        <div className="space-y-3">
          {today.map(res => (
            <div key={res.id} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 hover:border-amber-500/20 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-amber-600/20 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-amber-400">{res.time.split(':')[0]}</span>
                    <span className="text-[10px] text-amber-500 -mt-1">{parseInt(res.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
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
                  {res.status === 'confirmed' && <button className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">Seat</button>}
                  {res.status === 'waitlist' && <button className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">Notify</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'floor-plan' && (
        <div className="space-y-6">
          {(Object.entries(tables) as [string, string[]][]).map(([section, tableList]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-brewery-200 mb-3 capitalize">{section.replace('-', ' ')}</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {tableList.map(table => {
                  const isOccupied = occupiedTables.includes(table);
                  const reservation = reservations.find(r => r.tableId === table);
                  return (
                    <div key={table} className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
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
    </div>
  );
}
