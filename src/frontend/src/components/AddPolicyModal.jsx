import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { POLICY_TYPE_LABEL } from '../lib/constants.js';

const POLICY_TYPES = Object.entries(POLICY_TYPE_LABEL);

export default function AddPolicyModal({ onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [mode, setMode] = useState('existing'); // 'existing' | 'new'
  const [form, setForm] = useState({
    customer_id: '',
    first_name: '', last_name: '', phone: '', email: '',
    policy_number: '', policy_type: 'AUTO', expiration_date: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getCustomers().then(setCustomers);
  }, []);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      let customerId = form.customer_id;
      if (mode === 'new') {
        const c = await api.createCustomer({
          first_name: form.first_name, last_name: form.last_name,
          phone: form.phone, email: form.email,
        });
        customerId = c.id;
      }
      await api.createPolicy({
        customer_id: customerId,
        policy_number: form.policy_number,
        policy_type: form.policy_type,
        expiration_date: form.expiration_date,
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontSize: 20 }}>Nueva póliza</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Customer selector */}
          <div>
            <label style={styles.label}>Cliente</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {['existing','new'].map(m => (
                <button key={m} type="button"
                  onClick={() => setMode(m)}
                  style={{
                    ...styles.tabBtn,
                    background: mode === m ? '#1e40af' : 'transparent',
                    color: mode === m ? '#fff' : '#475569',
                  }}
                >
                  {m === 'existing' ? 'Cliente existente' : 'Nuevo cliente'}
                </button>
              ))}
            </div>

            {mode === 'existing' ? (
              <select
                value={form.customer_id}
                onChange={e => set('customer_id', e.target.value)}
                required
                style={styles.input}
              >
                <option value="">Seleccionar cliente...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input required placeholder="Nombre" value={form.first_name}
                    onChange={e => set('first_name', e.target.value)} style={styles.input} />
                  <input required placeholder="Apellido" value={form.last_name}
                    onChange={e => set('last_name', e.target.value)} style={styles.input} />
                </div>
                <input placeholder="Teléfono" value={form.phone}
                  onChange={e => set('phone', e.target.value)} style={styles.input} />
                <input placeholder="Email" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)} style={styles.input} />
              </div>
            )}
          </div>

          {/* Policy fields */}
          <div>
            <label style={styles.label}>Número de póliza</label>
            <input required value={form.policy_number}
              onChange={e => set('policy_number', e.target.value)}
              placeholder="Ej: POL-AUTO-2024-001" style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Tipo</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {POLICY_TYPES.map(([key, label]) => (
                <button key={key} type="button"
                  onClick={() => set('policy_type', key)}
                  style={{
                    ...styles.tabBtn,
                    background: form.policy_type === key ? '#1e40af' : 'transparent',
                    color: form.policy_type === key ? '#fff' : '#475569',
                    border: `1px solid ${form.policy_type === key ? '#1e40af' : '#1e293b'}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={styles.label}>Fecha de vencimiento</label>
            <input required type="date" value={form.expiration_date}
              onChange={e => set('expiration_date', e.target.value)} style={styles.input} />
          </div>

          {error && <div style={{ color: '#f87171', fontSize: 13 }}>⚠ {error}</div>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancelar</button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Guardando...' : 'Crear póliza'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#0f172a', border: '1px solid #1e293b',
    borderRadius: 12, padding: 24, width: 480, maxHeight: '90vh', overflowY: 'auto',
  },
  closeBtn: {
    background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 18,
  },
  label: {
    display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
    color: '#475569', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 6,
  },
  input: {
    width: '100%', background: '#1e293b', border: '1px solid #334155',
    color: '#e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 13,
    fontFamily: 'inherit', boxSizing: 'border-box',
  },
  tabBtn: {
    padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
    fontSize: 12, fontWeight: 500, border: '1px solid #1e293b',
  },
  submitBtn: {
    background: '#1e40af', color: '#fff', border: 'none',
    borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
  cancelBtn: {
    background: 'none', color: '#475569', border: '1px solid #1e293b',
    borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 13,
  },
};
