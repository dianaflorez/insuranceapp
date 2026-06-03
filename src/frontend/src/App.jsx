import { useState, useEffect, useCallback } from 'react';
import { api } from './lib/api.js';
import {
  POLICY_STATUS, FOLLOW_UP_STATUS, ACTIVITY_TYPE, POLICY_TYPE_LABEL,
  formatDays, formatDate, formatDateTime,
} from './lib/constants.js';
import PolicyDrawer from './components/PolicyDrawer.jsx';
import AddPolicyModal from './components/AddPolicyModal.jsx';

const FILTER_STATUSES = [
  { key: '',                label: 'Todas' },
  { key: 'EXPIRING_SOON',  label: '◆ Por vencer' },
  { key: 'EXPIRED_RENEWABLE', label: '▲ Renovables' },
  { key: 'ACTIVE',         label: '● Vigentes' },
  { key: 'LOST',           label: '○ Perdidas' },
];

export default function App() {
  const [policies, setPolicies]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId]     = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search)       params.search = search;
      const data = await api.getPolicies(params);
      setPolicies(data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  // Summary counts
  const counts = policies.reduce((acc, p) => {
    acc[p.policy_status] = (acc[p.policy_status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={styles.root}>
      <style>{globalStyles}</style>

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandMark}>S</div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
              Cartera
            </div>
            <div style={{ fontSize: 10, color: '#475569', letterSpacing: '0.1em', fontFamily: 'DM Mono, monospace' }}>
              SEGUROS
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div style={styles.summaryGrid}>
          {[
            { key: 'EXPIRING_SOON', label: 'Por vencer' },
            { key: 'EXPIRED_RENEWABLE', label: 'Renovables' },
          ].map(({ key, label }) => {
            const s = POLICY_STATUS[key];
            const n = counts[key] || 0;
            return (
              <div key={key} style={{ ...styles.summaryCard, borderColor: n > 0 ? s.color : '#1e293b' }}
                onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
              >
                <div style={{ fontSize: 26, fontWeight: 800, color: n > 0 ? s.color : '#334155', fontFamily: 'Syne' }}>
                  {n}
                </div>
                <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
          {FILTER_STATUSES.map(({ key, label }) => {
            const s = key ? POLICY_STATUS[key] : null;
            const active = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                style={{
                  ...styles.navBtn,
                  background: active ? '#1e293b' : 'transparent',
                  color: active ? (s?.color || '#e2e8f0') : '#475569',
                }}
              >
                {label}
                {key && counts[key] != null && (
                  <span style={{
                    marginLeft: 'auto', fontSize: 11, fontFamily: 'DM Mono, monospace',
                    color: s?.color || '#475569', opacity: 0.8,
                  }}>
                    {counts[key] || 0}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
            + Nueva póliza
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={styles.pageTitle}>
              {statusFilter ? POLICY_STATUS[statusFilter]?.label : 'Todas las pólizas'}
            </h1>
            <span style={{ fontSize: 12, color: '#475569', fontFamily: 'DM Mono, monospace' }}>
              {loading ? '...' : `${policies.length} registros`}
            </span>
          </div>
          <input
            style={styles.searchInput}
            type="search"
            placeholder="Buscar cliente o número..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Cliente', 'Póliza', 'Tipo', 'Vencimiento', 'Estado', 'Gestión', 'Última actividad'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#475569' }}>
                  Cargando...
                </td></tr>
              )}
              {!loading && policies.length === 0 && (
                <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#475569' }}>
                  No hay pólizas con ese filtro.
                </td></tr>
              )}
              {!loading && policies.map(p => {
                const ps = POLICY_STATUS[p.policy_status];
                const fu = FOLLOW_UP_STATUS[p.follow_up_status];
                const la = p.last_activity;
                const days = p.days_until_expiration;
                const isUrgent = p.policy_status === 'EXPIRING_SOON' || p.policy_status === 'EXPIRED_RENEWABLE';

                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    style={{
                      ...styles.tr,
                      borderLeft: `3px solid ${isUrgent ? ps.color : 'transparent'}`,
                    }}
                  >
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 14 }}>
                        {p.first_name} {p.last_name}
                      </div>
                      {p.phone && <div style={{ fontSize: 11, color: '#475569' }}>{p.phone}</div>}
                    </td>
                    <td style={{ ...styles.td, fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#64748b' }}>
                      {p.policy_number}
                    </td>
                    <td style={{ ...styles.td, fontSize: 13, color: '#94a3b8' }}>
                      {POLICY_TYPE_LABEL[p.policy_type]}
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: 13, color: '#94a3b8' }}>{formatDate(p.expiration_date)}</div>
                      <div style={{
                        fontSize: 12, fontFamily: 'DM Mono, monospace', fontWeight: 700,
                        color: Math.abs(days) <= 5 ? '#ef4444' : ps.color,
                      }}>
                        {formatDays(days)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                        color: ps.color, background: ps.bg, border: `1px solid ${ps.color}33`,
                      }}>
                        {ps.dot} {ps.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: 12, color: fu.color }}>{fu.label}</span>
                    </td>
                    <td style={styles.td}>
                      {la ? (
                        <div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>
                            {ACTIVITY_TYPE[la.activity_type]?.icon} {la.notes?.slice(0, 35)}{la.notes?.length > 35 ? '…' : ''}
                          </div>
                          <div style={{ fontSize: 10, color: '#475569', fontFamily: 'DM Mono, monospace' }}>
                            {formatDateTime(la.created_at)}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#334155', fontSize: 12 }}>Sin actividad</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Drawer */}
      {selectedId && (
        <PolicyDrawer
          policyId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdate={load}
        />
      )}

      {/* Add modal */}
      {showAddModal && (
        <AddPolicyModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => { setShowAddModal(false); load(); }}
        />
      )}
    </div>
  );
}

const styles = {
  root: {
    display: 'flex', height: '100vh', background: '#080f1a',
    color: '#e2e8f0', fontFamily: 'Syne, sans-serif', overflow: 'hidden',
  },
  sidebar: {
    width: 220, background: '#0a1628', borderRight: '1px solid #0f2040',
    display: 'flex', flexDirection: 'column', padding: '20px 12px',
    flexShrink: 0,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
  brandMark: {
    width: 32, height: 32, background: '#1e40af', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 18, fontFamily: 'Syne, sans-serif', color: '#fff',
  },
  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 },
  summaryCard: {
    background: '#0f172a', border: '1px solid', borderRadius: 8,
    padding: '10px 10px', cursor: 'pointer', transition: 'border-color 0.2s',
  },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 10px', borderRadius: 6, border: 'none',
    cursor: 'pointer', fontSize: 13, fontFamily: 'Syne, sans-serif',
    textAlign: 'left', transition: 'all 0.15s',
  },
  addBtn: {
    width: '100%', background: '#1e3a8a', color: '#93c5fd',
    border: '1px solid #1e40af', borderRadius: 8, padding: '9px',
    cursor: 'pointer', fontSize: 13, fontWeight: 600,
    fontFamily: 'Syne, sans-serif',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topBar: {
    padding: '20px 24px 16px',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    borderBottom: '1px solid #0f2040',
    gap: 16,
  },
  pageTitle: {
    margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800,
    fontSize: 22, letterSpacing: '-0.02em',
  },
  searchInput: {
    background: '#0f172a', border: '1px solid #1e293b',
    color: '#e2e8f0', borderRadius: 8, padding: '8px 14px',
    fontSize: 13, fontFamily: 'inherit', width: 240, outline: 'none',
  },
  tableWrapper: { flex: 1, overflowY: 'auto', padding: '0 24px 24px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 8 },
  th: {
    textAlign: 'left', padding: '10px 12px',
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
    color: '#334155', textTransform: 'uppercase',
    fontFamily: 'DM Mono, monospace', borderBottom: '1px solid #0f2040',
    position: 'sticky', top: 0, background: '#080f1a',
  },
  tr: {
    cursor: 'pointer', transition: 'background 0.12s',
    borderBottom: '1px solid #0a1628',
  },
  td: { padding: '12px 12px', verticalAlign: 'top' },
};

const globalStyles = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #080f1a; }
  tr:hover td { background: #0f172a; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  input[type=search]::-webkit-search-cancel-button { -webkit-appearance: none; }
`;
