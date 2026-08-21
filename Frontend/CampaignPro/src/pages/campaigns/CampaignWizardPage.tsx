import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Send, CalendarClock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateCampaign, useScheduleCampaign, useSendCampaign } from '../../hooks/useCampaigns';
import { useTemplates } from '../../hooks/useTemplates';
import { useContacts } from '../../hooks/useContacts';
import { useContactGroups } from '../../hooks/useContactGroups';
import { SearchInput } from '../../components/common/SearchInput';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';

const STEPS = ['Campaign Details', 'Select Template', 'Select Audience', 'Review & Send'];

export function CampaignWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const templatesQuery = useTemplates({ page: 0, size: 50, sort: ['name,asc'] });
  const contactsQuery = useContacts({ query: contactSearch || undefined, page: 0, size: 20, sort: ['email,asc'] });
  const groupsQuery = useContactGroups();

  const createCampaign = useCreateCampaign();
  const scheduleCampaign = useScheduleCampaign();
  const sendCampaign = useSendCampaign();

  const selectedTemplate = useMemo(
    () => templatesQuery.data?.content.find((t) => t.id === templateId),
    [templatesQuery.data, templateId],
  );

  const selectedGroups = useMemo(
    () => groupsQuery.data?.filter((g) => selectedGroupIds.includes(g.id)) ?? [],
    [groupsQuery.data, selectedGroupIds],
  );

  const estimatedRecipients =
    selectedContactIds.length + selectedGroups.reduce((sum, group) => sum + group.memberCount, 0);

  function toggleContact(id: number) {
    setSelectedContactIds((prev) => (prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]));
  }

  function toggleGroup(id: number) {
    setSelectedGroupIds((prev) => (prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]));
  }

  function canProceed(): boolean {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return templateId !== null;
    if (step === 2) return selectedContactIds.length > 0 || selectedGroupIds.length > 0;
    return true;
  }

  async function createDraftCampaign(): Promise<number> {
    const campaign = await createCampaign.mutateAsync({
      name: name.trim(),
      templateId: templateId as number,
      contactIds: selectedContactIds.length > 0 ? selectedContactIds : undefined,
      groupIds: selectedGroupIds.length > 0 ? selectedGroupIds : undefined,
    });
    return campaign.id;
  }

  async function handleSaveDraft() {
    try {
      await createDraftCampaign();
      toast.success('Campaign saved as draft.');
      navigate(ROUTES.campaigns);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleSendNow() {
    try {
      const id = await createDraftCampaign();
      await sendCampaign.mutateAsync(id);
      toast.success('Campaign is being sent.');
      navigate(ROUTES.campaignDetail(id));
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
      const id = await createDraftCampaign();
      await scheduleCampaign.mutateAsync({ id, payload: { scheduledAt: scheduledAt.toISOString() } });
      toast.success('Campaign scheduled successfully.');
      navigate(ROUTES.campaignDetail(id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const isBusy = createCampaign.isPending || scheduleCampaign.isPending || sendCampaign.isPending;

  return (
    <div>
      <div className="page-header">
        <div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.campaigns)}>
            <ArrowLeft size={14} /> Back to campaigns
          </button>
          <h1 className="page-title mt-2">Create Campaign</h1>
        </div>
      </div>

      <div className="stepper">
        {STEPS.map((label, index) => (
          <div key={label} className="flex items-center">
            <div className={`stepper-step ${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`}>
              <span className="stepper-circle">{index < step ? <Check size={14} /> : index + 1}</span>
              <span className="stepper-label">{label}</span>
            </div>
            {index < STEPS.length - 1 && <div className="stepper-connector" />}
          </div>
        ))}
      </div>

      <div className="card">
        {step === 0 && (
          <div style={{ maxWidth: 480 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="campaignName">
                Campaign name <span className="text-danger">*</span>
              </label>
              <input
                id="campaignName"
                className="form-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Summer Sale Announcement"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="section-title mb-4">Choose an email template</h2>
            {templatesQuery.isLoading && <p className="text-muted">Loading templates...</p>}
            {templatesQuery.data?.content.length === 0 && (
              <p className="text-muted">No templates available. Create a template first.</p>
            )}
            <div className="template-grid">
              {templatesQuery.data?.content.map((template) => (
                <div
                  key={template.id}
                  className={`template-card ${templateId === template.id ? 'selected' : ''}`}
                  style={{ cursor: 'pointer', borderColor: templateId === template.id ? 'var(--color-primary)' : undefined }}
                  onClick={() => setTemplateId(template.id)}
                >
                  <div className="template-card-preview">
                    <iframe title={template.name} srcDoc={template.htmlBody} sandbox="" />
                  </div>
                  <div className="template-card-body">
                    <div className="flex items-center justify-between">
                      <span style={{ fontWeight: 700 }}>{template.name}</span>
                      {templateId === template.id && <Check size={16} color="var(--color-primary)" />}
                    </div>
                    <span className="text-muted" style={{ fontSize: 13 }}>
                      {template.subject}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid-2">
            <div>
              <h2 className="section-title mb-4">Contact Groups</h2>
              {groupsQuery.data?.length === 0 && <p className="text-muted">No contact groups available.</p>}
              {groupsQuery.data?.map((group) => (
                <label key={group.id} className={`audience-option ${selectedGroupIds.includes(group.id) ? 'selected' : ''}`}>
                  <span>
                    <strong>{group.name}</strong>
                    <br />
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      {group.memberCount} member{group.memberCount === 1 ? '' : 's'}
                    </span>
                  </span>
                  <input type="checkbox" checked={selectedGroupIds.includes(group.id)} onChange={() => toggleGroup(group.id)} />
                </label>
              ))}
            </div>
            <div>
              <h2 className="section-title mb-4">Individual Contacts</h2>
              <SearchInput value={contactSearch} onChange={setContactSearch} placeholder="Search contacts..." />
              <div className="mt-4" style={{ maxHeight: 320, overflowY: 'auto' }}>
                {contactsQuery.data?.content.map((contact) => (
                  <label key={contact.id} className={`audience-option ${selectedContactIds.includes(contact.id) ? 'selected' : ''}`}>
                    <span>
                      <strong>{[contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email}</strong>
                      <br />
                      <span className="text-muted" style={{ fontSize: 12 }}>
                        {contact.email}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedContactIds.includes(contact.id)}
                      onChange={() => toggleContact(contact.id)}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="section-title mb-4">Review your campaign</h2>
            <dl className="grid-2 mb-4">
              <div>
                <dt className="text-muted" style={{ fontSize: 12 }}>Campaign Name</dt>
                <dd style={{ fontWeight: 600 }}>{name}</dd>
              </div>
              <div>
                <dt className="text-muted" style={{ fontSize: 12 }}>Template</dt>
                <dd style={{ fontWeight: 600 }}>{selectedTemplate?.name}</dd>
              </div>
              <div>
                <dt className="text-muted" style={{ fontSize: 12 }}>Contact Groups</dt>
                <dd>{selectedGroups.map((g) => g.name).join(', ') || 'None'}</dd>
              </div>
              <div>
                <dt className="text-muted" style={{ fontSize: 12 }}>Individual Contacts</dt>
                <dd>{selectedContactIds.length}</dd>
              </div>
              <div>
                <dt className="text-muted" style={{ fontSize: 12 }}>Estimated Recipients</dt>
                <dd style={{ fontWeight: 600 }}>{estimatedRecipients}</dd>
              </div>
            </dl>

            <div className="card" style={{ backgroundColor: 'var(--color-background)' }}>
              <h3 className="section-title mb-4">Schedule for later (optional)</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="scheduleDate">Date</label>
                  <input id="scheduleDate" type="date" className="form-input" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="scheduleTime">Time</label>
                  <input id="scheduleTime" type="time" className="form-input" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                </div>
              </div>
              <button type="button" className="btn btn-secondary" onClick={handleSchedule} disabled={isBusy || !scheduleDate || !scheduleTime}>
                {scheduleCampaign.isPending && <span className="spinner" />}
                <CalendarClock size={16} /> Schedule Campaign
              </button>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" className="btn btn-secondary" onClick={handleSaveDraft} disabled={isBusy}>
                {createCampaign.isPending && <span className="spinner" />}
                <Save size={16} /> Save as Draft
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSendNow} disabled={isBusy}>
                {sendCampaign.isPending && <span className="spinner" />}
                <Send size={16} /> Send Now
              </button>
            </div>
          </div>
        )}
      </div>

      {step < 3 && (
        <div className="flex justify-between mt-4">
          <button type="button" className="btn btn-secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft size={14} /> Back
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canProceed()}>
            Next <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
