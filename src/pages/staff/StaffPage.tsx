import { useState } from 'react';
import { UserCog, Clock, DollarSign, ShieldCheck, Plus, Phone, Mail, Calendar, Edit2, TrendingUp } from 'lucide-react';

const TIP_ELIGIBLE_ROLES = new Set(['bartender', 'server', 'host']);
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../components/ui/ToastProvider';
import type { StaffMember } from '../../types';

const roleColors: Record<string, 'amber' | 'green' | 'blue' | 'purple' | 'red' | 'gray'> = {
  brewer: 'amber', bartender: 'purple', server: 'green', cook: 'red', host: 'blue', manager: 'blue', dishwasher: 'gray',
};

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const inputClass = 'w-full bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50';
const labelClass = 'block text-xs font-medium text-brewery-400 mb-1';

export default function StaffPage() {
  const { staff: apiStaff } = useData();
  const { toast } = useToast();
  const [localStaff, setLocalStaff] = useState<StaffMember[]>([]);
  const [activeTab, setActiveTab] = useState<'team' | 'schedule' | 'compliance'>('team');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMember, setViewMember] = useState<StaffMember | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffMember['role']>('server');
  const [hourlyRate, setHourlyRate] = useState('');
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [tabcCertified, setTabcCertified] = useState(false);
  const [foodHandlerCertified, setFoodHandlerCertified] = useState(false);

  const staff = [...apiStaff, ...localStaff];

  const totalHours = staff.reduce((s, m) => s + m.hoursThisWeek, 0);
  const totalLabor = staff.reduce((s, m) => s + (m.hoursThisWeek * m.hourlyRate), 0);
  const certIssues = staff.filter(s => !s.tabcCertified && s.role !== 'cook' && s.role !== 'dishwasher');

  const resetForm = () => {
    setFirstName(''); setLastName(''); setEmail(''); setPhone('');
    setRole('server'); setHourlyRate(''); setTabcCertified(false); setFoodHandlerCertified(false);
    setHireDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    const newMember: StaffMember = {
      id: crypto.randomUUID(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      hourlyRate: parseFloat(hourlyRate) || 15,
      hireDate,
      status: 'active',
      tabcCertified,
      foodHandlerCertified,
      hoursThisWeek: 0,
      salesThisWeek: 0,
      schedule: [],
    };
    setLocalStaff(prev => [...prev, newMember]);
    toast('success', `${firstName} ${lastName} added to the team!`);
    resetForm();
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><UserCog className="w-4 h-4 text-amber-400" /><span className="text-xs text-brewery-400">Active Staff</span></div>
          <p className="text-2xl font-bold text-brewery-50">{staff.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-blue-400" /><span className="text-xs text-brewery-400">Total Hours/Week</span></div>
          <p className="text-2xl font-bold text-blue-400">{totalHours}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-emerald-400" /><span className="text-xs text-brewery-400">Weekly Labor Cost</span></div>
          <p className="text-2xl font-bold text-emerald-400">${totalLabor.toLocaleString()}</p>
        </div>
        <div className={`bg-brewery-900/80 border rounded-xl p-4 ${certIssues.length > 0 ? 'border-red-500/30' : 'border-brewery-700/30'}`}>
          <div className="flex items-center gap-2 mb-2"><ShieldCheck className={`w-4 h-4 ${certIssues.length > 0 ? 'text-red-400' : 'text-emerald-400'}`} /><span className="text-xs text-brewery-400">Cert Issues</span></div>
          <p className={`text-2xl font-bold ${certIssues.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{certIssues.length}</p>
        </div>
      </div>

      {/* Tabs + Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 border-b border-brewery-700/30 flex-1">
          {(['team', 'schedule', 'compliance'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab ? 'text-amber-400 border-amber-400' : 'text-brewery-400 border-transparent hover:text-brewery-200'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddModal(true)} className="ml-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2 shadow-lg shadow-amber-600/20 whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {activeTab === 'team' && (
        <div>
          {staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-brewery-900/40 rounded-xl border border-brewery-700/30 border-dashed">
              <UserCog className="w-10 h-10 text-brewery-600" />
              <p className="text-brewery-400 font-medium">No staff members yet</p>
              <p className="text-brewery-500 text-sm">Click "Add Staff" to add your first team member.</p>
              <button onClick={() => setShowAddModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Staff Member
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {staff.map(member => (
                <div key={member.id} onClick={() => setViewMember(member)} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 hover:border-amber-500/30 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center text-sm font-bold text-amber-400">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brewery-100">{member.firstName} {member.lastName}</p>
                        <Badge variant={roleColors[member.role]}>{member.role}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.status === 'active' ? 'green' : 'gray'}>{member.status}</Badge>
                      <Edit2 className="w-3.5 h-3.5 text-brewery-600 group-hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 rounded-lg bg-brewery-800/30">
                      <p className="text-xs font-bold text-brewery-200">{member.hoursThisWeek}h</p>
                      <p className="text-[10px] text-brewery-500">This Week</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-brewery-800/30">
                      <p className="text-xs font-bold text-emerald-400">${member.hourlyRate}/hr</p>
                      <p className="text-[10px] text-brewery-500">Rate</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-brewery-800/30">
                      <p className="text-xs font-bold text-brewery-200">{member.salesThisWeek > 0 ? `$${member.salesThisWeek.toLocaleString()}` : '—'}</p>
                      <p className="text-[10px] text-brewery-500">Sales</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {member.tabcCertified ? <Badge variant="green">TABC ✓</Badge> : member.role !== 'cook' && member.role !== 'dishwasher' ? <Badge variant="red">TABC ✗</Badge> : null}
                    {member.foodHandlerCertified && <Badge variant="green">Food Handler ✓</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <>
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
            {staff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Clock className="w-8 h-8 text-brewery-600" />
                <p className="text-brewery-400 text-sm">Add staff members to build the schedule.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brewery-700/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase w-40">Staff</th>
                      {days.map(day => (
                        <th key={day} className="px-2 py-3 text-center text-xs font-semibold text-brewery-400 uppercase">{day}</th>
                      ))}
                      <th className="px-4 py-3 text-right text-xs font-semibold text-brewery-400 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brewery-700/20">
                    {staff.map(member => (
                      <tr key={member.id} className="hover:bg-brewery-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-brewery-100">{member.firstName} {member.lastName}</p>
                          <Badge variant={roleColors[member.role]}>{member.role}</Badge>
                        </td>
                        {days.map(day => {
                          const shift = member.schedule.find(s => s.day === day);
                          return (
                            <td key={day} className="px-2 py-3 text-center">
                              {shift ? (
                                <div className="p-1.5 rounded-lg bg-amber-600/10 border border-amber-500/20">
                                  <p className="text-[10px] font-medium text-amber-300">{shift.startTime}</p>
                                  <p className="text-[10px] text-brewery-400">{shift.endTime}</p>
                                </div>
                              ) : (
                                <span className="text-xs text-brewery-600">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-right text-sm font-medium text-brewery-200">{member.hoursThisWeek}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Weekly Hours & Pay Summary */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const scheduled = staff.filter(m => m.schedule && m.schedule.length > 0);
              const totalShifts = scheduled.reduce((s, m) => s + (m.schedule?.length || 0), 0);
              const totalHoursScheduled = scheduled.reduce((s, m) => {
                return s + (m.schedule || []).reduce((sh: number, shift) => sh + ((shift as unknown as { hours?: number }).hours || 8), 0);
              }, 0);
              const estimatedPayroll = scheduled.reduce((s, m) => {
                const hoursThisWeek = (m.schedule || []).reduce((sh: number, shift) => sh + ((shift as unknown as { hours?: number }).hours || 8), 0);
                return s + hoursThisWeek * (m.hourlyRate || 15);
              }, 0);
              const totalStaffScheduled = scheduled.length;
              return (
                <>
                  <div className="bg-brewery-800/40 border border-brewery-700/30 rounded-xl p-4">
                    <p className="text-xs text-brewery-400 mb-1">Staff Scheduled</p>
                    <p className="text-2xl font-bold text-brewery-100">{totalStaffScheduled}</p>
                    <p className="text-xs text-brewery-500">of {staff.length} total</p>
                  </div>
                  <div className="bg-brewery-800/40 border border-brewery-700/30 rounded-xl p-4">
                    <p className="text-xs text-brewery-400 mb-1">Total Shifts</p>
                    <p className="text-2xl font-bold text-amber-400">{totalShifts}</p>
                    <p className="text-xs text-brewery-500">this week</p>
                  </div>
                  <div className="bg-brewery-800/40 border border-brewery-700/30 rounded-xl p-4">
                    <p className="text-xs text-brewery-400 mb-1">Total Hours</p>
                    <p className="text-2xl font-bold text-blue-400">{totalHoursScheduled}</p>
                    <p className="text-xs text-brewery-500">scheduled hrs</p>
                  </div>
                  <div className="bg-brewery-800/40 border border-brewery-700/30 rounded-xl p-4">
                    <p className="text-xs text-brewery-400 mb-1">Est. Labor Cost</p>
                    <p className="text-2xl font-bold text-emerald-400">${estimatedPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-brewery-500">this week</p>
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-brewery-700/30">
              <h3 className="text-sm font-semibold text-brewery-200">Certification Tracker</h3>
            </div>
            {staff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <ShieldCheck className="w-8 h-8 text-brewery-600" />
                <p className="text-brewery-400 text-sm">No staff members to track.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brewery-700/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Staff</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Role</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-brewery-400 uppercase">TABC Certified</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-brewery-400 uppercase">TABC Expiry</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-brewery-400 uppercase">Food Handler</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-brewery-400 uppercase">FH Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brewery-700/20">
                    {staff.map(member => (
                      <tr key={member.id} className="hover:bg-brewery-800/30">
                        <td className="px-4 py-3 text-sm font-medium text-brewery-100">{member.firstName} {member.lastName}</td>
                        <td className="px-4 py-3"><Badge variant={roleColors[member.role]}>{member.role}</Badge></td>
                        <td className="px-4 py-3 text-center">{member.tabcCertified ? <Badge variant="green">Active</Badge> : <Badge variant="red">Missing</Badge>}</td>
                        <td className="px-4 py-3 text-center text-sm text-brewery-300">{member.tabcExpiry || '—'}</td>
                        <td className="px-4 py-3 text-center">{member.foodHandlerCertified ? <Badge variant="green">Active</Badge> : <Badge variant="red">Missing</Badge>}</td>
                        <td className="px-4 py-3 text-center text-sm text-brewery-300">{member.foodHandlerExpiry || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Staff Detail Modal */}
      {viewMember && (
        <Modal open={!!viewMember} onClose={() => setViewMember(null)} title={`${viewMember.firstName} ${viewMember.lastName}`} size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-brewery-700/30">
              <div className="w-16 h-16 rounded-full bg-amber-600/20 flex items-center justify-center text-2xl font-bold text-amber-400">
                {viewMember.firstName[0]}{viewMember.lastName[0]}
              </div>
              <div>
                <p className="text-lg font-semibold text-brewery-100">{viewMember.firstName} {viewMember.lastName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={roleColors[viewMember.role]}>{viewMember.role}</Badge>
                  <Badge variant={viewMember.status === 'active' ? 'green' : 'gray'}>{viewMember.status}</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-brewery-300">
                <Mail className="w-4 h-4 text-brewery-500 flex-shrink-0" />
                <span className="truncate">{viewMember.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brewery-300">
                <Phone className="w-4 h-4 text-brewery-500 flex-shrink-0" />
                <span>{viewMember.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brewery-300">
                <Calendar className="w-4 h-4 text-brewery-500 flex-shrink-0" />
                <span>Hired {viewMember.hireDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brewery-300">
                <DollarSign className="w-4 h-4 text-brewery-500 flex-shrink-0" />
                <span>${viewMember.hourlyRate}/hr</span>
              </div>
            </div>
            {(() => {
              const isTipEligible = TIP_ELIGIBLE_ROLES.has(viewMember.role);
              const tipsThisWeek = isTipEligible && viewMember.salesThisWeek > 0
                ? Math.round(viewMember.salesThisWeek * 0.18)
                : 0;
              const tipsToday = isTipEligible
                ? Math.round((tipsThisWeek / 5) * (0.8 + (viewMember.firstName.charCodeAt(0) % 10) * 0.04))
                : 0;
              return (
                <>
                  <div className={`grid gap-3 ${isTipEligible ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    <div className="p-3 rounded-xl bg-brewery-800/40 text-center">
                      <p className="text-lg font-bold text-brewery-100">{viewMember.hoursThisWeek}h</p>
                      <p className="text-[10px] text-brewery-500 uppercase tracking-wider">This Week</p>
                    </div>
                    <div className="p-3 rounded-xl bg-brewery-800/40 text-center">
                      <p className="text-lg font-bold text-emerald-400">${(viewMember.hoursThisWeek * viewMember.hourlyRate).toFixed(0)}</p>
                      <p className="text-[10px] text-brewery-500 uppercase tracking-wider">Labor Cost</p>
                    </div>
                    {!isTipEligible && (
                      <div className="p-3 rounded-xl bg-brewery-800/40 text-center">
                        <p className="text-lg font-bold text-blue-400">{viewMember.salesThisWeek > 0 ? '$' + viewMember.salesThisWeek.toLocaleString() : '—'}</p>
                        <p className="text-[10px] text-brewery-500 uppercase tracking-wider">Sales</p>
                      </div>
                    )}
                  </div>

                  {isTipEligible && (
                    <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-700/20">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Tip Earnings</p>
                        <span className="ml-auto text-[10px] text-amber-600">18% est. avg</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <p className="text-xl font-bold text-amber-300">${tipsToday}</p>
                          <p className="text-[10px] text-amber-600 uppercase tracking-wider">Today</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-amber-300">${tipsThisWeek}</p>
                          <p className="text-[10px] text-amber-600 uppercase tracking-wider">This Week</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-blue-400">${viewMember.salesThisWeek > 0 ? viewMember.salesThisWeek.toLocaleString() : '—'}</p>
                          <p className="text-[10px] text-amber-600 uppercase tracking-wider">Sales</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-amber-700/20 flex items-center justify-between text-xs text-amber-600">
                        <span>Est. total comp this week</span>
                        <span className="font-bold text-amber-400">${(viewMember.hoursThisWeek * viewMember.hourlyRate + tipsThisWeek).toFixed(0)}</span>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
            <div className="p-3 rounded-xl bg-brewery-800/40">
              <p className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Certifications</p>
              <div className="flex gap-2 flex-wrap">
                {viewMember.tabcCertified ? <Badge variant="green">TABC Certified ✓</Badge> : viewMember.role !== 'cook' && viewMember.role !== 'dishwasher' ? <Badge variant="red">TABC Missing</Badge> : null}
                {viewMember.foodHandlerCertified ? <Badge variant="green">Food Handler ✓</Badge> : <Badge variant="gray">Food Handler —</Badge>}
                {viewMember.tabcExpiry && <span className="text-xs text-brewery-400">TABC expires: {viewMember.tabcExpiry}</span>}
              </div>
            </div>
            {viewMember.schedule && viewMember.schedule.length > 0 && (
              <div className="p-3 rounded-xl bg-brewery-800/40">
                <p className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Schedule</p>
                <div className="flex flex-wrap gap-2">
                  {viewMember.schedule.map(s => (
                    <div key={s.day} className="px-2 py-1 rounded-lg bg-amber-600/10 border border-amber-500/20">
                      <p className="text-xs font-medium text-amber-300">{s.day}</p>
                      <p className="text-[10px] text-brewery-400">{s.startTime}–{s.endTime}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add Staff Modal */}
      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title="Add Staff Member">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First Name *</label>
              <input className={inputClass} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" required />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input className={inputClass} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" required />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@beardedhop.com" />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(830) 555-1234" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Role *</label>
              <select className={inputClass} value={role} onChange={e => setRole(e.target.value as StaffMember['role'])}>
                {(['brewer', 'bartender', 'server', 'cook', 'host', 'manager', 'dishwasher'] as const).map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Hourly Rate ($)</label>
              <input className={inputClass} type="number" min="7.25" step="0.25" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="15.00" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Hire Date</label>
            <input className={inputClass} type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={tabcCertified} onChange={e => setTabcCertified(e.target.checked)} className="w-4 h-4 accent-amber-500" />
              <span className="text-sm text-brewery-300">TABC Certified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={foodHandlerCertified} onChange={e => setFoodHandlerCertified(e.target.checked)} className="w-4 h-4 accent-amber-500" />
              <span className="text-sm text-brewery-300">Food Handler Certified</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 px-4 py-2 rounded-lg border border-brewery-700/50 text-brewery-300 hover:text-brewery-100 text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-lg shadow-amber-600/20">
              Add Staff Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
