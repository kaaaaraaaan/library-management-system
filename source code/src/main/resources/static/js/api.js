// ============================================================
// api.js — HTTP client for the Library Management System API
// ============================================================

const API_BASE = '/api';
let _token = localStorage.getItem('lms_token');

function setToken(t) {
    _token = t;
    t ? localStorage.setItem('lms_token', t) : localStorage.removeItem('lms_token');
}

function getToken() {
    return _token || localStorage.getItem('lms_token');
}

async function apiRequest(method, path, body = null, opts = {}) {
    const token = getToken();
    const headers = { ...(token ? { 'Authorization': 'Bearer ' + token } : {}) };

    if (!opts.formData) headers['Content-Type'] = 'application/json';

    const config = {
        method,
        headers,
        ...(body && !opts.formData ? { body: JSON.stringify(body) } : {}),
        ...(body && opts.formData   ? { body }                       : {})
    };

    let response;
    try {
        response = await fetch(API_BASE + path, config);
    } catch (e) {
        throw new Error('Network error — is the server running?');
    }

    if (response.status === 401) {
        setToken(null);
        localStorage.removeItem('lms_user');
        window.location.reload();
        throw new Error('Session expired');
    }

    if (opts.rawResponse) return response;

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
    return data;
}

const api = {
    auth: {
        login:    (u, p) => apiRequest('POST', '/auth/login',    { username: u, password: p }),
        register: (d)    => apiRequest('POST', '/auth/register', d)
    },

    books: {
        list:        (p = {}) => apiRequest('GET',    '/books?' + new URLSearchParams(p)),
        get:         (id)     => apiRequest('GET',    `/books/${id}`),
        create:      (d)      => apiRequest('POST',   '/books', d),
        update:      (id, d)  => apiRequest('PUT',    `/books/${id}`, d),
        delete:      (id)     => apiRequest('DELETE', `/books/${id}`),
        uploadCover: (id, f)  => {
            const fd = new FormData(); fd.append('file', f);
            return apiRequest('POST', `/books/${id}/cover`, fd, { formData: true });
        }
    },

    authors: {
        list:   (p = {}) => apiRequest('GET',    '/authors?' + new URLSearchParams(p)),
        get:    (id)     => apiRequest('GET',    `/authors/${id}`),
        create: (d)      => apiRequest('POST',   '/authors', d),
        update: (id, d)  => apiRequest('PUT',    `/authors/${id}`, d),
        delete: (id)     => apiRequest('DELETE', `/authors/${id}`)
    },

    categories: {
        list:   ()       => apiRequest('GET',    '/categories'),
        create: (d)      => apiRequest('POST',   '/categories', d),
        update: (id, d)  => apiRequest('PUT',    `/categories/${id}`, d),
        delete: (id)     => apiRequest('DELETE', `/categories/${id}`)
    },

    members: {
        list:   (p = {}) => apiRequest('GET',    '/members?' + new URLSearchParams(p)),
        get:    (id)     => apiRequest('GET',    `/members/${id}`),
        create: (d)      => apiRequest('POST',   '/members', d),
        update: (id, d)  => apiRequest('PUT',    `/members/${id}`, d),
        delete: (id)     => apiRequest('DELETE', `/members/${id}`)
    },

    loans: {
        list:   (p = {}) => apiRequest('GET', '/loans?' + new URLSearchParams(p)),
        get:    (id)     => apiRequest('GET', `/loans/${id}`),
        issue:  (d)      => apiRequest('POST', '/loans/issue', d),
        return: (id)     => apiRequest('PUT',  `/loans/${id}/return`)
    },

    reports: {
        loansPdf: () => apiRequest('GET', '/reports/loans/pdf', null, { rawResponse: true }),
        booksCsv: () => apiRequest('GET', '/reports/books/csv', null, { rawResponse: true })
    },

    auditLogs: {
        list: (p = {}) => apiRequest('GET', '/audit-logs?' + new URLSearchParams(p))
    }
};
