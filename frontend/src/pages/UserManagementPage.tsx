import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import {
    Search, Trash2, Edit2, X, Users, ShieldCheck,
    Wrench, User as UserIcon, CheckCircle2, AlertCircle,
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────── */
type Role = 'ADMIN' | 'TECHNICIAN' | 'USER';

interface AppUser {
    id: string;
    name: string;
    email: string;
    role: Role;
    authProvider: string;
    avatar?: string;
}

type ModalMode = 'edit' | 'delete' | null;

/* ─── Inline styles ────────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  .um-root { font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif; }
  @keyframes umFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .um-u0 { animation: umFadeUp .35s ease both; }
  .um-u1 { animation: umFadeUp .35s .07s ease both; }
  .um-u2 { animation: umFadeUp .35s .14s ease both; }

  .um-input {
    width: 100%; box-sizing: border-box;
    padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid #E5E7EB; background: #FAFAF8;
    font-size: 14px; color: #111827; outline: none; font-family: inherit;
    transition: border-color .15s, box-shadow .15s;
  }
  .um-input::placeholder { color: #C0BBB0; }
  .um-input:focus {
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
    background: #fff;
  }
  .um-select { appearance: none; cursor: pointer; }

  .um-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 22px; border-radius: 12px; cursor: pointer; border: none;
    font-size: 13px; font-weight: 700; color: #fff; font-family: inherit;
    background: linear-gradient(135deg, #10B981, #059669);
    box-shadow: 0 3px 12px rgba(16,185,129,0.28);
    transition: filter .15s, transform .15s;
  }
  .um-btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }

  .um-btn-ghost {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 9px 18px; border-radius: 11px; cursor: pointer;
    font-size: 13px; font-weight: 700; font-family: inherit;
    background: #fff; color: #374151; border: 1.5px solid #E5E7EB;
    transition: background .15s, border-color .15s;
  }
  .um-btn-ghost:hover { background: #F0FDF4; border-color: #A7F3D0; color: #059669; }

  .um-btn-danger {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 9px 18px; border-radius: 11px; cursor: pointer;
    font-size: 13px; font-weight: 700; font-family: inherit;
    background: #FFF1F2; color: #E11D48; border: 1.5px solid #FECDD3;
    transition: background .15s;
  }
  .um-btn-danger:hover { background: #FFE4E6; }

  .um-user-row {
    background: #fff; border: 1px solid rgba(0,0,0,0.07);
    border-radius: 14px; padding: 16px 20px;
    transition: transform .2s ease, box-shadow .2s ease;
  }
  .um-user-row:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07); }

  .um-overlay {
    position: fixed; inset: 0; z-index: 50;
    display: flex; align-items: center; justify-content: center; padding: 16px;
    background: rgba(12,29,17,0.6); backdrop-filter: blur(4px);
  }
  .um-modal {
    width: 100%; max-width: 480px;
    background: #fff; border-radius: 20px;
    border: 1px solid rgba(0,0,0,0.07);
    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    overflow: hidden;
  }
  .um-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid #F0EDE6;
  }
  .um-modal-body { padding: 22px 24px; }
  .um-modal-footer {
    display: flex; justify-content: flex-end; gap: 10px;
    padding: 16px 24px; border-top: 1px solid #F0EDE6;
  }

  .um-skeleton { background: #F0EDE6; border-radius: 8px; animation: umPulse 1.4s ease-in-out infinite; }
  @keyframes umPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
`;

/* ─── Role configs ─────────────────────────────────────────── */
const ROLE_CFG: Record<Role, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    ADMIN: { bg: '#FFF1F2', text: '#E11D48', icon: <ShieldCheck className="h-3 w-3" />, label: 'Admin' },
    TECHNICIAN: { bg: '#FFFBEB', text: '#D97706', icon: <Wrench className="h-3 w-3" />, label: 'Technician' },
    USER: { bg: '#EFF6FF', text: '#2563EB', icon: <UserIcon className="h-3 w-3" />, label: 'User' },
};

