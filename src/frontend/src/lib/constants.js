export const POLICY_STATUS = {
  ACTIVE:             { label: 'Vigente',         color: '#22c55e', bg: '#052e16', dot: '●' },
  EXPIRING_SOON:      { label: 'Por vencer',      color: '#f59e0b', bg: '#451a03', dot: '◆' },
  EXPIRED_RENEWABLE:  { label: 'Renovable',       color: '#f97316', bg: '#431407', dot: '▲' },
  LOST:               { label: 'Perdida',         color: '#6b7280', bg: '#111827', dot: '○' },
};

export const FOLLOW_UP_STATUS = {
  PENDING:          { label: 'Pendiente',           color: '#94a3b8' },
  ATTEMPTED:        { label: 'Intentado',           color: '#f59e0b' },
  CONTACTED:        { label: 'Contactado',          color: '#60a5fa' },
  WAITING_RESPONSE: { label: 'Esperando resp.',     color: '#a78bfa' },
  COMPLETED:        { label: 'Completado',          color: '#22c55e' },
};

export const ACTIVITY_TYPE = {
  CALL:     { label: 'Llamada',   icon: '📞' },
  WHATSAPP: { label: 'WhatsApp',  icon: '💬' },
  EMAIL:    { label: 'Email',     icon: '✉️' },
  NOTE:     { label: 'Nota',      icon: '📝' },
  MEETING:  { label: 'Reunión',   icon: '🤝' },
};

export const POLICY_TYPE_LABEL = {
  AUTO:   'Auto',
  HOME:   'Hogar',
  LIFE:   'Vida',
  HEALTH: 'Salud',
  OTHER:  'Otro',
};

export function formatDays(days) {
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days > 0)  return `${days}d`;
  return `−${Math.abs(days)}d`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}
