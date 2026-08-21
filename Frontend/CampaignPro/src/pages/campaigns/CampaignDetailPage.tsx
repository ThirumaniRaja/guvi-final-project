import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, CalendarClock, XCircle, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCampaign, useCampaignRecipients, useCancelCampaign, useScheduleCampaign, useSendCampaign } from '../../hooks/useCampaigns';
import { useCampaignAnalytics } from '../../hooks/useAnalytics';
import { PageSpinner } from '../../components/loaders/PageSpinner';
import { ErrorState } from '../../components/empty-states/ErrorState';
import { EmptyState } from '../../components/empty-states/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/modals/ConfirmDialog';
import { Modal } from '../../components/modals/Modal';
import { KpiCard } from '../../components/charts/KpiCard';
import { DistributionDonutChart } from '../../components/charts/DistributionDonutChart';
import { RateBar } from '../../components/charts/RateBar';
import { TableSkeleton } from '../../components/loaders/TableSkeleton';
import { formatDateTime, formatNumber } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';
import { Mail, MousePointerClick, Users2 } from 'lucide-react';

const TABS = ['Overview', 'Recipients', 'Analytics'] as const;
type Tab = (typeof TABS)[number];

const CANCELLABLE_STATUSES = ['DRAFT', 'SCHEDULED', 'SENDING'];
const SENDABLE_STATUSES = ['DRAFT'];
const SCHEDULABLE_STATUSES = ['DRAFT'];
const EDITABLE_STATUSES = ['DRAFT'];

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const campaignId = Number(id);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('Overview');
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const campaignQuery = useCampaign(campaignId);
  const recipientsQuery = useCampaignRecipients(tab === 'Recipients' ? campaignId : undefined);
  const analyticsQuery = useCampaignAnalytics(tab === 'Analytics' ? campaignId : undefined);

  const sendCampaign = useSendCampaign();
  const cancelCampaign = useCancelCampaign();
  const scheduleCampaign = useScheduleCampaign();

  if (campaignQuery.isLoading) return <PageSpinner />;
  if (campaignQuery.isError) {
    return <ErrorState message={getErrorMessage(campaignQuery.error)} onRetry={() => campaignQuery.refetch()} />;
  }

  const campaign = campaignQuery.data;
  if (!campaign) return null;

  async function handleSendNow() {
    try {
      await sendCampaign.mutateAsync(campaignId);
      toast.success('Campaign is being sent.');
      setSendConfirmOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleCancel() {
    try {
      await cancelCampaign.mutateAsync(campaignId);
      toast.success('Campaign cancelled.');
      setCancelConfirmOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleSchedule() {
    if (!scheduleDate || !scheduleTime) {
      toast.error('Please select both a date and time.');
      return;
    }
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
    if (scheduledAt.getTime() <= Date.now()) {
      toast.error('Scheduled time must be in the future.');
      return;
    }
    try {
      await scheduleCampaign.mutateAsync({ id: campaignId, payload: { scheduledAt: scheduledAt.toISOString() } });
      toast.success('Campaign scheduled successfully.');
      setScheduleOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.campaigns)}>
            <ArrowLeft size={14} /> Back to campaigns
          </button>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="page-title">{campaign.name}</h1>
            <StatusBadge status={campaign.status} />
          </div>
        </div>
        <div className="flex gap-2">
          {EDITABLE_STATUSES.includes(campaign.status) && (
            <Link to={ROUTES.campaignEdit(campaign.id)} className="btn btn-secondary">
              <Pencil size={14} /> Edit
            </Link>
          )}
          {SCHEDULABLE_STATUSES.includes(campaign.status) && (
            <button type="button" className="btn btn-secondary" onClick={() => setScheduleOpen(true)}>
              <CalendarClock size={14} /> Schedule
            </button>
          )}
          {SENDABLE_STATUSES.includes(campaign.status) && (
            <button type="button" className="btn btn-primary" onClick={() => setSendConfirmOpen(true)}>
              <Send size={14} /> Send Now
            </button>
          )}
          {CANCELLABLE_STATUSES.includes(campaign.status) && (
            <button type="button" className="btn btn-danger" onClick={() => setCancelConfirmOpen(true)}>
              <XCircle size={14} /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="tabs">
        {TABS.map((tabName) => (
          <button key={tabName} type="button" className={`tab-button ${tab === tabName ? 'active' : ''}`} onClick={() => setTab(tabName)}>
            {tabName}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="card">
          <dl className="grid-2">
            <div>
              <dt className="text-muted" style={{ fontSize: 12 }}>Template</dt>
              <dd style={{ fontWeight: 600 }}>{campaign.templateName}</dd>
            </div>
            <div>
              <dt className="text-muted" style={{ fontSize: 12 }}>Recipients</dt>
              <dd style={{ fontWeight: 600 }}>{formatNumber(campaign.recipientCount)}</dd>
            </div>
            <div>
              <dt className="text-muted" style={{ fontSize: 12 }}>Scheduled At</dt>
              <dd>{formatDateTime(campaign.scheduledAt)}</dd>
            </div>
            <div>
              <dt className="text-muted" style={{ fontSize: 12 }}>Sent At</dt>
              <dd>{formatDateTime(campaign.sentAt)}</dd>
            </div>
            <div>
              <dt className="text-muted" style={{ fontSize: 12 }}>Created</dt>
              <dd>{formatDateTime(campaign.createdAt)}</dd>
            </div>
          </dl>
        </div>
      )}

      {tab === 'Recipients' && (
        <div className="card">
          {recipientsQuery.isLoading && <TableSkeleton rows={6} columns={4} />}
          {recipientsQuery.isError && (
            <ErrorState message={getErrorMessage(recipientsQuery.error)} onRetry={() => recipientsQuery.refetch()} />
          )}
          {recipientsQuery.data && recipientsQuery.data.length === 0 && (
            <EmptyState icon={<Users2 size={26} />} title="No recipients found" description="This campaign has no recipients yet." />
          )}
          {recipientsQuery.data && recipientsQuery.data.length > 0 && (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Retries</th>
                    <th>Last Error</th>
                  </tr>
                </thead>
                <tbody>
                  {recipientsQuery.data.map((recipient) => (
                    <tr key={recipient.id}>
                      <td>{recipient.contactEmail}</td>
                      <td><StatusBadge status={recipient.status} /></td>
                      <td>{recipient.retries}</td>
                      <td>{recipient.lastError || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'Analytics' && (
        <div>
          {analyticsQuery.isLoading && <p className="text-muted">Loading analytics...</p>}
          {analyticsQuery.isError && (
            <div className="card">
              <ErrorState message={getErrorMessage(analyticsQuery.error)} onRetry={() => analyticsQuery.refetch()} />
            </div>
          )}
          {analyticsQuery.data && (
            <>
              <div className="kpi-grid">
                <KpiCard label="Total Recipients" value={formatNumber(analyticsQuery.data.totalRecipients)} icon={<Users2 size={18} />} variant="primary" />
                <KpiCard label="Sent" value={formatNumber(analyticsQuery.data.sent)} icon={<Mail size={18} />} variant="info" />
                <KpiCard label="Opened" value={formatNumber(analyticsQuery.data.opened)} icon={<Mail size={18} />} variant="success" />
                <KpiCard label="Clicked" value={formatNumber(analyticsQuery.data.clicked)} icon={<MousePointerClick size={18} />} variant="warning" />
              </div>
              <div className="grid-2">
                <div className="card">
                  <h2 className="section-title mb-4">Delivery Distribution</h2>
                  <DistributionDonutChart
                    data={[
                      { name: 'Opened', value: analyticsQuery.data.opened, color: '#16a34a' },
                      { name: 'Clicked', value: analyticsQuery.data.clicked, color: '#d97706' },
                      { name: 'Failed', value: analyticsQuery.data.failed, color: '#dc2626' },
                    ]}
                  />
                </div>
                <div className="card">
                  <h2 className="section-title mb-4">Performance Rates</h2>
                  <RateBar label="Delivery Rate" value={analyticsQuery.data.deliveryRate} color="#4f46e5" />
                  <RateBar label="Open Rate" value={analyticsQuery.data.openRate} color="#16a34a" />
                  <RateBar label="Click Rate" value={analyticsQuery.data.clickRate} color="#d97706" />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={sendConfirmOpen}
        title="Send campaign now"
        message={
          <>
            Are you sure you want to send <strong>{campaign.name}</strong> now? It will be delivered to{' '}
            {formatNumber(campaign.recipientCount)} recipient(s) using the <strong>{campaign.templateName}</strong> template.
          </>
        }
        confirmLabel="Send Now"
        loading={sendCampaign.isPending}
        onConfirm={handleSendNow}
        onCancel={() => setSendConfirmOpen(false)}
      />

      <ConfirmDialog
        open={cancelConfirmOpen}
        title="Cancel campaign"
        message={`Are you sure you want to cancel "${campaign.name}"? This action cannot be undone.`}
        confirmLabel="Cancel Campaign"
        variant="danger"
        loading={cancelCampaign.isPending}
        onConfirm={handleCancel}
        onCancel={() => setCancelConfirmOpen(false)}
      />

      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule Campaign"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setScheduleOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSchedule} disabled={scheduleCampaign.isPending}>
              {scheduleCampaign.isPending && <span className="spinner" />}
              Schedule
            </button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="detailScheduleDate">Date</label>
            <input id="detailScheduleDate" type="date" className="form-input" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="detailScheduleTime">Time</label>
            <input id="detailScheduleTime" type="time" className="form-input" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
