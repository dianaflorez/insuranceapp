import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import {
  POLICY_STATUS, FOLLOW_UP_STATUS, ACTIVITY_TYPE, POLICY_TYPE_LABEL,
  formatDays, formatDate, formatDateTime
} from '../lib/constants.js';

const ACTIVITY_TYPES = Object.entries(ACTIVITY_TYPE);
const FOLLOW_UP_OPTIONS = Object.entries(FOLLOW_UP_STATUS);

export default function PolicyDrawer({ policyId, onClose, onUpdate }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityType, setActivityType] = useState('CALL');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [renewDate, setRenewDate] = useState('');
  const [showRenewForm, setShowRenewForm] = useState(false);

  useEffect(() => {
    if (!policyId) return;
    setLoading(true);
    api.getPolicy(policyId).then(p => { setPolicy(p); setLoading(false); });
  }, [policyId]);

  async function handleAddActivity(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.addActivity(policyId, { activity_type: activityType, notes });
      setNotes('');
      const updated = await api.getPolicy(policyId);
      setPolicy(updated);
      onUpdate();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFollowUp(status) {
    await api.updateFollowUp(policyId, status);
    const updated = await api.getPolicy(policyId);
    setPolicy(updated);
    onUpdate();
  }

  async function handleRenew(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.renewPolicy(policyId, renewDate);
      const updated = await api.getPolicy(policyId);
      setPolicy(updated);
      setShowRenewForm(false);
      onUpdate();
    } finally {
      setSubmitting(false);
    }
  }

  if (!policyId) return null;

  const statusInfo = policy ? POLICY_STATUS[policy.policy_status] : null;
  const fuInfo     = policy ? FOLLOW_UP_STATUS[policy.follow_up_status] : null;

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.drawer}>
        {/* Header */}
        <div style={styles.drawerHeader}>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
          {loading ? (
            <div style={styles.loadingText}>Cargando...</div>
          ) : (
            <>
              <div style={styles.drawerTitle}>
                <span style={{ color: '#94a3b8', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
                  {policy.policy_number}
                </span>
                <h2 style={{ margin: 0, fontSize: 22, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                  {policy.first_name} {policy.last_name}
                </h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <span style={{
                    background: statusInfo.bg, color: statusInfo.color,
                    padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    border: `1px solid ${statusInfo.color}33`
                  }}>
                    {statusInfo.dot} {statusInfo.label}
                  </span>
                  <span style={{ color: '#64748b', fontSize: 13 }}>
                    {POLICY_TYPE_LABEL[policy.policy_type]} · {formatDate(policy.expiration_date)}
                    {' '}({formatDays(policy.days_until_expiration)})
                  </span>
                </div>
              </div>

              {/* Follow-up status */}
              <div style={styles.section}>
                <div style={styles.sectionLabel}>Estado de gestión</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {FOLLOW_UP_OPTIONS.map(([key, { label, color }]) => (
                    <button
                      key={key}
                      onClick={() => handleFollowUp(key)}
                      style={{
                        ...styles.fuBtn,
                        border: `1px solid ${policy.follow_up_status === key ? color : '#1e293b'}`,
                        color: policy.follow_up_status === key ? color : '#475569',
                        background: policy.follow_up_status === key ? `${color}15` : 'transparent',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Renew */}
              {(policy.policy_status === 'EXPIRING_SOON' || policy.policy_status === 'EXPIRED_RENEWABLE') && (
                <div style={styles.section}>
                  {!showRenewForm ? (
                    <button onClick={() => setShowRenewForm(true)} style={styles.renewBtn}>
                      ↻ Registrar renovación
                    </button>
                  ) : (
                    <form onSubmit={handleRenew} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="date"
                        value={renewDate}
                        onChange={e => setRenewDate(e.target.value)}
                        required
                        style={styles.input}
                      />
                      <button type="submit" disabled={submitting} style={styles.renewBtn}>
                        {submitting ? '...' : 'Confirmar'}
                      </button>
                      <button type="button" onClick={() => setShowRenewForm(false)} style={styles.cancelBtn}>
                        Cancelar
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Contact info */}
              {(policy.phone || policy.email) && (
                <div style={styles.section}>
                  <div style={styles.sectionLabel}>Contacto</div>
                  <div style={{ display: 'flex', gap: 12, color: '#94a3b8', fontSize: 13 }}>
                    {policy.phone && <span>📞 {policy.phone}</span>}
                    {policy.email && <span>✉️ {policy.email}</span>}
                  </div>
                </div>
              )}

              {/* Add activity form */}
              <div style={styles.section}>
                <div style={styles.sectionLabel}>Registrar actividad</div>
                <form onSubmit={handleAddActivity} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {ACTIVITY_TYPES.map(([key, { label, icon }]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActivityType(key)}
                        style={{
                          ...styles.fuBtn,
                          border: `1px solid ${activityType === key ? '#f59e0b' : '#1e293b'}`,
                          color: activityType === key ? '#f59e0b' : '#475569',
                          background: activityType === key ? '#f59e0b15' : 'transparent',
                        }}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Notas sobre la gestión..."
                    rows={2}
                    style={{ ...styles.input, resize: 'vertical' }}
                  />
                  <button type="submit" disabled={submitting} style={styles.submitBtn}>
                    {submitting ? 'Guardando...' : '+ Registrar'}
                  </button>
                </form>
              </div>

              {/* Activity timeline */}
              <div style={styles.section}>
                <div style={styles.sectionLabel}>Historial ({policy.activities?.length || 0})</div>
                {policy.activities?.length === 0 && (
                  <div style={{ color: '#475569', fontSize: 13 }}>Sin actividades registradas</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {policy.activities?.map(a => (
                    <div key={a.id} style={styles.activityItem}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 600 }}>
                          {ACTIVITY_TYPE[a.activity_type]?.icon} {ACTIVITY_TYPE[a.activity_type]?.label}
                        </span>
                        <span style={{ color: '#475569', fontSize: 11, fontFamily: 'DM Mono, monospace' }}>
                          {formatDateTime(a.created_at)}
                        </span>
                      </div>
                      {a.notes && <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 2 }}>{a.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    zIndex: 100,
    display: 'flex', justifyContent: 'flex-end',
  },
  drawer: {
    width: 480, height: '100%',
    background: '#0f172a',
    borderLeft: '1px solid #1e293b',
    overflowY: 'auto',
    animation: 'slideIn 0.2s ease',
  },
  drawerHeader: { padding: '24px 24px 40px' },
  closeBtn: {
    background: 'none', border: 'none', color: '#475569',
    cursor: 'pointer', fontSize: 18, float: 'right', padding: 4,
  },
  drawerTitle: { marginTop: 8, marginBottom: 16 },
  loadingText: { color: '#475569', marginTop: 40, textAlign: 'center' },
  section: {
    borderTop: '1px solid #1e293b',
    paddingTop: 16, marginTop: 16,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
    color: '#475569', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace',
  },
  fuBtn: {
    padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
    fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
  },
  input: {
    background: '#1e293b', border: '1px solid #334155',
    color: '#e2e8f0', borderRadius: 6, padding: '8px 12px',
    fontSize: 13, fontFamily: 'inherit', width: '100%',
    boxSizing: 'border-box',
  },
  submitBtn: {
    background: '#1e40af', color: '#fff', border: 'none',
    borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, alignSelf: 'flex-start',
  },
  renewBtn: {
    background: '#065f46', color: '#34d399', border: '1px solid #065f46',
    borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, alignSelf: 'flex-start',
  },
  cancelBtn: {
    background: 'none', color: '#475569', border: '1px solid #1e293b',
    borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontSize: 13,
  },
  activityItem: {
    background: '#1e293b', borderRadius: 8, padding: '10px 12px',
  },
};
