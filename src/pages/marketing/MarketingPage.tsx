import { useState } from 'react';
import { Mail, MousePointer, Eye, Send, Clock, FileText, Plus, Calendar, X } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';
import { useBrewery } from '../../context/BreweryContext';
import { useToast } from '../../components/ui/ToastProvider';

const statusColors: Record<string, 'green' | 'amber' | 'blue' | 'gray' | 'red'> = {
  sent: 'green', scheduled: 'blue', draft: 'gray', cancelled: 'red',
};
const typeIcons: Record<string, string> = {
  'new-release': '\u{1F37A}', event: '\u{1F389}', promotion: '\u{1F381}', newsletter: '\u{1F4F0}', 'mug-club': '\u{1F451}', birthday: '\u{1F382}',
};

const campaignTypes = [
  { value: 'new-release', label: 'New Release' },
  { value: 'event', label: 'Event' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'mug-club', label: 'Mug Club' },
  { value: 'birthday', label: 'Birthday' },
] as const;

export default function MarketingPage() {
  const { emailCampaigns, addCampaign, updateCampaign } = useBrewery();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleCampaignId, setScheduleCampaignId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<'new-release' | 'event' | 'promotion' | 'newsletter' | 'mug-club' | 'birthday'>('newsletter');
  const [segment, setSegment] = useState('');

  const sent = emailCampaigns.filter(c => c.status === 'sent');
  const totalSent = sent.reduce((s, c) => s + c.recipients, 0);
  const totalOpened = sent.reduce((s, c) => s + c.opened, 0);
  const totalClicked = sent.reduce((s, c) => s + c.clicked, 0);
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0;

  const handleSendNow = (id: string, name: string) => {
    const recipientCount = Math.floor(Math.random() * 400) + 800;
    updateCampaign(id, {
      status: 'sent',
      sentDate: new Date().toISOString().split('T')[0],
      recipients: recipientCount,
      opened: Math.floor(recipientCount * (0.28 + Math.random() * 0.15)),
      clicked: Math.floor(recipientCount * (0.06 + Math.random() * 0.08)),
      unsubscribed: Math.floor(recipientCount * 0.005),
    });
    toast('success', `Campaign "${name}" sent to ${recipientCount.toLocaleString()} recipients`);
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate) return;
    const campaign = emailCampaigns.find(c => c.id === scheduleCampaignId);
    if (!campaign) return;
    updateCampaign(scheduleCampaignId, {
      status: 'scheduled',
      scheduledDate: scheduleDate,
      recipients: Math.floor(Math.random() * 400) + 800,
    });
    toast('success', `Campaign scheduled for ${new Date(scheduleDate).toLocaleDateString()}`);
    setShowScheduleModal(false);
    setScheduleDate('');
  };

  const handleCancelScheduled = (id: string, name: string) => {
    updateCampaign(id, { status: 'draft', scheduledDate: undefined });
    toast('success', `Campaign "${name}" returned to drafts`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;

    addCampaign({
      name: name.trim(),
      subject: subject.trim(),
      body: body.trim(),
      type,
      segment: segment.trim() || 'All Subscribers',
      status: 'draft',
      recipients: 0,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
    });

    toast('success', `Campaign "${name}" created as draft`);
    setShowAddModal(false);
    setName('');
    setSubject('');
    setBody('');
    setType('newsletter');
    setSegment('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Campaigns Sent" value={sent.length} icon={Send} iconBg="bg-emerald-600/20" iconColor="text-emerald-400" />
        <StatCard title="Total Recipients" value={totalSent.toLocaleString()} icon={Mail} iconBg="bg-blue-600/20" iconColor="text-blue-400" />
        <StatCard title="Open Rate" value={`${openRate}%`} icon={Eye} iconBg="bg-amber-600/20" iconColor="text-amber-400" />
        <StatCard title="Click Rate" value={`${clickRate}%`} icon={MousePointer} iconBg="bg-purple-600/20" iconColor="text-purple-400" />
      </div>

      {/* Campaign List */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-brewery-200">Email Campaigns</h3>
        <button onClick={() => setShowAddModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-amber-600/20">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      <div className="space-y-3">
        {emailCampaigns.map(campaign => (
          <div key={campaign.id} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 hover:border-amber-500/20 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{typeIcons[campaign.type]}</span>
                <div>
                  <h3 className="text-sm font-semibold text-brewery-100">{campaign.name}</h3>
                  <p className="text-xs text-brewery-400">{campaign.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <Badge variant={statusColors[campaign.status]}>{campaign.status}</Badge>
                <Badge variant="gray">{campaign.segment}</Badge>
              </div>
            </div>
            {(campaign as { body?: string }).body && (
              <p className="text-xs text-brewery-500 italic mb-3 border-l-2 border-brewery-700/50 pl-3 line-clamp-2">
                {(campaign as { body?: string }).body}
              </p>
            )}

            {campaign.status === 'sent' && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-2 rounded-lg bg-brewery-800/30 text-center">
                  <p className="text-xs font-bold text-blue-400">{campaign.recipients}</p>
                  <p className="text-[10px] text-brewery-500">Sent</p>
                </div>
                <div className="p-2 rounded-lg bg-brewery-800/30 text-center">
                  <p className="text-xs font-bold text-emerald-400">{campaign.opened}</p>
                  <p className="text-[10px] text-brewery-500">Opened ({totalSent > 0 ? Math.round((campaign.opened / campaign.recipients) * 100) : 0}%)</p>
                </div>
                <div className="p-2 rounded-lg bg-brewery-800/30 text-center">
                  <p className="text-xs font-bold text-amber-400">{campaign.clicked}</p>
                  <p className="text-[10px] text-brewery-500">Clicked</p>
                </div>
                <div className="p-2 rounded-lg bg-brewery-800/30 text-center">
                  <p className="text-xs font-bold text-red-400">{campaign.unsubscribed}</p>
                  <p className="text-[10px] text-brewery-500">Unsubscribed</p>
                </div>
                <div className="p-2 rounded-lg bg-brewery-800/30 text-center">
                  <p className="text-xs font-bold text-brewery-200">{campaign.sentDate}</p>
                  <p className="text-[10px] text-brewery-500">Sent Date</p>
                </div>
              </div>
            )}
            {campaign.status === 'scheduled' && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-900/20 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-300">Scheduled for {campaign.scheduledDate} · {campaign.recipients?.toLocaleString()} recipients</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendNow(campaign.id, campaign.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold transition-all"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Now
                  </button>
                  <button
                    onClick={() => handleCancelScheduled(campaign.id, campaign.name)}
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-brewery-800/40 hover:bg-red-900/20 border border-brewery-700/30 hover:border-red-500/30 text-brewery-400 hover:text-red-300 rounded-lg text-xs transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            {campaign.status === 'draft' && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-brewery-800/30">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brewery-400" />
                  <span className="text-xs text-brewery-400">{campaign.recipients} potential recipients · Ready to schedule</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setScheduleCampaignId(campaign.id); setShowScheduleModal(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-semibold transition-all"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Schedule
                  </button>
                  <button
                    onClick={() => handleSendNow(campaign.id, campaign.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold transition-all"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Now
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      <Modal open={showScheduleModal} onClose={() => { setShowScheduleModal(false); setScheduleDate(''); }} title="Schedule Campaign" size="sm">
        <form onSubmit={handleSchedule} className="space-y-4">
          <p className="text-sm text-brewery-300">Choose when to send this campaign:</p>
          <div>
            <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Send Date *</label>
            <input
              type="date"
              value={scheduleDate}
              onChange={e => setScheduleDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowScheduleModal(false); setScheduleDate(''); }} className="px-4 py-2 text-sm font-medium text-brewery-300 hover:text-brewery-100 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* New Campaign Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="New Email Campaign">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Campaign Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="e.g. Summer Seasonal Launch"
              className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Subject Line *</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required
              placeholder="e.g. New Summer Ales Are Here!"
              className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Campaign Type</label>
              <select value={type} onChange={e => setType(e.target.value as typeof type)}
                className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30">
                {campaignTypes.map(ct => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Segment</label>
              <input type="text" value={segment} onChange={e => setSegment(e.target.value)}
                placeholder="All Subscribers"
                className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Email Body</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              placeholder="Write your email content here. Include your message, offers, links, and a call to action..."
              className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 resize-none"
            />
            <p className="text-[10px] text-brewery-500 mt-1">{body.length} characters · {Math.ceil(body.length / 600)} min read</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm font-medium text-brewery-300 hover:text-brewery-100 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow-lg shadow-amber-600/20 transition-colors">
              Create Campaign
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
