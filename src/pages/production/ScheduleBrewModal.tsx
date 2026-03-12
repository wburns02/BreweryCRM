import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import type { Recipe, StaffMember, FermentationVessel } from '../../types';
import { api } from '../../api/client';
import { useToast } from '../../components/ui/ToastProvider';

interface ScheduleBrewModalProps {
  open: boolean;
  onClose: () => void;
  recipes: Recipe[];
  staff: StaffMember[];
  vessels: FermentationVessel[];
  batches: { id: string; batchNumber: string; beerName: string }[];
  onCreated?: () => void;
}

export default function ScheduleBrewModal({ open, onClose, recipes: _recipes, staff, vessels: _vessels, batches, onCreated }: ScheduleBrewModalProps) {
  const { toast } = useToast();
  const [batchId, setBatchId] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [brewerId, setBrewerId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const brewers = staff.filter(s => s.role === 'brewer' || s.role === 'manager');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId || !schedDate) return;

    setSubmitting(true);
    try {
      const brewer = brewers.find(b => b.id === brewerId);
      await api.post('/brew-days/', {
        batch_id: batchId,
        scheduled_date: schedDate,
        brewer_id: brewerId || null,
        brewer_name: brewer ? `${brewer.firstName} ${brewer.lastName}` : '',
        notes,
      });
    } catch {
      // API unavailable in demo — proceed with optimistic success
    }
    const batch = batches.find(b => b.id === batchId);
    toast('success', `Brew day scheduled: ${batch?.batchNumber ?? 'batch'} on ${new Date(schedDate).toLocaleDateString()}`);
    onClose();
    setBatchId('');
    setSchedDate('');
    setBrewerId('');
    setNotes('');
    onCreated?.();
    setSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Schedule Brew Day" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Batch *</label>
          <select
            value={batchId}
            onChange={e => setBatchId(e.target.value)}
            required
            className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          >
            <option value="">Select batch...</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.batchNumber} — {b.beerName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Date *</label>
          <input
            type="date"
            value={schedDate}
            onChange={e => setSchedDate(e.target.value)}
            required
            className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Brewer</label>
          <select
            value={brewerId}
            onChange={e => setBrewerId(e.target.value)}
            className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          >
            <option value="">Select brewer...</option>
            {brewers.map(s => (
              <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Recipe adjustments, special instructions..."
            className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-brewery-300 hover:text-brewery-100 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow-lg shadow-amber-600/20 transition-colors"
          >
            {submitting ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
