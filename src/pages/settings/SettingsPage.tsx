import { useState } from 'react';
import { Settings, Shield, Bell, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { complianceItems } from '../../data/mockData';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'compliance' | 'integrations' | 'notifications'>('general');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-brewery-700/30">
        {([
          { key: 'general' as const, label: 'General', icon: Settings },
          { key: 'compliance' as const, label: 'Compliance', icon: Shield },
          { key: 'integrations' as const, label: 'Integrations', icon: Database },
          { key: 'notifications' as const, label: 'Notifications', icon: Bell },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab.key ? 'text-amber-400 border-amber-400' : 'text-brewery-400 border-transparent hover:text-brewery-200'}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4">Business Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-brewery-400 mb-1">Business Name</label>
                <input type="text" defaultValue="Bearded Hop Brewery" className="w-full bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-brewery-400 mb-1">Address</label>
                <input type="text" defaultValue="123 Main Street, Bulverde, TX 78163" className="w-full bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brewery-400 mb-1">Phone</label>
                  <input type="text" defaultValue="(830) 555-BREW" className="w-full bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brewery-400 mb-1">Email</label>
                  <input type="text" defaultValue="hello@beardedhopbrewery.com" className="w-full bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brewery-400 mb-1">Tax Rate</label>
                  <input type="text" defaultValue="8.25%" className="w-full bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brewery-400 mb-1">Timezone</label>
                  <input type="text" defaultValue="America/Chicago (CST)" className="w-full bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
              </div>
              <button className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-lg shadow-amber-600/20">Save Changes</button>
            </div>
          </div>

          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4">License Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-brewery-800/30">
                <div><p className="text-sm text-brewery-200">TABC Brewpub License (BP)</p><p className="text-[10px] text-brewery-400">License #BP-12345</p></div>
                <Badge variant="green">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-brewery-800/30">
                <div><p className="text-sm text-brewery-200">Mixed Beverage Permit (MB)</p><p className="text-[10px] text-brewery-400">Permit #MB-67890</p></div>
                <Badge variant="green">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-brewery-800/30">
                <div><p className="text-sm text-brewery-200">Food & Beverage Certificate (FB)</p><p className="text-[10px] text-brewery-400">Cert #FB-11223</p></div>
                <Badge variant="green">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-brewery-800/30">
                <div><p className="text-sm text-brewery-200">TTB Brewer's Notice</p><p className="text-[10px] text-brewery-400">Notice #BN-44556</p></div>
                <Badge variant="green">Active</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-brewery-700/30">
              <h3 className="text-sm font-semibold text-brewery-200">Compliance Dashboard</h3>
            </div>
            <div className="divide-y divide-brewery-700/20">
              {complianceItems.map(item => (
                <div key={item.id} className="flex items-center justify-between px-5 py-4 hover:bg-brewery-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    {item.status === 'compliant' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
                    <div>
                      <p className="text-sm font-medium text-brewery-100">{item.name}</p>
                      <p className="text-xs text-brewery-400">{item.notes}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-brewery-400">Due: {item.dueDate}</span>
                    <Badge variant={item.status === 'compliant' ? 'green' : item.status === 'due-soon' ? 'amber' : 'red'}>{item.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Untappd for Business', desc: 'Live tap list, checkins, and ratings', status: 'connected', icon: '🍺' },
            { name: 'QuickBooks Online', desc: 'Accounting, invoicing, and payroll', status: 'connected', icon: '📊' },
            { name: 'Clover POS', desc: 'Point of sale, tab management', status: 'connected', icon: '💳' },
            { name: 'BarTrack', desc: 'Real-time keg level monitoring', status: 'connected', icon: '📡' },
            { name: 'Taplist.io', desc: 'Digital tap list displays', status: 'connected', icon: '📺' },
            { name: 'ASCAP / BMI', desc: 'Music performance licensing', status: 'active', icon: '🎵' },
            { name: 'Eventbrite', desc: 'Event ticketing and RSVPs', status: 'setup-needed', icon: '🎟️' },
            { name: 'RingCentral', desc: 'SMS marketing and communications', status: 'setup-needed', icon: '📱' },
            { name: 'Google Analytics', desc: 'Website analytics and tracking', status: 'setup-needed', icon: '📈' },
            { name: 'Shopify', desc: 'Online merchandise store', status: 'not-connected', icon: '🛒' },
          ].map(integration => (
            <div key={integration.name} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 hover:border-amber-500/20 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-brewery-100">{integration.name}</h3>
                    <p className="text-xs text-brewery-400">{integration.desc}</p>
                  </div>
                </div>
                <Badge variant={integration.status === 'connected' || integration.status === 'active' ? 'green' : integration.status === 'setup-needed' ? 'amber' : 'gray'}>
                  {integration.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4">Alert Preferences</h3>
            <div className="space-y-4">
              {[
                { label: 'Low keg alerts', desc: 'Notify when a keg drops below 15%', enabled: true },
                { label: 'Inventory reorder alerts', desc: 'Notify when items hit reorder point', enabled: true },
                { label: 'Compliance due dates', desc: 'Reminder 14 days before due', enabled: true },
                { label: 'New reservation notifications', desc: 'Push notification for each new reservation', enabled: false },
                { label: 'Daily sales summary', desc: 'End-of-day revenue report at 11pm', enabled: true },
                { label: 'TABC revenue split alert', desc: 'Alert if beer exceeds 55% of revenue', enabled: true },
                { label: 'Staff overtime alert', desc: 'Alert when staff approaches 40 hours', enabled: true },
              ].map(pref => (
                <div key={pref.label} className="flex items-center justify-between p-3 rounded-lg bg-brewery-800/30">
                  <div>
                    <p className="text-sm text-brewery-200">{pref.label}</p>
                    <p className="text-xs text-brewery-400">{pref.desc}</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer flex items-center ${pref.enabled ? 'bg-amber-600 justify-end' : 'bg-brewery-700 justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full mx-1 shadow" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
