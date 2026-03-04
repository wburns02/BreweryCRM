import { Mail, MousePointer, Eye, Send, Clock, FileText, Plus } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import { emailCampaigns } from '../../data/mockData';

const statusColors: Record<string, 'green' | 'amber' | 'blue' | 'gray' | 'red'> = {
  sent: 'green', scheduled: 'blue', draft: 'gray', cancelled: 'red',
};
const typeIcons: Record<string, string> = {
  'new-release': '🍺', event: '🎉', promotion: '🎁', newsletter: '📰', 'mug-club': '👑', birthday: '🎂',
};

export default function MarketingPage() {
  const sent = emailCampaigns.filter(c => c.status === 'sent');
  const totalSent = sent.reduce((s, c) => s + c.recipients, 0);
  const totalOpened = sent.reduce((s, c) => s + c.opened, 0);
  const totalClicked = sent.reduce((s, c) => s + c.clicked, 0);
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0;

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
        <button className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-amber-600/20">
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
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-900/20 border border-blue-500/20">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-300">Scheduled for {campaign.scheduledDate} · {campaign.recipients} recipients</span>
              </div>
            )}
            {campaign.status === 'draft' && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-brewery-800/30">
                <FileText className="w-4 h-4 text-brewery-400" />
                <span className="text-xs text-brewery-400">{campaign.recipients} potential recipients · Ready to schedule</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
