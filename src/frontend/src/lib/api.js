const BASE = '/api';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Policies (main view)
  getPolicies: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req(`/policies${qs ? `?${qs}` : ''}`);
  },
  getPolicy: (id) => req(`/policies/${id}`),
  createPolicy: (body) => req('/policies', { method: 'POST', body: JSON.stringify(body) }),
  updateFollowUp: (id, follow_up_status) =>
    req(`/policies/${id}/follow-up`, { method: 'PATCH', body: JSON.stringify({ follow_up_status }) }),
  renewPolicy: (id, expiration_date) =>
    req(`/policies/${id}/renew`, { method: 'PATCH', body: JSON.stringify({ expiration_date }) }),

  // Activities
  getActivities: (policyId) => req(`/policies/${policyId}/activities`),
  addActivity: (policyId, body) =>
    req(`/policies/${policyId}/activities`, { method: 'POST', body: JSON.stringify(body) }),

  // Customers
  getCustomers: () => req('/customers'),
  createCustomer: (body) => req('/customers', { method: 'POST', body: JSON.stringify(body) }),
};
