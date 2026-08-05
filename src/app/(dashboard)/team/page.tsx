"use client";

import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, Eye, Trash2, UserPlus, BadgeCheck } from 'lucide-react';

const ROLE_STYLES: Record<string, { label: string; cls: string; icon: any }> = {
  ADMIN: { label: 'Admin', cls: 'bg-purple-100 text-purple-700 border-purple-200', icon: BadgeCheck },
  EDITOR: { label: 'Editor', cls: 'bg-blue-100 text-blue-700 border-blue-200', icon: ShieldCheck },
  VIEWER: { label: 'Viewer', cls: 'bg-gray-100 text-gray-700 border-gray-200', icon: Eye },
};

export default function TeamPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');
  const [loading, setLoading] = useState(true);
  const currentTeamId = teams[0]?.id;

  useEffect(() => {
    fetch('/api/teams').then(r => r.json()).then(data => {
      const list = data.teams || [];
      setTeams(list);
      if (list[0]?.id) {
        fetch(`/api/teams/${list[0].id}/members`).then(r => r.json()).then(m => setMembers(m.members || []));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[rgb(var(--color-text))]">Team</h1>
        <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">Collaborate with your team and manage roles.</p>
      </div>

      {loading ? (
        <div className="text-sm text-[rgb(var(--color-text-muted))]">Loading...</div>
      ) : (
        <>
          <section className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-5 shadow-sm">
            <h2 className="text-base font-bold text-[rgb(var(--color-text))] mb-4">Members</h2>
            {members.length === 0 ? (
              <p className="text-sm text-[rgb(var(--color-text-muted))]">No members yet.</p>
            ) : (
              <div className="space-y-2">
                {members.map((m: any) => {
                  const meta = ROLE_STYLES[m.role] || ROLE_STYLES.VIEWER;
                  const Icon = meta.icon;
                  return (
                    <div key={m.userId || m.id} className="flex items-center justify-between rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] text-white flex items-center justify-center text-xs font-bold">
                          {(m.userName || m.email || 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[rgb(var(--color-text))] truncate">{m.userName || m.email || 'Unknown'}</p>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${meta.cls}`}>
                            <Icon size={10} /> {meta.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {m.role !== 'ADMIN' && (
                          <>
                            <form action={async () => {
                              'use server';
                              await fetch(`/api/teams/${currentTeamId}/members`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: m.userId || m.id, role: 'EDITOR' }) });
                            }}>
                              <button type="submit" className="text-xs font-semibold text-blue-600 hover:underline">Make Editor</button>
                            </form>
                            <form action={async () => {
                              'use server';
                              await fetch(`/api/teams/${currentTeamId}/members?userId=${m.userId || m.id}`, { method: 'DELETE' });
                            }}>
                              <button type="submit" className="inline-flex items-center gap-1 text-[rgb(var(--color-danger))] hover:text-[rgb(var(--color-danger-hover))] text-xs font-semibold"><Trash2 size={12} /> Remove</button>
                            </form>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-5 shadow-sm">
            <h2 className="text-base font-bold text-[rgb(var(--color-text))] mb-4">Invite Member</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await fetch(`/api/teams/${currentTeamId}/members`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
                });
                setInviteEmail('');
                setInviteRole('VIEWER');
                window.location.reload();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-3 py-2.5 text-sm text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-3 py-2.5 text-sm text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
              >
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-hover))] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors">
                <UserPlus size={16} /> Invite
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
