import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAddGroupMembers, useContactGroups, useRemoveGroupMember } from '../../hooks/useContactGroups';
import { useContacts } from '../../hooks/useContacts';
import { Modal } from '../../components/modals/Modal';
import { SearchInput } from '../../components/common/SearchInput';
import { PageSpinner } from '../../components/loaders/PageSpinner';
import { formatDate, formatNumber } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';

export function ContactGroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const groupId = Number(id);
  const navigate = useNavigate();

  const groupsQuery = useContactGroups();
  const group = useMemo(() => groupsQuery.data?.find((item) => item.id === groupId), [groupsQuery.data, groupId]);

  const [addOpen, setAddOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const contactsQuery = useContacts({ query: query || undefined, page: 0, size: 20, sort: ['email,asc'] });
  const addMembers = useAddGroupMembers();
  const removeMember = useRemoveGroupMember();

  if (groupsQuery.isLoading) return <PageSpinner />;

  if (!group) {
    return (
      <div className="card">
        <p>Contact group not found.</p>
        <button type="button" className="btn btn-secondary mt-4" onClick={() => navigate(ROUTES.contactGroups)}>
          Back to groups
        </button>
      </div>
    );
  }

  function toggleSelected(contactId: number) {
    setSelectedIds((prev) => (prev.includes(contactId) ? prev.filter((cid) => cid !== contactId) : [...prev, contactId]));
  }

  async function handleAddMembers() {
    if (selectedIds.length === 0) return;
    try {
      await addMembers.mutateAsync({ id: groupId, payload: { contactIds: selectedIds } });
      toast.success('Members added to group.');
      setSelectedIds([]);
      setAddOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleRemoveMember(contactId: number) {
    try {
      await removeMember.mutateAsync({ id: groupId, contactId });
      toast.success('Member removed from group.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.contactGroups)}>
            <ArrowLeft size={14} /> Back to groups
          </button>
          <h1 className="page-title mt-2">{group.name}</h1>
          <p className="page-subtitle">{group.description || 'No description provided.'}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => setRemoveOpen(true)}>
            <UserMinus size={14} /> Remove Member
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Add Members
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-card-label">Total Members</span>
          <div className="kpi-card-value">{formatNumber(group.memberCount)}</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-card-label">Created</span>
          <div className="kpi-card-value" style={{ fontSize: 18 }}>
            {formatDate(group.createdAt)}
          </div>
        </div>
      </div>

      <div className="card">
        <p className="text-muted" style={{ fontSize: 13 }}>
          The API only exposes the total member count for a group, not the individual member list. Use the actions
          above to add or remove members by searching your contacts.
        </p>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Members"
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={selectedIds.length === 0 || addMembers.isPending}
              onClick={handleAddMembers}
            >
              {addMembers.isPending && <span className="spinner" />}
              Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ''}Contact{selectedIds.length === 1 ? '' : 's'}
            </button>
          </>
        }
      >
        <SearchInput value={query} onChange={setQuery} placeholder="Search contacts by name or email..." />
        <div className="mt-4" style={{ maxHeight: 320, overflowY: 'auto' }}>
          {contactsQuery.isLoading && <p className="text-muted">Loading contacts...</p>}
          {contactsQuery.data?.content.length === 0 && <p className="text-muted">No contacts found.</p>}
          {contactsQuery.data?.content.map((contact) => (
            <label key={contact.id} className={`audience-option ${selectedIds.includes(contact.id) ? 'selected' : ''}`}>
              <span>
                <strong>{[contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email}</strong>
                <br />
                <span className="text-muted" style={{ fontSize: 12 }}>
                  {contact.email}
                </span>
              </span>
              <input
                type="checkbox"
                checked={selectedIds.includes(contact.id)}
                onChange={() => toggleSelected(contact.id)}
              />
            </label>
          ))}
        </div>
      </Modal>

      <Modal open={removeOpen} onClose={() => setRemoveOpen(false)} title="Remove Member" size="lg">
        <SearchInput value={query} onChange={setQuery} placeholder="Search contacts by name or email..." />
        <div className="mt-4" style={{ maxHeight: 320, overflowY: 'auto' }}>
          {contactsQuery.data?.content.map((contact) => (
            <div key={contact.id} className="audience-option">
              <span>
                <strong>{[contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email}</strong>
                <br />
                <span className="text-muted" style={{ fontSize: 12 }}>
                  {contact.email}
                </span>
              </span>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={removeMember.isPending}
                onClick={() => handleRemoveMember(contact.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
