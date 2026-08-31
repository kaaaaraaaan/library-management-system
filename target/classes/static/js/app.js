// ============================================================
// app.js — Library Management System SPA
// ============================================================

// ── State ────────────────────────────────────────────────────
const state = {
    user: JSON.parse(localStorage.getItem('lms_user') || 'null'),
    // cached data for edit modals
    _books: [], _authors: [], _categories: [], _members: [],
    bookPage: 0, bookFilters: {},
    memberPage: 0, memberFilters: {},
    loanPage: 0,
    auditPage: 0
};

// ── Helpers ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const isAdmin     = () => ['ROLE_ADMIN','ADMIN'].includes(state.user?.role);
const isLibrarian = () => ['ROLE_ADMIN','ADMIN','ROLE_LIBRARIAN','LIBRARIAN'].includes(state.user?.role);

function setPageTitle(title, sub = '') {
    $('page-title').textContent = title;
    $('page-subtitle').textContent = sub;
}

function renderContent(html) { $('page-content').innerHTML = html; }

function renderLoading() {
    renderContent('<div class="flex items-center justify-center h-64"><div class="spinner"></div></div>');
}

function showToast(msg, type = 'success') {
    const colors = { success:'bg-green-500', error:'bg-red-500', warning:'bg-yellow-500', info:'bg-blue-500' };
    const icons  = { success:'fa-check-circle', error:'fa-exclamation-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
    const t = document.createElement('div');
    t.className = `toast flex items-center gap-2.5 px-4 py-3 rounded-xl text-white shadow-lg text-sm font-medium pointer-events-auto ${colors[type]}`;
    t.innerHTML = `<i class="fas ${icons[type]}"></i><span>${msg}</span>`;
    $('toast-container').appendChild(t);
    setTimeout(() => { t.style.cssText = 'opacity:0;transition:opacity .3s'; setTimeout(() => t.remove(), 300); }, 3500);
}

function showModal(title, bodyHTML, onSubmit, submitLabel = 'Save') {
    $('modal-title').textContent = title;
    $('modal-body').innerHTML = bodyHTML;
    $('modal-footer').innerHTML = `
        <button id="modal-cancel" class="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
        <button id="modal-submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">${submitLabel}</button>`;
    $('modal-overlay').classList.remove('hidden');
    $('modal-cancel').onclick = closeModal;
    $('modal-close').onclick  = closeModal;
    if (onSubmit) $('modal-submit').onclick = onSubmit;
}

function showDangerModal(title, bodyHTML, onConfirm, confirmLabel = 'Delete') {
    $('modal-title').textContent = title;
    $('modal-body').innerHTML = bodyHTML;
    $('modal-footer').innerHTML = `
        <button id="modal-cancel" class="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
        <button id="modal-submit" class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">${confirmLabel}</button>`;
    $('modal-overlay').classList.remove('hidden');
    $('modal-cancel').onclick = closeModal;
    $('modal-close').onclick  = closeModal;
    $('modal-submit').onclick = () => { closeModal(); onConfirm(); };
}

function closeModal() { $('modal-overlay').classList.add('hidden'); }

function statusBadge(status) {
    const cls = { ACTIVE:'bg-blue-100 text-blue-700', RETURNED:'bg-green-100 text-green-700',
                  OVERDUE:'bg-red-100 text-red-700', SUSPENDED:'bg-red-100 text-red-700' };
    return `<span class="px-2 py-0.5 rounded-full text-xs font-semibold ${cls[status]||'bg-gray-100 text-gray-600'}">${status||'—'}</span>`;
}

function actionBadge(action = '') {
    const a = action.toUpperCase();
    if (a.includes('CREATE') || a.includes('REGISTER') || a.includes('ISSUE')) return `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">${action}</span>`;
    if (a.includes('UPDATE') || a.includes('RETURN'))  return `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">${action}</span>`;
    if (a.includes('DELETE'))  return `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">${action}</span>`;
    if (a.includes('LOGIN'))   return `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">${action}</span>`;
    if (a.includes('UPLOAD'))  return `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">${action}</span>`;
    return `<span class="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">${action}</span>`;
}

function pagination(page, fnName) {
    if (!page || page.totalPages <= 1) return '';
    const { number: cur, totalPages, totalElements } = page;
    const start = Math.max(0, cur - 2), end = Math.min(totalPages - 1, cur + 2);
    let btns = '';
    if (cur > 0)          btns += `<button onclick="${fnName}(${cur-1})" class="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 text-gray-600">‹</button>`;
    for (let i = start; i <= end; i++)
        btns += `<button onclick="${fnName}(${i})" class="px-3 py-1 text-sm border rounded-lg ${i===cur?'bg-blue-600 text-white border-blue-600':'hover:bg-gray-50 text-gray-600'}">${i+1}</button>`;
    if (cur < totalPages - 1) btns += `<button onclick="${fnName}(${cur+1})" class="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 text-gray-600">›</button>`;
    return `<div class="flex items-center justify-between mt-4 px-1">
        <span class="text-xs text-gray-400">Page ${cur+1} of ${totalPages} &middot; ${totalElements} items</span>
        <div class="flex gap-1">${btns}</div></div>`;
}

function card(content) {
    return `<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">${content}</div>`;
}

function tableHead(...cols) {
    return `<thead class="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide"><tr>${cols.map(c=>`<th class="px-5 py-3 text-left font-semibold">${c}</th>`).join('')}</tr></thead>`;
}

function inputCls(extra = '') {
    return `w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${extra}`;
}

function label(text, required = false) {
    return `<label class="block text-sm font-medium text-gray-700 mb-1.5">${text}${required ? ' <span class="text-red-400">*</span>' : ''}</label>`;
}

// ── Auth ─────────────────────────────────────────────────────
function fillLogin(u, p) {
    $('login-username').value = u;
    $('login-password').value = p;
}

async function doLogin(username, password) {
    const btn = $('login-btn'), err = $('login-error'), errMsg = $('login-error-msg');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in…';
    err.classList.add('hidden');
    try {
        const res = await api.auth.login(username, password);
        const user = res.data;
        localStorage.setItem('lms_user', JSON.stringify(user));
        setToken(user.token);
        state.user = user;
        initApp();
    } catch (e) {
        errMsg.textContent = e.message || 'Invalid credentials';
        err.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }
}

function doLogout() {
    setToken(null);
    localStorage.removeItem('lms_user');
    state.user = null;
    $('app').classList.add('hidden');
    $('login-page').classList.remove('hidden');
    $('login-username').value = '';
    $('login-password').value = '';
    showToast('Signed out', 'info');
}

// ── Router ───────────────────────────────────────────────────
function navigate(page) { window.location.hash = '/' + page; }

function handleRoute() {
    const page = window.location.hash.slice(2) || 'dashboard';
    document.querySelectorAll('.sidebar-item').forEach(el => {
        el.classList.remove('active', 'text-white');
        el.classList.add('text-slate-300');
    });
    const active = document.querySelector(`.sidebar-item[data-page="${page}"]`);
    if (active) { active.classList.add('active', 'text-white'); active.classList.remove('text-slate-300'); }
    const pages = { dashboard: renderDashboard, books: renderBooks, authors: renderAuthors,
                    categories: renderCategories, members: renderMembers, loans: renderLoans,
                    reports: renderReports, audit: renderAuditLogs };
    (pages[page] || renderDashboard)();
}

// ── Dashboard ────────────────────────────────────────────────
async function renderDashboard() {
    setPageTitle('Dashboard', 'Welcome back — here\'s what\'s happening');
    renderLoading();
    try {
        // Books endpoints are public; members/loans require ADMIN or LIBRARIAN
        const baseRequests = [
            api.books.list({ size: 1 }),
            api.books.list({ availableOnly: true, size: 1 })
        ];
        const librarianRequests = isLibrarian() ? [
            api.members.list({ size: 1 }),
            api.loans.list({ size: 1 }),
            api.loans.list({ size: 5, sort: 'id,desc' })
        ] : [];

        const results = await Promise.all([...baseRequests, ...librarianRequests]);
        const [bRes, avRes] = results;
        const tb = bRes.data.totalElements;
        const ab = avRes.data.totalElements;
        const tm     = isLibrarian() ? results[2].data.totalElements : null;
        const tl     = isLibrarian() ? results[3].data.totalElements : null;
        const recent = isLibrarian() ? (results[4].data.content || []) : [];

        renderContent(`
        <div class="space-y-6">
            <div class="grid grid-cols-2 ${isLibrarian()?'lg:grid-cols-4':'lg:grid-cols-2'} gap-4">
                ${statCard('Total Books', tb, 'fa-book', 'blue', `${ab} available`)}
                ${statCard('Available Now', ab, 'fa-check-circle', 'amber', `${tb-ab} checked out`)}
                ${isLibrarian() ? statCard('Members', tm, 'fa-users', 'emerald', 'Registered') : ''}
                ${isLibrarian() ? statCard('Total Loans', tl, 'fa-exchange-alt', 'violet', 'All time') : ''}
            </div>
            <div class="grid ${isLibrarian()?'lg:grid-cols-3':''} gap-4">
                ${isLibrarian() ? `<div class="lg:col-span-2">
                    ${card(`
                        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 class="font-semibold text-gray-700 text-sm">Recent Loans</h2>
                            <button onclick="navigate('loans')" class="text-blue-600 hover:text-blue-700 text-xs font-medium">View all →</button>
                        </div>
                        <div class="overflow-x-auto">
                        <table class="w-full">
                            ${tableHead('Book','Member','Due Date','Status')}
                            <tbody class="divide-y divide-gray-50 text-sm">
                            ${recent.length ? recent.map(l => `<tr class="hover:bg-gray-50">
                                <td class="px-5 py-3 font-medium text-gray-800">${esc(l.bookTitle||'—')}</td>
                                <td class="px-5 py-3 text-gray-500">${esc(l.memberName||'—')}</td>
                                <td class="px-5 py-3 text-gray-500">${l.dueDate||'—'}</td>
                                <td class="px-5 py-3">${statusBadge(l.status)}</td>
                            </tr>`).join('') : `<tr><td colspan="4" class="px-5 py-10 text-center text-gray-300 text-sm">No loans yet</td></tr>`}
                            </tbody>
                        </table></div>`)}
                </div>` : ''}
                <div class="space-y-4">
                    ${card(`<div class="p-5">
                        <h2 class="font-semibold text-gray-700 text-sm mb-4">Quick Actions</h2>
                        <div class="space-y-2">
                            ${isLibrarian() ? quickBtn('Issue a Book','fa-plus','blue','loans') : quickBtn('Browse Books','fa-book','blue','books')}
                            ${isLibrarian() ? quickBtn('Add New Book','fa-book','slate','books') : quickBtn('Browse Authors','fa-pen-nib','slate','authors')}
                            ${isLibrarian() ? quickBtn('Register Member','fa-user-plus','slate','members') : quickBtn('Browse Categories','fa-tags','slate','categories')}
                            ${isLibrarian() ? quickBtn('Download Reports','fa-download','slate','reports') : ''}
                        </div>
                    </div>`)}
                </div>
            </div>
        </div>`);
    } catch (e) {
        renderContent(`<div class="p-4 text-red-500 text-sm">Error loading dashboard: ${e.message}</div>`);
    }
}

function statCard(label, value, icon, color, sub) {
    const bg = { blue:'bg-blue-50', emerald:'bg-emerald-50', violet:'bg-violet-50', amber:'bg-amber-50' };
    const ic = { blue:'text-blue-500', emerald:'text-emerald-500', violet:'text-violet-500', amber:'text-amber-500' };
    return `<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="flex items-start justify-between">
            <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">${label}</p>
                <p class="text-3xl font-bold text-gray-800 mt-1">${value}</p>
            </div>
            <div class="w-10 h-10 ${bg[color]} rounded-xl flex items-center justify-center">
                <i class="fas ${icon} ${ic[color]}"></i>
            </div>
        </div>
        <p class="text-xs text-gray-400 mt-3">${sub}</p>
    </div>`;
}

function quickBtn(text, icon, color, page) {
    const cls = color === 'blue'
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200';
    return `<button onclick="navigate('${page}')" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${cls}">
        <i class="fas ${icon} w-4 text-center"></i>${text}</button>`;
}

function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Books ────────────────────────────────────────────────────
async function renderBooks(page = 0) {
    setPageTitle('Books', 'Search, manage and track the library catalog');
    renderLoading();
    state.bookPage = page;
    try {
        const [authRes, catRes] = await Promise.all([api.authors.list(), api.categories.list()]);
        state._authors    = authRes.data || [];
        state._categories = catRes.data  || [];

        const params = { page, size: 10, sort: 'title,asc', ...state.bookFilters };
        const bRes = await api.books.list(params);
        const pg   = bRes.data;
        state._books = pg.content || [];

        const authOpts = state._authors.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join('');
        const catOpts  = state._categories.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');

        renderContent(`
        <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-2">
                <input id="bk-title" type="text" placeholder="Search title…" value="${esc(state.bookFilters.title||'')}"
                    class="${inputCls('w-44')}">
                <select id="bk-cat" class="${inputCls('w-40')}"><option value="">All Categories</option>${catOpts}</select>
                <select id="bk-auth" class="${inputCls('w-40')}"><option value="">All Authors</option>${authOpts}</select>
                <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                    <input type="checkbox" id="bk-avail" ${state.bookFilters.availableOnly?'checked':''} class="rounded"> Available only
                </label>
                <button onclick="applyBookSearch()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
                    <i class="fas fa-search mr-1.5"></i>Search</button>
                <button onclick="clearBookSearch()" class="px-3 py-2.5 text-gray-500 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors">Clear</button>
                <div class="ml-auto">
                    ${isLibrarian() ? `<button onclick="openAddBook()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                        <i class="fas fa-plus"></i>Add Book</button>` : ''}
                </div>
            </div>
            ${card(`<div class="overflow-x-auto">
            <table class="w-full">
                ${tableHead('Book','Author','Category','Year','Copies',isLibrarian()?'Actions':'')}
                <tbody class="divide-y divide-gray-50 text-sm">
                ${state._books.length ? state._books.map((b,i) => `<tr class="hover:bg-gray-50">
                    <td class="px-5 py-3">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-book text-blue-300 text-xs"></i>
                            </div>
                            <div>
                                <div class="font-medium text-gray-800">${esc(b.title)}</div>
                                <div class="text-gray-400 text-xs">${esc(b.isbn||'')}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-5 py-3 text-gray-500">${esc(b.authorName||'—')}</td>
                    <td class="px-5 py-3 text-gray-500">${esc(b.categoryName||'—')}</td>
                    <td class="px-5 py-3 text-gray-500">${b.publicationYear||'—'}</td>
                    <td class="px-5 py-3">
                        <span class="font-semibold ${b.availableCopies>0?'text-emerald-600':'text-red-400'}">${b.availableCopies}</span>
                        <span class="text-gray-300">/${b.totalCopies}</span>
                    </td>
                    ${isLibrarian() ? `<td class="px-5 py-3"><div class="flex items-center gap-1">
                        <button onclick="openEditBook(${i})" class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><i class="fas fa-edit text-xs"></i></button>
                        <button onclick="openUploadCover(${b.id})" class="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors" title="Upload Cover"><i class="fas fa-image text-xs"></i></button>
                        ${isAdmin() ? `<button onclick="deleteBook(${b.id},'${esc(b.title).replace(/'/g,"\\'")}' )" class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><i class="fas fa-trash text-xs"></i></button>` : ''}
                    </div></td>` : ''}
                </tr>`).join('') : `<tr><td colspan="6" class="px-5 py-14 text-center text-gray-300">No books found</td></tr>`}
                </tbody>
            </table></div>
            <div class="px-5 pb-4">${pagination(pg,'renderBooks')}</div>`)}
        </div>`);

        if (state.bookFilters.categoryId) $('bk-cat').value  = state.bookFilters.categoryId;
        if (state.bookFilters.authorId)   $('bk-auth').value = state.bookFilters.authorId;
    } catch (e) {
        renderContent(`<div class="p-4 text-red-500 text-sm">Error: ${e.message}</div>`);
    }
}

function applyBookSearch() {
    state.bookFilters = {};
    const t = $('bk-title')?.value?.trim();
    const c = $('bk-cat')?.value;
    const a = $('bk-auth')?.value;
    const av = $('bk-avail')?.checked;
    if (t)  state.bookFilters.title       = t;
    if (c)  state.bookFilters.categoryId  = c;
    if (a)  state.bookFilters.authorId    = a;
    if (av) state.bookFilters.availableOnly = true;
    renderBooks(0);
}

function clearBookSearch() { state.bookFilters = {}; renderBooks(0); }

function bookForm(b = null) {
    const authOpts = state._authors.map(a => `<option value="${a.id}" ${b?.authorId==a.id?'selected':''}>${esc(a.name)}</option>`).join('');
    const catOpts  = state._categories.map(c => `<option value="${c.id}" ${b?.categoryId==c.id?'selected':''}>${esc(c.name)}</option>`).join('');
    return `<div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">${label('Title',true)}<input id="f-title" value="${esc(b?.title||'')}" placeholder="Book title" class="${inputCls()}"></div>
        <div>${label('ISBN',true)}<input id="f-isbn" value="${esc(b?.isbn||'')}" placeholder="978-…" class="${inputCls()}"></div>
        <div>${label('Year',true)}<input id="f-year" type="number" value="${b?.publicationYear||new Date().getFullYear()}" min="1500" class="${inputCls()}"></div>
        <div>${label('Author')}<select id="f-author" class="${inputCls()}"><option value="">— Select —</option>${authOpts}</select></div>
        <div>${label('Category')}<select id="f-cat" class="${inputCls()}"><option value="">— Select —</option>${catOpts}</select></div>
        <div>${label('Total Copies',true)}<input id="f-total" type="number" value="${b?.totalCopies??1}" min="0" class="${inputCls()}"></div>
        <div>${label('Available',true)}<input id="f-avail" type="number" value="${b?.availableCopies??1}" min="0" class="${inputCls()}"></div>
        <div class="col-span-2">${label('Description')}<textarea id="f-desc" rows="2" class="${inputCls()}">${esc(b?.description||'')}</textarea></div>
    </div>`;
}

function collectBook() {
    const title = $('f-title')?.value?.trim();
    const isbn  = $('f-isbn')?.value?.trim();
    if (!title || !isbn) { showToast('Title and ISBN are required', 'error'); return null; }
    return {
        title, isbn,
        publicationYear: parseInt($('f-year')?.value) || null,
        authorId:   $('f-author')?.value || null,
        categoryId: $('f-cat')?.value    || null,
        totalCopies:     parseInt($('f-total')?.value) || 0,
        availableCopies: parseInt($('f-avail')?.value) || 0,
        description: $('f-desc')?.value?.trim() || null
    };
}

function openAddBook() {
    showModal('Add New Book', bookForm(), async () => {
        const d = collectBook(); if (!d) return;
        try { await api.books.create(d); closeModal(); showToast('Book added!','success'); renderBooks(state.bookPage); }
        catch (e) { showToast(e.message,'error'); }
    });
}

function openEditBook(idx) {
    const b = state._books[idx];
    showModal('Edit Book', bookForm(b), async () => {
        const d = collectBook(); if (!d) return;
        try { await api.books.update(b.id, d); closeModal(); showToast('Book updated!','success'); renderBooks(state.bookPage); }
        catch (e) { showToast(e.message,'error'); }
    });
}

function openUploadCover(id) {
    showModal('Upload Cover Image',
        `<div class="space-y-3">
            <p class="text-sm text-gray-500">Choose a JPG or PNG image (max 5 MB).</p>
            <input id="f-cover" type="file" accept="image/*" class="${inputCls('file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-blue-600 file:text-white hover:file:bg-blue-700')}">
         </div>`,
        async () => {
            const f = $('f-cover')?.files?.[0];
            if (!f) { showToast('Select a file first','error'); return; }
            try { await api.books.uploadCover(id, f); closeModal(); showToast('Cover uploaded!','success'); renderBooks(state.bookPage); }
            catch (e) { showToast(e.message,'error'); }
        }, 'Upload');
}

function deleteBook(id, title) {
    showDangerModal('Delete Book',
        `<div class="flex gap-4 items-start">
            <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0"><i class="fas fa-trash text-red-400"></i></div>
            <p class="text-sm text-gray-600 pt-2">Delete <strong>${esc(title)}</strong>? This cannot be undone.</p>
         </div>`,
        async () => {
            try { await api.books.delete(id); showToast('Book deleted','success'); renderBooks(state.bookPage); }
            catch (e) { showToast(e.message,'error'); }
        });
}

// ── Authors ──────────────────────────────────────────────────
async function renderAuthors() {
    setPageTitle('Authors', 'Manage authors in the catalog');
    renderLoading();
    try {
        const res = await api.authors.list();
        state._authors = res.data || [];
        renderContent(`
        <div class="space-y-4">
            <div class="flex justify-end">
                ${isLibrarian() ? `<button onclick="openAddAuthor()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                    <i class="fas fa-plus"></i>Add Author</button>` : ''}
            </div>
            ${card(`<table class="w-full">
                ${tableHead('Name','Nationality','Biography',isLibrarian()?'Actions':'')}
                <tbody class="divide-y divide-gray-50 text-sm">
                ${state._authors.length ? state._authors.map((a,i) => `<tr class="hover:bg-gray-50">
                    <td class="px-5 py-3 font-medium text-gray-800">${esc(a.name)}</td>
                    <td class="px-5 py-3 text-gray-500">${esc(a.nationality||'—')}</td>
                    <td class="px-5 py-3 text-gray-400 max-w-xs truncate">${esc(a.biography||'—')}</td>
                    ${isLibrarian() ? `<td class="px-5 py-3"><div class="flex gap-1">
                        <button onclick="openEditAuthor(${i})" class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><i class="fas fa-edit text-xs"></i></button>
                        ${isAdmin() ? `<button onclick="deleteAuthor(${a.id},'${esc(a.name).replace(/'/g,"\\'")}' )" class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><i class="fas fa-trash text-xs"></i></button>` : ''}
                    </div></td>` : ''}
                </tr>`).join('') : `<tr><td colspan="4" class="px-5 py-12 text-center text-gray-300">No authors found</td></tr>`}
                </tbody>
            </table>`)}
        </div>`);
    } catch (e) { renderContent(`<div class="p-4 text-red-500">${e.message}</div>`); }
}

function authorForm(a = null) {
    return `<div class="space-y-4">
        <div>${label('Full Name',true)}<input id="f-name" value="${esc(a?.name||'')}" placeholder="Author name" class="${inputCls()}"></div>
        <div>${label('Nationality')}<input id="f-nat" value="${esc(a?.nationality||'')}" placeholder="e.g. British" class="${inputCls()}"></div>
        <div>${label('Biography')}<textarea id="f-bio" rows="3" class="${inputCls()}">${esc(a?.biography||'')}</textarea></div>
    </div>`;
}

function collectAuthor() {
    const name = $('f-name')?.value?.trim();
    if (!name) { showToast('Name is required','error'); return null; }
    return { name, nationality: $('f-nat')?.value?.trim()||null, biography: $('f-bio')?.value?.trim()||null };
}

function openAddAuthor() {
    showModal('Add Author', authorForm(), async () => {
        const d = collectAuthor(); if (!d) return;
        try { await api.authors.create(d); closeModal(); showToast('Author added!','success'); renderAuthors(); }
        catch (e) { showToast(e.message,'error'); }
    });
}

function openEditAuthor(idx) {
    const a = state._authors[idx];
    showModal('Edit Author', authorForm(a), async () => {
        const d = collectAuthor(); if (!d) return;
        try { await api.authors.update(a.id, d); closeModal(); showToast('Author updated!','success'); renderAuthors(); }
        catch (e) { showToast(e.message,'error'); }
    });
}

function deleteAuthor(id, name) {
    showDangerModal('Delete Author',
        `<div class="flex gap-4 items-start">
            <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0"><i class="fas fa-trash text-red-400"></i></div>
            <p class="text-sm text-gray-600 pt-2">Delete author <strong>${esc(name)}</strong>?</p>
         </div>`,
        async () => {
            try { await api.authors.delete(id); showToast('Author deleted','success'); renderAuthors(); }
            catch (e) { showToast(e.message,'error'); }
        });
}

// ── Categories ───────────────────────────────────────────────
async function renderCategories() {
    setPageTitle('Categories', 'Manage book genres and categories');
    renderLoading();
    try {
        const res = await api.categories.list();
        state._categories = res.data || [];
        renderContent(`
        <div class="space-y-4">
            <div class="flex justify-end">
                ${isLibrarian() ? `<button onclick="openAddCategory()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                    <i class="fas fa-plus"></i>Add Category</button>` : ''}
            </div>
            ${card(`<table class="w-full">
                ${tableHead('Name','Description',isLibrarian()?'Actions':'')}
                <tbody class="divide-y divide-gray-50 text-sm">
                ${state._categories.length ? state._categories.map((c,i) => `<tr class="hover:bg-gray-50">
                    <td class="px-5 py-3 font-medium text-gray-800">${esc(c.name)}</td>
                    <td class="px-5 py-3 text-gray-400">${esc(c.description||'—')}</td>
                    ${isLibrarian() ? `<td class="px-5 py-3"><div class="flex gap-1">
                        <button onclick="openEditCategory(${i})" class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><i class="fas fa-edit text-xs"></i></button>
                        ${isAdmin() ? `<button onclick="deleteCategory(${c.id},'${esc(c.name).replace(/'/g,"\\'")}' )" class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><i class="fas fa-trash text-xs"></i></button>` : ''}
                    </div></td>` : ''}
                </tr>`).join('') : `<tr><td colspan="3" class="px-5 py-12 text-center text-gray-300">No categories found</td></tr>`}
                </tbody>
            </table>`)}
        </div>`);
    } catch (e) { renderContent(`<div class="p-4 text-red-500">${e.message}</div>`); }
}

function categoryForm(c = null) {
    return `<div class="space-y-4">
        <div>${label('Name',true)}<input id="f-name" value="${esc(c?.name||'')}" placeholder="e.g. Science Fiction" class="${inputCls()}"></div>
        <div>${label('Description')}<textarea id="f-desc" rows="3" class="${inputCls()}">${esc(c?.description||'')}</textarea></div>
    </div>`;
}

function openAddCategory() {
    showModal('Add Category', categoryForm(), async () => {
        const name = $('f-name')?.value?.trim();
        if (!name) { showToast('Name is required','error'); return; }
        try { await api.categories.create({ name, description: $('f-desc')?.value?.trim()||null }); closeModal(); showToast('Category added!','success'); renderCategories(); }
        catch (e) { showToast(e.message,'error'); }
    });
}

function openEditCategory(idx) {
    const c = state._categories[idx];
    showModal('Edit Category', categoryForm(c), async () => {
        const name = $('f-name')?.value?.trim();
        if (!name) { showToast('Name is required','error'); return; }
        try { await api.categories.update(c.id, { name, description: $('f-desc')?.value?.trim()||null }); closeModal(); showToast('Category updated!','success'); renderCategories(); }
        catch (e) { showToast(e.message,'error'); }
    });
}

function deleteCategory(id, name) {
    showDangerModal('Delete Category',
        `<div class="flex gap-4 items-start">
            <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0"><i class="fas fa-trash text-red-400"></i></div>
            <p class="text-sm text-gray-600 pt-2">Delete category <strong>${esc(name)}</strong>?</p>
         </div>`,
        async () => {
            try { await api.categories.delete(id); showToast('Category deleted','success'); renderCategories(); }
            catch (e) { showToast(e.message,'error'); }
        });
}

// ── Members ──────────────────────────────────────────────────
async function renderMembers(page = 0) {
    setPageTitle('Members', 'Manage library member accounts');
    renderLoading();
    state.memberPage = page;
    try {
        const params = { page, size: 10, sort: 'fullName,asc', ...state.memberFilters };
        const res = await api.members.list(params);
        const pg  = res.data;
        state._members = pg.content || [];

        renderContent(`
        <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-2">
                <input id="mb-name" type="text" placeholder="Search by name…" value="${esc(state.memberFilters.name||'')}" class="${inputCls('w-52')}">
                <select id="mb-status" class="${inputCls('w-36')}">
                    <option value="">All Status</option>
                    <option value="ACTIVE" ${state.memberFilters.status==='ACTIVE'?'selected':''}>Active</option>
                    <option value="SUSPENDED" ${state.memberFilters.status==='SUSPENDED'?'selected':''}>Suspended</option>
                </select>
                <button onclick="applyMemberSearch()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
                    <i class="fas fa-search mr-1.5"></i>Search</button>
                <button onclick="clearMemberSearch()" class="px-3 py-2.5 text-gray-500 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors">Clear</button>
                <div class="ml-auto">
                    ${isLibrarian() ? `<button onclick="openAddMember()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                        <i class="fas fa-user-plus"></i>Add Member</button>` : ''}
                </div>
            </div>
            ${card(`<div class="overflow-x-auto"><table class="w-full">
                ${tableHead('Member','Email','Phone','Status',isLibrarian()?'Actions':'')}
                <tbody class="divide-y divide-gray-50 text-sm">
                ${state._members.length ? state._members.map((m,i) => `<tr class="hover:bg-gray-50">
                    <td class="px-5 py-3">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                                ${(m.fullName||'?')[0].toUpperCase()}
                            </div>
                            <span class="font-medium text-gray-800">${esc(m.fullName)}</span>
                        </div>
                    </td>
                    <td class="px-5 py-3 text-gray-500">${esc(m.email||'—')}</td>
                    <td class="px-5 py-3 text-gray-500">${esc(m.phone||'—')}</td>
                    <td class="px-5 py-3">${statusBadge(m.status)}</td>
                    ${isLibrarian() ? `<td class="px-5 py-3"><div class="flex gap-1">
                        <button onclick="openEditMember(${i})" class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><i class="fas fa-edit text-xs"></i></button>
                        ${isAdmin() ? `<button onclick="deleteMember(${m.id},'${esc(m.fullName).replace(/'/g,"\\'")}' )" class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><i class="fas fa-trash text-xs"></i></button>` : ''}
                    </div></td>` : ''}
                </tr>`).join('') : `<tr><td colspan="5" class="px-5 py-12 text-center text-gray-300">No members found</td></tr>`}
                </tbody>
            </table></div>
            <div class="px-5 pb-4">${pagination(pg,'renderMembers')}</div>`)}
        </div>`);
    } catch (e) { renderContent(`<div class="p-4 text-red-500">${e.message}</div>`); }
}

function applyMemberSearch() {
    state.memberFilters = {};
    const n = $('mb-name')?.value?.trim();
    const s = $('mb-status')?.value;
    if (n) state.memberFilters.name   = n;
    if (s) state.memberFilters.status = s;
    renderMembers(0);
}
function clearMemberSearch() { state.memberFilters = {}; renderMembers(0); }

function memberForm(m = null) {
    return `<div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">${label('Full Name',true)}<input id="f-fullname" value="${esc(m?.fullName||'')}" class="${inputCls()}"></div>
            <div>${label('Email',true)}<input id="f-email" type="email" value="${esc(m?.email||'')}" class="${inputCls()}"></div>
            <div>${label('Phone',true)}<input id="f-phone" value="${esc(m?.phone||'')}" class="${inputCls()}"></div>
            <div class="col-span-2">${label('Address')}<input id="f-addr" value="${esc(m?.address||'')}" class="${inputCls()}"></div>
            <div class="col-span-2">${label('Status')}
                <select id="f-status" class="${inputCls()}">
                    <option value="ACTIVE"     ${(!m||m.status==='ACTIVE')    ?'selected':''}>Active</option>
                    <option value="SUSPENDED"  ${m?.status==='SUSPENDED'?'selected':''}>Suspended</option>
                </select>
            </div>
        </div>
    </div>`;
}

function collectMember() {
    const fullName = $('f-fullname')?.value?.trim();
    const email    = $('f-email')?.value?.trim();
    const phone    = $('f-phone')?.value?.trim();
    if (!fullName || !email || !phone) { showToast('Name, email and phone are required','error'); return null; }
    return { fullName, email, phone, address: $('f-addr')?.value?.trim()||null, status: $('f-status')?.value||'ACTIVE' };
}

function openAddMember() {
    showModal('Add Member', memberForm(), async () => {
        const d = collectMember(); if (!d) return;
        try { await api.members.create(d); closeModal(); showToast('Member added!','success'); renderMembers(state.memberPage); }
        catch (e) { showToast(e.message,'error'); }
    });
}

function openEditMember(idx) {
    const m = state._members[idx];
    showModal('Edit Member', memberForm(m), async () => {
        const d = collectMember(); if (!d) return;
        try { await api.members.update(m.id, d); closeModal(); showToast('Member updated!','success'); renderMembers(state.memberPage); }
        catch (e) { showToast(e.message,'error'); }
    });
}

function deleteMember(id, name) {
    showDangerModal('Delete Member',
        `<div class="flex gap-4 items-start">
            <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0"><i class="fas fa-trash text-red-400"></i></div>
            <p class="text-sm text-gray-600 pt-2">Delete member <strong>${esc(name)}</strong>?</p>
         </div>`,
        async () => {
            try { await api.members.delete(id); showToast('Member deleted','success'); renderMembers(state.memberPage); }
            catch (e) { showToast(e.message,'error'); }
        });
}

// ── Loans ────────────────────────────────────────────────────
async function renderLoans(page = 0) {
    setPageTitle('Loans', 'Issue and manage book loans');
    renderLoading();
    state.loanPage = page;
    try {
        const res = await api.loans.list({ page, size: 10, sort: 'id,desc' });
        const pg   = res.data;
        const loans = pg.content || [];

        renderContent(`
        <div class="space-y-4">
            <div class="flex justify-end">
                ${isLibrarian() ? `<button onclick="openIssueLoan()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                    <i class="fas fa-plus"></i>Issue Loan</button>` : ''}
            </div>
            ${card(`<div class="overflow-x-auto"><table class="w-full">
                ${tableHead('Book','Member','Issue','Due','Returned','Status','Fine',isLibrarian()?'Actions':'')}
                <tbody class="divide-y divide-gray-50 text-sm">
                ${loans.length ? loans.map(l => `<tr class="hover:bg-gray-50">
                    <td class="px-5 py-3 font-medium text-gray-800">${esc(l.bookTitle||'—')}</td>
                    <td class="px-5 py-3 text-gray-500">${esc(l.memberName||'—')}</td>
                    <td class="px-5 py-3 text-gray-400 text-xs">${l.issueDate||'—'}</td>
                    <td class="px-5 py-3 text-gray-400 text-xs">${l.dueDate||'—'}</td>
                    <td class="px-5 py-3 text-gray-400 text-xs">${l.returnDate||'—'}</td>
                    <td class="px-5 py-3">${statusBadge(l.status)}</td>
                    <td class="px-5 py-3 ${l.fineAmount>0?'text-red-500 font-semibold':'text-gray-300'}">
                        ${l.fineAmount>0?'$'+l.fineAmount.toFixed(2):'—'}
                    </td>
                    ${isLibrarian() ? `<td class="px-5 py-3">
                        ${(l.status==='ACTIVE'||l.status==='OVERDUE') ? `
                        <button onclick="confirmReturn(${l.id})" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors">
                            <i class="fas fa-undo-alt mr-1"></i>Return</button>` : `<span class="text-gray-200 text-xs">—</span>`}
                    </td>` : ''}
                </tr>`).join('') : `<tr><td colspan="8" class="px-5 py-12 text-center text-gray-300">No loans yet</td></tr>`}
                </tbody>
            </table></div>
            <div class="px-5 pb-4">${pagination(pg,'renderLoans')}</div>`)}
        </div>`);
    } catch (e) { renderContent(`<div class="p-4 text-red-500">${e.message}</div>`); }
}

async function openIssueLoan() {
    try {
        const [bRes, mRes] = await Promise.all([
            api.books.list({ availableOnly: true, size: 200 }),
            api.members.list({ status: 'ACTIVE', size: 200 })
        ]);
        const books   = bRes.data.content || [];
        const members = mRes.data.content || [];

        const bOpts = books.map(b   => `<option value="${b.id}">${esc(b.title)} (${b.availableCopies} avail.)</option>`).join('');
        const mOpts = members.map(m => `<option value="${m.id}">${esc(m.fullName)} — ${esc(m.email)}</option>`).join('');

        showModal('Issue New Loan',
            `<div class="space-y-4">
                <div>${label('Book',true)}
                    <select id="f-book" class="${inputCls()}"><option value="">— Select a book —</option>${bOpts}</select>
                </div>
                <div>${label('Member',true)}
                    <select id="f-member" class="${inputCls()}"><option value="">— Select a member —</option>${mOpts}</select>
                </div>
                <p class="text-xs text-gray-400"><i class="fas fa-info-circle mr-1"></i>Due date is automatically set to 14 days from today.</p>
             </div>`,
            async () => {
                const bid = $('f-book')?.value;
                const mid = $('f-member')?.value;
                if (!bid || !mid) { showToast('Select a book and member','error'); return; }
                try {
                    await api.loans.issue({ bookId: parseInt(bid), memberId: parseInt(mid) });
                    closeModal(); showToast('Book issued successfully!','success'); renderLoans(state.loanPage);
                } catch (e) { showToast(e.message,'error'); }
            }, 'Issue Book');
    } catch (e) { showToast('Failed to load data: ' + e.message, 'error'); }
}

async function confirmReturn(id) {
    try {
        const res = await api.loans.get(id);
        const l   = res.data;
        showModal('Return Book',
            `<div class="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-gray-400">Book</span><span class="font-medium">${esc(l.bookTitle)}</span></div>
                <div class="flex justify-between"><span class="text-gray-400">Member</span><span class="font-medium">${esc(l.memberName)}</span></div>
                <div class="flex justify-between"><span class="text-gray-400">Issue Date</span><span>${l.issueDate}</span></div>
                <div class="flex justify-between"><span class="text-gray-400">Due Date</span><span class="${new Date(l.dueDate)<new Date()?'text-red-500 font-semibold':''}">${l.dueDate}</span></div>
             </div>
             <p class="text-sm text-gray-500 mt-3">Confirm return? Fines are calculated automatically for overdue books.</p>`,
            async () => {
                try {
                    const r = await api.loans.return(id);
                    closeModal();
                    const fine = r.data?.fineAmount;
                    showToast(fine > 0 ? `Returned. Fine: $${fine.toFixed(2)}` : 'Book returned!', fine > 0 ? 'warning' : 'success');
                    renderLoans(state.loanPage);
                } catch (e) { showToast(e.message,'error'); }
            }, 'Confirm Return');
    } catch (e) { showToast(e.message,'error'); }
}

// ── Reports ──────────────────────────────────────────────────
function renderReports() {
    setPageTitle('Reports', 'Export data for analysis');
    renderContent(`
    <div class="grid md:grid-cols-2 gap-6 max-w-2xl">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div class="flex gap-4">
                <div class="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-file-pdf text-red-400 text-xl"></i>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-800">Loans Report</h3>
                    <p class="text-sm text-gray-400 mt-1 mb-4">All loans with member info, dates, status and fines — formatted PDF.</p>
                    <button onclick="downloadReport('pdf')" id="pdf-btn"
                        class="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">
                        <i class="fas fa-download"></i>Download PDF
                    </button>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div class="flex gap-4">
                <div class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-file-csv text-emerald-500 text-xl"></i>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-800">Books Inventory</h3>
                    <p class="text-sm text-gray-400 mt-1 mb-4">Full catalog with ISBN, author, category, and copy counts — CSV spreadsheet.</p>
                    <button onclick="downloadReport('csv')" id="csv-btn"
                        class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
                        <i class="fas fa-download"></i>Download CSV
                    </button>
                </div>
            </div>
        </div>
    </div>`);
}

async function downloadReport(type) {
    const btn = $(type + '-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating…'; }
    try {
        const response = type === 'pdf' ? await api.reports.loansPdf() : await api.reports.booksCsv();
        if (!response.ok) { const d = await response.json().catch(()=>({})); throw new Error(d.message||'Download failed'); }
        const blob = await response.blob();
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement('a'), { href: url, download: type==='pdf'?'loans_report.pdf':'books_report.csv' });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(type.toUpperCase() + ' report downloaded!', 'success');
    } catch (e) {
        showToast('Download failed: ' + e.message, 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fas fa-download"></i> Download ${type.toUpperCase()}`; }
    }
}

// ── Audit Logs ───────────────────────────────────────────────
async function renderAuditLogs(page = 0) {
    setPageTitle('Audit Logs', 'Complete system activity trail');
    renderLoading();
    state.auditPage = page;
    try {
        const res  = await api.auditLogs.list({ page, size: 15, sort: 'id,desc' });
        const pg   = res.data;
        const logs = pg.content || [];

        renderContent(`
        ${card(`<div class="overflow-x-auto"><table class="w-full">
            ${tableHead('Action','Entity / Details','Performed By','Timestamp')}
            <tbody class="divide-y divide-gray-50 text-sm">
            ${logs.length ? logs.map(l => `<tr class="hover:bg-gray-50">
                <td class="px-5 py-3">${actionBadge(l.action||'—')}</td>
                <td class="px-5 py-3 text-gray-500 max-w-xs">
                    <div class="font-medium text-gray-700">${esc(l.entityName||'—')}</div>
                    <div class="text-xs text-gray-400 truncate">${esc(l.details||'')}</div>
                </td>
                <td class="px-5 py-3 text-gray-500">${esc(l.username||'—')}</td>
                <td class="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">${l.timestamp ? new Date(l.timestamp).toLocaleString() : '—'}</td>
            </tr>`).join('') : `<tr><td colspan="4" class="px-5 py-12 text-center text-gray-300">No audit logs found</td></tr>`}
            </tbody>
        </table></div>
        <div class="px-5 pb-4">${pagination(pg,'renderAuditLogs')}</div>`)}
        `);
    } catch (e) { renderContent(`<div class="p-4 text-red-500">${e.message}</div>`); }
}

// ── App Init ─────────────────────────────────────────────────
function initApp() {
    $('login-page').classList.add('hidden');
    $('app').classList.remove('hidden');

    const u = state.user;
    if (u) {
        $('sidebar-username').textContent = u.username;
        $('sidebar-role').textContent     = (u.role||'').replace(/^ROLE_/,'');
        $('sidebar-avatar').textContent   = (u.username||'U')[0].toUpperCase();
    }

    if (!isAdmin()) {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
    }
    if (!isLibrarian()) {
        document.querySelectorAll('.librarian-only').forEach(el => el.classList.add('hidden'));
    }

    $('header-date').textContent = new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });

    window.addEventListener('hashchange', handleRoute);
    if (!window.location.hash || window.location.hash === '#/') {
        window.location.hash = '/dashboard';
    } else {
        handleRoute();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Login form
    $('login-form').addEventListener('submit', e => {
        e.preventDefault();
        const u = $('login-username').value.trim();
        const p = $('login-password').value;
        if (u && p) doLogin(u, p);
    });

    // Logout
    $('logout-btn').addEventListener('click', doLogout);

    // Close modal on overlay click
    $('modal-overlay').addEventListener('click', e => {
        if (e.target === $('modal-overlay')) closeModal();
    });

    // Resume session if token exists
    const token = getToken();
    if (token && state.user) {
        initApp();
    }
    // Login page is shown by default (not hidden in HTML)
});
