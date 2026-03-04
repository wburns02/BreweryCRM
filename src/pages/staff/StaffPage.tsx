import { useState } from 'react';
import { UserCog, Clock, DollarSign, ShieldCheck } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { staff } from '../../data/mockData';

const roleColors: Record<string, 'amber' | 'green' | 'blue' | 'purple' | 'red' | 'gray'> = {
  brewer: 'amber', bartender: 'purple', server: 'green', cook: 'red', host: 'blue', manager: 'blue', dishwasher: 'gray',
};

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<'team' | 'schedule' | 'compliance'>('team');
  const totalHours = staff.reduce((s, m) => s + m.hoursThisWeek, 0);
  const totalLabor = staff.reduce((s, m) => s + (m.hoursThisWeek * m.hourlyRate), 0);
  const certIssues = staff.filter(s => !s.tabcCertified && s.role !== 'cook' && s.role !== 'dishwasher');

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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brewery-700/30">
        {(['team', 'schedule', 'compliance'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab ? 'text-amber-400 border-amber-400' : 'text-brewery-400 border-transparent hover:text-brewery-200'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {staff.map(member => (
            <div key={member.id} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 hover:border-amber-500/20 transition-all">
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
                <Badge variant={member.status === 'active' ? 'green' : 'gray'}>{member.status}</Badge>
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
                  <p className="text-xs font-bold text-brewery-200">${member.salesThisWeek > 0 ? member.salesThisWeek.toLocaleString() : '—'}</p>
                  <p className="text-[10px] text-brewery-500">Sales</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {member.tabcCertified ? <Badge variant="green">TABC ✓</Badge> : member.role !== 'cook' && member.role !== 'dishwasher' ? <Badge variant="red">TABC ✗</Badge> : null}
                {member.foodHandlerCertified && <Badge variant="green">Food Handler ✓</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
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
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-brewery-700/30">
              <h3 className="text-sm font-semibold text-brewery-200">Certification Tracker</h3>
            </div>
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
          </div>
        </div>
      )}
    </div>
  );
}
