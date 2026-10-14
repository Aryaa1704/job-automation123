import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Plus,
  Building,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter
} from 'lucide-react';
import { Job, RecruiterContact } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface RecruiterCrmViewProps {
  contacts: RecruiterContact[];
  jobs: Job[];
  onAddContact: (contact: Omit<RecruiterContact, 'id' | 'createdAt'>) => void;
}

export const RecruiterCrmView: React.FC<RecruiterCrmViewProps> = ({
  contacts,
  jobs,
  onAddContact
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'unverified'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newContact, setNewContact] = useState({
    companyName: '',
    fullName: '',
    roleTitle: '',
    workEmail: '',
    profileUrl: '',
    sourceUrl: '',
    sourceType: 'Company Directory' as RecruiterContact['sourceType'],
    verificationStatus: 'verified' as RecruiterContact['verificationStatus'],
    relatedJobId: jobs.length > 0 ? jobs[0].id : ''
  });

  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  const filteredContacts = contacts.filter((c) => {
    if (filterStatus !== 'all' && c.verificationStatus !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.roleTitle.toLowerCase().includes(q) ||
        (c.workEmail && c.workEmail.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Policy Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="font-semibold text-slate-900">Lawful Recruiter Sourcing Policy</h3>
          <p className="text-slate-600 mt-0.5">
            Contact information must carry verifiable provenance. Inferred or guessed emails are flagged as unverified and blocked from bulk outreach according to Section 7.8.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Recruiter Contact</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contacts by name, role, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium text-[11px]">Verification:</span>
          {(['all', 'verified', 'unverified'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                filterStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'all' ? 'All' : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/50">
              <th className="py-2.5 px-3">Contact Name & Title</th>
              <th className="py-2.5 px-3">Company</th>
              <th className="py-2.5 px-3">Email & Verification</th>
              <th className="py-2.5 px-3">Provenance Source</th>
              <th className="py-2.5 px-3">Target Opportunity</th>
              <th className="py-2.5 px-3 text-right">Links</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContacts.map((contact) => {
              const job = contact.relatedJobId ? jobMap.get(contact.relatedJobId) : null;
              return (
                <tr key={contact.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{contact.fullName}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{contact.roleTitle}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">{contact.companyName}</td>
                  <td className="py-3 px-3">
                    {contact.workEmail ? (
                      <div className="space-y-0.5">
                        <div className="font-mono text-[11px] text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{contact.workEmail}</span>
                        </div>
                        {contact.verificationStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Corporate Domain
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-medium">
                            <ShieldAlert className="w-3 h-3" />
                            Unverified - Restricted from bulk actions
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Not provided</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <div className="text-[11px] font-mono">{contact.sourceType}</div>
                    <a
                      href={contact.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-blue-600 text-[10px] truncate max-w-[140px] block"
                    >
                      {contact.sourceUrl}
                    </a>
                  </td>
                  <td className="py-3 px-3">
                    {job ? (
                      <span className="text-slate-800 text-[11px] font-medium">{job.title}</span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">General recruiter</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {contact.profileUrl && (
                      <a
                        href={contact.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-slate-600 hover:bg-slate-100 rounded border border-slate-200 text-xs"
                      >
                        <span>Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Recruiter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-slate-900">Add Lawful Recruiter Contact</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. David Miller"
                  value={newContact.fullName}
                  onChange={(e) => setNewContact({ ...newContact, fullName: e.target.value })}
                  className="w-full border rounded p-1.5"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Role / Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Technical Recruiter"
                  value={newContact.roleTitle}
                  onChange={(e) => setNewContact({ ...newContact, roleTitle: e.target.value })}
                  className="w-full border rounded p-1.5"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Datadog"
                  value={newContact.companyName}
                  onChange={(e) => setNewContact({ ...newContact, companyName: e.target.value })}
                  className="w-full border rounded p-1.5"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Work Email (Lawfully Obtained)</label>
                <input
                  type="email"
                  placeholder="e.g. dmiller@datadoghq.com"
                  value={newContact.workEmail}
                  onChange={(e) => setNewContact({ ...newContact, workEmail: e.target.value })}
                  className="w-full border rounded p-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Provenance / Sourcing Method</label>
                <select
                  value={newContact.sourceType}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      sourceType: e.target.value as RecruiterContact['sourceType']
                    })
                  }
                  className="w-full border rounded p-1.5 bg-slate-50"
                >
                  <option value="Company Directory">Company Directory</option>
                  <option value="LinkedIn Public Profile">LinkedIn Public Profile</option>
                  <option value="Job Description Header">Job Description Header</option>
                  <option value="Direct Communication">Direct Communication</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Source Evidence URL</label>
                <input
                  type="url"
                  placeholder="e.g. https://careers.datadoghq.com"
                  value={newContact.sourceUrl}
                  onChange={(e) => setNewContact({ ...newContact, sourceUrl: e.target.value })}
                  className="w-full border rounded p-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Verification Status</label>
                <select
                  value={newContact.verificationStatus}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      verificationStatus: e.target.value as RecruiterContact['verificationStatus']
                    })
                  }
                  className="w-full border rounded p-1.5 bg-slate-50"
                >
                  <option value="verified">Verified (Corporate Domain Checked)</option>
                  <option value="unverified">Unverified (Requires Manual Review)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                disabled={!newContact.fullName || !newContact.companyName}
                onClick={() => {
                  onAddContact(newContact);
                  setShowAddModal(false);
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium disabled:opacity-40"
              >
                Save Recruiter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