/* ══════════════════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════════════════ */
export default function UserManagementPage() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [activeUser, setActiveUser] = useState<AppUser | null>(null);
    const [editName, setEditName] = useState('');
    const [editRole, setEditRole] = useState<Role>('USER');
    const [actionError, setActionError] = useState('');
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    /* ── Load users ── */
    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get<AppUser[]>('/users');
            setUsers(res.data);
        } catch {
            showToast('Failed to load users.', false);
        } finally {
            setLoading(false);
        }
    };

    /* ── Stats ── */
    const stats = useMemo(() => ({
        total: users.length,
        admins: users.filter((u) => u.role === 'ADMIN').length,
        technicians: users.filter((u) => u.role === 'TECHNICIAN').length,
        regularUsers: users.filter((u) => u.role === 'USER').length,
    }), [users]);

    /* ── Filtered list ── */
    const filtered = useMemo(() => {
        return users.filter((u) => {
            const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
            const q = searchQuery.toLowerCase();
            const matchesQuery = !q || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q);
            return matchesRole && matchesQuery;
        });
    }, [users, searchQuery, roleFilter]);

    /* ── Toast helper ── */
    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3500);
    };

    /* ── Modal helpers ── */
    const openEdit = (u: AppUser) => {
        setActiveUser(u);
        setEditName(u.name);
        setEditRole(u.role);
        setActionError('');
        setModalMode('edit');
    };

    const openDelete = (u: AppUser) => {
        setActiveUser(u);
        setActionError('');
        setModalMode('delete');
    };

    const closeModal = () => { setModalMode(null); setActiveUser(null); setActionError(''); };

    /* ── Save role/name edit ── */
    const handleSaveEdit = async () => {
        if (!activeUser) return;
        if (!editName.trim()) { setActionError('Name cannot be empty.'); return; }
        try {
            setActionError('');
            const res = await api.put<AppUser>(`/users/${activeUser.id}`, {
                ...activeUser,
                name: editName.trim(),
                role: editRole,
            });
            setUsers((prev) => prev.map((u) => u.id === activeUser.id ? res.data : u));
            showToast('User updated successfully.', true);
            closeModal();
        } catch (err: any) {
            setActionError(err.response?.data?.message || 'Failed to update user.');
        }
    };

    /* ── Delete user ── */
    const handleDelete = async () => {
        if (!activeUser) return;
        if (activeUser.id === currentUser?.id) {
            setActionError("You can't delete your own account.");
            return;
        }
        try {
            setActionError('');
            await api.delete(`/users/${activeUser.id}`);
            setUsers((prev) => prev.filter((u) => u.id !== activeUser.id));
            showToast('User deleted.', true);
            closeModal();
        } catch (err: any) {
            setActionError(err.response?.data?.message || 'Failed to delete user.');
        }
    };

    /* ── Initials helper ── */
    const initials = (name: string) =>
        name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';

    /* ══════════════════════════════════════════════════════ */
    return (
        <div className="um-root min-h-screen" style={{ background: '#E9E5DC' }}>
            <style>{STYLE}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

                {/* ── Breadcrumb ── */}
                <nav className="um-u0 flex items-center gap-1.5 text-xs mb-6">
                    <span style={{ color: '#9CA3AF' }} className="font-semibold uppercase tracking-widest">Operations</span>
                    <span style={{ color: '#9CA3AF' }}>›</span>
                    <span style={{ color: '#6B7280' }} className="font-medium">User Management</span>
                </nav>

                {/* ── HERO ── */}
                <div className="um-u0 relative overflow-hidden rounded-2xl mb-6" style={{ background: '#0C1D11' }}>
                    <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
                        backgroundSize: '26px 26px',
                    }} />
                    <div className="absolute inset-x-0 top-0 h-[3px]"
                        style={{ background: 'linear-gradient(90deg, #10B981 0%, #34D399 50%, #059669 100%)' }} />
                    <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)' }} />

                    <div className="relative px-8 py-9 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
                                style={{ background: 'rgba(16,185,129,0.14)', color: '#34D399' }}>
                                <ShieldCheck className="h-3 w-3" /> Admin Console
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-2"
                                style={{ color: '#F0FDF4' }}>
                                User Management
                            </h1>
                            <p className="text-sm" style={{ color: '#9CA3AF', lineHeight: 1.7 }}>
                                View all registered users, assign roles, and manage account access across the platform.
                            </p>
                        </div>

                        {/* Stats strip */}
                        <div className="grid grid-cols-4 gap-3 shrink-0">
                            {[
                                { label: 'Total', value: stats.total, accent: '#34D399' },
                                { label: 'Admins', value: stats.admins, accent: '#F43F5E' },
                                { label: 'Technicians', value: stats.technicians, accent: '#FCD34D' },
                                { label: 'Users', value: stats.regularUsers, accent: '#60A5FA' },
                            ].map(({ label, value, accent }) => (
                                <div key={label} className="rounded-xl px-4 py-3"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: accent }}>{label}</p>
                                    <p className="text-2xl font-extrabold leading-none" style={{ color: '#F0FDF4' }}>{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Filters panel ── */}
                <div className="um-u1 rounded-2xl bg-white mb-4 overflow-hidden"
                    style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: '14px 22px', borderBottom: '1px solid #F0EDE6' }}
                        className="flex items-center gap-3 flex-wrap">
                        <div style={{ width: 3, height: 18, borderRadius: 99, background: '#10B981', flexShrink: 0 }} />
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users className="h-3.5 w-3.5" style={{ color: '#10B981' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#374151' }}>
                            Filter Users
                        </span>

                        {/* role filter pills */}
                        <div className="flex gap-2 ml-2 flex-wrap">
                            {(['ALL', 'ADMIN', 'TECHNICIAN', 'USER'] as const).map((r) => (
                                <button key={r} type="button"
                                    onClick={() => setRoleFilter(r)}
                                    style={{
                                        padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                                        border: '1.5px solid',
                                        background: roleFilter === r ? '#0C1D11' : '#F9F9F8',
                                        color: roleFilter === r ? '#6EE7B7' : '#6B7280',
                                        borderColor: roleFilter === r ? '#0C1D11' : '#E5E7EB',
                                        cursor: 'pointer', transition: 'all .15s',
                                    }}>
                                    {r === 'ALL' ? 'All roles' : r.charAt(0) + r.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>

                        {/* search */}
                        <div className="ml-auto relative" style={{ minWidth: 240 }}>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#9CA3AF' }} />
                            <input
                                value={searchQuery}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or email…"
                                className="um-input"
                                style={{ paddingLeft: 34, paddingTop: 8, paddingBottom: 8, fontSize: 13 }}
                            />
                        </div>
                    </div>

                    {/* count line */}
                    <div style={{ padding: '10px 22px', background: '#FAFAF8', fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>
                        {filtered.length} {filtered.length === 1 ? 'user' : 'users'} shown
                    </div>
                </div>

                {/* ── User list ── */}
                <div className="um-u2 space-y-3">

                    {/* skeletons */}
                    {loading && Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #F0EDE6' }}>
                            <div className="flex items-center gap-4">
                                <div className="um-skeleton w-10 h-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="um-skeleton h-3 w-1/4" />
                                    <div className="um-skeleton h-2.5 w-1/3" />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* empty */}
                    {!loading && filtered.length === 0 && (
                        <div className="rounded-2xl p-12 text-center bg-white"
                            style={{ border: '1.5px dashed #D1D5DB' }}>
                            <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                                style={{ background: '#F0FDF4' }}>
                                <Users className="h-6 w-6" style={{ color: '#10B981' }} />
                            </div>
                            <p className="font-extrabold text-sm" style={{ color: '#0C1D11' }}>No users found</p>
                            <p className="mt-1 text-xs" style={{ color: '#9CA3AF' }}>Try adjusting your search or role filter.</p>
                        </div>
                    )}

                    {/* user cards */}
                    {!loading && filtered.map((u) => {
                        const roleCfg = ROLE_CFG[u.role] ?? ROLE_CFG.USER;
                        const isSelf = u.id === currentUser?.id;
                        return (
                            <article key={u.id} className="um-user-row">
                                <div className="flex items-center gap-4 flex-wrap">

                                    {/* avatar */}
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                                        background: 'linear-gradient(135deg,#10B981,#059669)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 800, fontSize: 15, color: '#fff',
                                    }}>
                                        {u.avatar
                                            ? <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', borderRadius: 12, objectFit: 'cover' }} />
                                            : initials(u.name)}
                                    </div>

                                    {/* info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span style={{ fontSize: 14, fontWeight: 800, color: '#0C1D11' }}>{u.name}</span>
                                            {isSelf && (
                                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                                    style={{ background: '#F0FDF4', color: '#059669' }}>You</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{u.email}</p>
                                        <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {u.authProvider ?? 'LOCAL'}
                                        </p>
                                    </div>

                                    {/* role badge */}
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                                        style={{ background: roleCfg.bg, color: roleCfg.text }}>
                                        {roleCfg.icon} {roleCfg.label}
                                    </span>

                                    {/* actions */}
                                    <div className="flex gap-2">
                                        <button type="button"
                                            onClick={() => openEdit(u)}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                padding: '7px 14px', borderRadius: 9, cursor: 'pointer',
                                                fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                                                background: '#FAFAF8', color: '#374151', border: '1.5px solid #E5E7EB',
                                                transition: 'background .15s',
                                            }}>
                                            <Edit2 className="h-3.5 w-3.5" /> Edit
                                        </button>
                                        {!isSelf && (
                                            <button type="button"
                                                onClick={() => openDelete(u)}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    padding: '7px 14px', borderRadius: 9, cursor: 'pointer',
                                                    fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                                                    background: '#FFF1F2', color: '#E11D48', border: '1.5px solid #FECDD3',
                                                    transition: 'background .15s',
                                                }}>
                                                <Trash2 className="h-3.5 w-3.5" /> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>

            {/* ════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════ */}
            {modalMode && (
                <div className="um-overlay">
                    <div className="um-modal">

                        {/* header */}
                        <div className="um-modal-header">
                            <div className="flex items-center gap-3">
                                <div style={{ width: 3, height: 18, borderRadius: 99, background: '#10B981' }} />
                                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0C1D11', margin: 0 }}>
                                    {modalMode === 'edit' && 'Edit User'}
                                    {modalMode === 'delete' && 'Delete User'}
                                </h3>
                            </div>
                            <button type="button" onClick={closeModal}
                                style={{ background: '#F5F3EE', border: 'none', borderRadius: '50%', padding: 6, cursor: 'pointer', color: '#6B7280' }}>
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* ── Edit form ── */}
                        {modalMode === 'edit' && activeUser && (
                            <>
                                <div className="um-modal-body space-y-4">
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#6B7280', display: 'block', marginBottom: 6 }}>
                                            Full Name
                                        </label>
                                        <input
                                            className="um-input"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Full name"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#6B7280', display: 'block', marginBottom: 6 }}>
                                            Role
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                className="um-input um-select"
                                                value={editRole}
                                                onChange={(e) => setEditRole(e.target.value as Role)}
                                            >
                                                <option value="USER">User</option>
                                                <option value="TECHNICIAN">Technician</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}>▾</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FAFAF8', border: '1px solid #F0EDE6', fontSize: 12, color: '#6B7280' }}>
                                        <strong style={{ color: '#374151' }}>Email:</strong> {activeUser.email} <span style={{ color: '#C0BBB0' }}>(read-only)</span>
                                    </div>
                                    {actionError && (
                                        <div className="flex items-center gap-2 text-sm text-red-600" style={{ background: '#FFF1F2', padding: '10px 14px', borderRadius: 10 }}>
                                            <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
                                        </div>
                                    )}
                                </div>
                                <div className="um-modal-footer">
                                    <button type="button" className="um-btn-ghost" onClick={closeModal}>Cancel</button>
                                    <button type="button" className="um-btn-primary" onClick={handleSaveEdit}>Save Changes</button>
                                </div>
                            </>
                        )}

                        {/* ── Delete confirm ── */}
                        {modalMode === 'delete' && activeUser && (
                            <>
                                <div className="um-modal-body">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div style={{
                                            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                            background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <AlertCircle className="h-5 w-5" style={{ color: '#E11D48' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 800, color: '#0C1D11' }}>Delete <span style={{ color: '#E11D48' }}>{activeUser.name}</span>?</p>
                                            <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{activeUser.email}</p>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, background: '#FAFAF8', padding: '12px 14px', borderRadius: 10, border: '1px solid #F0EDE6' }}>
                                        This will permanently remove the user and all their data. This action cannot be undone.
                                    </p>
                                    {actionError && (
                                        <div className="flex items-center gap-2 text-sm text-red-600 mt-3" style={{ background: '#FFF1F2', padding: '10px 14px', borderRadius: 10 }}>
                                            <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
                                        </div>
                                    )}
                                </div>
                                <div className="um-modal-footer">
                                    <button type="button" className="um-btn-ghost" onClick={closeModal}>Cancel</button>
                                    <button type="button" className="um-btn-danger" onClick={handleDelete}>Yes, Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Toast ── */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 60,
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 18px', borderRadius: 14,
                    background: toast.ok ? '#0C1D11' : '#FFF1F2',
                    color: toast.ok ? '#6EE7B7' : '#E11D48',
                    fontSize: 13, fontWeight: 700,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
                    border: `1px solid ${toast.ok ? 'rgba(255,255,255,0.1)' : '#FECDD3'}`,
                }}>
                    {toast.ok
                        ? <CheckCircle2 className="h-4 w-4" />
                        : <AlertCircle className="h-4 w-4" />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
