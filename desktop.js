/* ─────────────────────────────────────────────────────────
   LEDGER — DESKTOP JS
   Same Firebase project as mobile. Bento dashboard renderer.
   ───────────────────────────────────────────────────────── */

// ── Firebase (same config as mobile) ──
const firebaseConfig = {
  apiKey: "AIzaSyDsG05Ps-qmlCs3INEdgHQNTkp5uIVrYMU",
  authDomain: "ledger-app-565d2.firebaseapp.com",
  projectId: "ledger-app-565d2",
  storageBucket: "ledger-app-565d2.firebasestorage.app",
  messagingSenderId: "400710691366",
  appId: "1:400710691366:web:0dd3a1b0269b9cc5efd4e7"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ── Constants (mirrored from app.js) ──
const CURRENCIES = {
  BDT: { s: '৳' }, USD: { s: '$' }, EUR: { s: '€' }, GBP: { s: '£' }, INR: { s: '₹' },
  JPY: { s: '¥' }, AUD: { s: 'A$' }, CAD: { s: 'C$' }, SGD: { s: 'S$' }
};
const CATS = {
  income: ['Salary', 'Freelance', 'Investment', 'Bonus', 'Gift', 'Refund', 'Other'],
  expense: ['Food & Dining', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Travel', 'Rent', 'Other']
};
const CAT_ICONS = {
  'Salary': '💼', 'Freelance': '💻', 'Investment': '📈', 'Bonus': '🎁', 'Gift': '🎀', 'Refund': '↩️',
  'Food & Dining': '🍽️', 'Transport': '🚗', 'Shopping': '🛍️', 'Bills': '📄', 'Health': '🏥',
  'Entertainment': '🎬', 'Education': '📚', 'Travel': '✈️', 'Rent': '🏠', 'Other': '📌'
};
const CAT_COLORS = ['#7c5cff', '#f472b6', '#38bdf8', '#30d158', '#ffd24d', '#ff5470', '#a78bfa', '#facc15', '#06b6d4', '#fb923c'];

// ── State ──
let dState = {
  uid: null, user: '', email: '',
  currency: 'BDT', baseCurrency: 'BDT',
  darkMode: true,
  profilePhoto: '',
  members: [], wallets: [], goals: [], budgets: [], debts: [],
  transactions: [],
  view: 'dashboard',
  isReg: false,
  currentType: 'expense', selectedCat: '', editId: null
};
let dUnsubTxs = null;
let dSparkChart = null, dPieChart = null;

// ── Helpers ──
function dFmt(amount) {
  const sym = CURRENCIES[dState.currency]?.s || '';
  const v = Math.abs(amount);
  const formatted = v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (amount < 0 ? '-' : '') + sym + formatted;
}
function dEsc(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t]));
}
function dToast(msg) {
  const t = document.getElementById('dToast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}
// Live wallet balance including transfers (matches mobile)
function dWalletBalance(walletId) {
  const w = dState.wallets.find(x => x.id === walletId);
  if (!w) return 0;
  let bal = w.initialBalance || 0;
  dState.transactions.forEach(t => {
    if (t.type === 'transfer') {
      if (t.walletId === walletId) bal -= (t.amount || 0);
      if (t.toWalletId === walletId) bal += (t.amount || 0);
    } else if (t.walletId === walletId) {
      bal += t.type === 'income' ? (t.amount || 0) : -(t.amount || 0);
    }
  });
  return bal;
}

function dMemberName(id) {
  const m = dState.members.find(x => x.id === id);
  return m ? m.name : '—';
}
function dMemberPill(id) {
  const m = dState.members.find(x => x.id === id);
  if (!m) return '<span style="color:var(--d-text3)">—</span>';
  const initial = (m.name[0] || '?').toUpperCase();
  return `<span class="d-member-pill"><span class="d-member-dot">${dEsc(initial)}</span>${dEsc(m.name)}</span>`;
}

function dGreetingText() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Auth ──
function dToggleAuthMode() {
  dState.isReg = !dState.isReg;
  document.getElementById('dAuthHeading').textContent = dState.isReg ? 'Create your account' : 'Welcome back';
  document.getElementById('dAuthLead').textContent = dState.isReg
    ? 'Start tracking your finances in seconds.'
    : 'Sign in to access your dashboard.';
  document.getElementById('dAuthBtn').textContent = dState.isReg ? 'Create Account' : 'Sign In';
  document.getElementById('dAuthNameWrap').style.display = dState.isReg ? 'block' : 'none';
  document.getElementById('dAuthCurrencyWrap').style.display = dState.isReg ? 'block' : 'none';
  document.getElementById('dAuthToggleText').textContent = dState.isReg ? 'Already have an account?' : 'New here?';
  document.getElementById('dAuthToggleBtn').textContent = dState.isReg ? 'Sign in' : 'Create account';
}

async function dHandleAuth() {
  const email = document.getElementById('dEmail').value.trim();
  const pass = document.getElementById('dPassword').value;
  if (!email || !pass) { dToast('Email & password required'); return; }
  const btn = document.getElementById('dAuthBtn');
  btn.disabled = true;
  const origText = btn.textContent;
  btn.textContent = 'Please wait…';
  try {
    if (dState.isReg) {
      const name = document.getElementById('dName').value.trim() || 'User';
      const cur = document.getElementById('dCurrency').value;
      const cred = await auth.createUserWithEmailAndPassword(email, pass);
      await cred.user.updateProfile({ displayName: name });
      await db.collection('users').doc(cred.user.uid).set({
        currency: cur, darkMode: true, profilePhoto: '',
        members: [{ id: 'm_default', name }],
        wallets: [{ id: 'w_default', name: 'Cash', type: 'Cash', memberId: 'm_default', initialBalance: 0 }],
        goals: [], budgets: [], recurring: [], debts: [], noteBooks: [], notes: []
      });
    } else {
      await auth.signInWithEmailAndPassword(email, pass);
    }
  } catch (err) {
    dToast(err.message || 'Authentication failed');
    btn.disabled = false;
    btn.textContent = origText;
  }
}

async function dGoogleAuth() {
  const p = new firebase.auth.GoogleAuthProvider();
  try {
    const c = await auth.signInWithPopup(p);
    const ds = await db.collection('users').doc(c.user.uid).get();
    if (!ds.exists) {
      await db.collection('users').doc(c.user.uid).set({
        currency: 'BDT', darkMode: true, profilePhoto: '',
        members: [{ id: 'm_default', name: c.user.displayName || 'User' }],
        wallets: [{ id: 'w_default', name: 'Cash', type: 'Cash', memberId: 'm_default', initialBalance: 0 }],
        goals: [], budgets: [], recurring: [], debts: [], noteBooks: [], notes: []
      });
    }
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') dToast(err.message || 'Google sign-in failed');
  }
}

function dLogout() {
  if (confirm('Sign out of Ledger?')) auth.signOut();
}

// ── Auth listener ──
auth.onAuthStateChanged(async user => {
  const loading = document.getElementById('dLoading');
  if (user) {
    dState.uid = user.uid;
    dState.user = user.displayName || user.email || 'User';
    dState.email = user.email || '';
    const snap = await db.collection('users').doc(user.uid).get();
    if (snap.exists) {
      const d = snap.data();
      dState.baseCurrency = d.currency || 'BDT';
      dState.currency = d.displayCurrency || dState.baseCurrency;
      dState.darkMode = d.darkMode !== undefined ? d.darkMode : true;
      dState.profilePhoto = d.profilePhoto || '';
      dState.members = d.members || [];
      dState.wallets = d.wallets || [];
      dState.goals = d.goals || [];
      dState.budgets = d.budgets || [];
      dState.debts = d.debts || [];
    }
    dApplyTheme();
    dShowApp();
    loading.style.display = 'none';
    dUnsubTxs = db.collection('transactions').where('uid', '==', user.uid).onSnapshot(snap => {
      const txs = [];
      snap.forEach(doc => txs.push({ id: doc.id, ...doc.data() }));
      txs.sort((a, b) => {
        const dd = new Date(b.date) - new Date(a.date);
        if (dd !== 0) return dd;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      dState.transactions = txs;
      dRenderAll();
    });
  } else {
    if (dUnsubTxs) { dUnsubTxs(); dUnsubTxs = null; }
    dState.uid = null; dState.transactions = [];
    loading.style.display = 'none';
    document.getElementById('dApp').style.display = 'none';
    document.getElementById('dAuth').style.display = 'flex';
  }
});

// ── App show ──
function dShowApp() {
  document.getElementById('dAuth').style.display = 'none';
  document.getElementById('dApp').style.display = 'grid';
  document.getElementById('dGreeting').textContent = dGreetingText() + ', ' + (dState.user.split(' ')[0] || 'there');
  document.getElementById('dUserName').textContent = dState.user;
  document.getElementById('dUserEmail').textContent = dState.email;
  const av = document.getElementById('dUserAvatar');
  if (dState.profilePhoto) {
    av.style.backgroundImage = `url(${dState.profilePhoto})`;
    av.textContent = '';
  } else {
    av.style.backgroundImage = '';
    av.textContent = (dState.user[0] || 'U').toUpperCase();
  }
}

// ── Theme ──
function dApplyTheme() {
  document.body.classList.toggle('d-light', !dState.darkMode);
  document.getElementById('dThemeIcon').textContent = dState.darkMode ? 'light_mode' : 'dark_mode';
}
function dToggleTheme() {
  dState.darkMode = !dState.darkMode;
  dApplyTheme();
  if (dState.uid) db.collection('users').doc(dState.uid).set({ darkMode: dState.darkMode }, { merge: true });
  // Re-render charts so colors update
  dRenderCharts();
}

// ── Navigation ──
function dNav(view) {
  dState.view = view;
  document.querySelectorAll('.d-nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
  document.querySelectorAll('.d-view').forEach(v => v.classList.toggle('active', v.id === 'dView-' + view));
  const titles = {
    dashboard: 'Dashboard', transactions: 'Transactions', wallets: 'Wallets',
    analytics: 'Analytics', goals: 'Goals', debts: 'Debts', settings: 'Settings'
  };
  document.getElementById('dPageTitle').textContent = titles[view] || 'Dashboard';
}

// ── Stats compute ──
// No-wallet balance: income/expense/transfers on transactions without a walletId
function dNoWalletBalance() {
  const txs = dState.transactions;
  const inc = txs.filter(t => t.type === 'income' && !t.walletId).reduce((s, t) => s + (t.amount || 0), 0);
  const exp = txs.filter(t => t.type === 'expense' && !t.walletId).reduce((s, t) => s + (t.amount || 0), 0);
  const transOut = txs.filter(t => t.type === 'transfer' && !t.walletId).reduce((s, t) => s + (t.amount || 0), 0);
  const transIn = txs.filter(t => t.type === 'transfer' && !t.toWalletId).reduce((s, t) => s + (t.amount || 0), 0);
  return inc - exp - transOut + transIn;
}

function dStats() {
  const now = new Date();
  const m = now.getMonth(), y = now.getFullYear();
  const monthTxs = dState.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === m && d.getFullYear() === y;
  });
  const inc = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const exp = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);

  // Calculate total balance matching mobile: sum of all wallet live balances + no-wallet balance
  const totalAllWallets = (dState.wallets || []).reduce((sum, w) => sum + dWalletBalance(w.id), 0);
  const balance = totalAllWallets + dNoWalletBalance();

  const totalInc = dState.transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExp = dState.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  return { monthTxs, inc, exp, balance, totalInc, totalExp };
}

// ── Renderers ──
function dRenderAll() {
  dRenderHero();
  dRenderRecent();
  dRenderWalletsQuick();
  dRenderGoals();
  dRenderInsight();
  dRenderCharts();
}

function dRenderHero() {
  const { inc, exp, balance } = dStats();
  document.getElementById('dTotalBalance').textContent = dFmt(balance);
  document.getElementById('dIncome').textContent = dFmt(inc);
  document.getElementById('dExpense').textContent = dFmt(exp);
  document.getElementById('dWalletCount').textContent = dState.wallets.length;
  document.getElementById('dTxCount').textContent = dState.transactions.length;
  const net = inc - exp;
  document.getElementById('dNetFlow').textContent = (net >= 0 ? '+' : '') + dFmt(net).replace('-', '');
  document.getElementById('dNetFlowSub').textContent = net >= 0 ? 'Positive flow' : 'Negative flow';
  const rate = inc > 0 ? Math.max(0, Math.round(((inc - exp) / inc) * 100)) : 0;
  document.getElementById('dSavingsRate').textContent = rate + '%';
  document.getElementById('dSavingsBar').style.width = Math.min(100, Math.max(0, rate)) + '%';
  const trendEl = document.getElementById('dBalanceTrend');
  if (net >= 0) { trendEl.textContent = '↑ This month'; trendEl.classList.remove('down'); }
  else { trendEl.textContent = '↓ This month'; trendEl.classList.add('down'); }
}

function dRenderRecent() {
  const list = document.getElementById('dRecentTx');
  const recent = dState.transactions.slice(0, 8);
  if (!recent.length) {
    list.innerHTML = `<div class="d-empty"><span class="mi">inbox</span><div>No transactions yet. Click "+ Add" to start tracking.</div></div>`;
    return;
  }
  list.innerHTML = recent.map(t => {
    const dt = new Date(t.date);
    const dtStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (t.type === 'transfer') {
      const fromW = dState.wallets.find(w => w.id === t.walletId);
      const toW = dState.wallets.find(w => w.id === t.toWalletId);
      return `
        <div class="d-tx-row" onclick="dDeleteTransfer('${t.id}')">
          <div class="d-tx-icon" style="background:rgba(56,189,248,0.15);color:#38bdf8"><span class="mi">sync_alt</span></div>
          <div class="d-tx-meta">
            <div class="d-tx-cat">Wallet Transfer</div>
            <div class="d-tx-note">${dEsc((fromW?.name) || '?')} → ${dEsc((toW?.name) || '?')}${t.note ? ' · ' + dEsc(t.note) : ''}</div>
          </div>
          <div class="d-tx-amount" style="color:#38bdf8">${dFmt(t.amount || 0).replace('-', '')}</div>
          <div class="d-tx-date">${dtStr}</div>
        </div>`;
    }
    const icon = CAT_ICONS[t.category] || '📌';
    const memName = dMemberName(t.memberId);
    const subParts = [];
    if (t.note) subParts.push(dEsc(t.note));
    if (memName && memName !== '—') subParts.push(dEsc(memName));
    return `
      <div class="d-tx-row" onclick="dOpenEditTx('${t.id}')">
        <div class="d-tx-icon ${t.type}">${icon}</div>
        <div class="d-tx-meta">
          <div class="d-tx-cat">${dEsc(t.category || 'Other')}</div>
          <div class="d-tx-note">${subParts.join(' · ') || '—'}</div>
        </div>
        <div class="d-tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${dFmt(t.amount || 0).replace('-', '')}</div>
        <div class="d-tx-date">${dtStr}</div>
      </div>`;
  }).join('');
}

function dRenderWalletsQuick() {
  const list = document.getElementById('dWalletQuick');
  if (!dState.wallets.length) {
    list.innerHTML = `<div class="d-empty"><span class="mi">account_balance_wallet</span><div>No wallets yet</div></div>`;
    return;
  }
  list.innerHTML = dState.wallets.slice(0, 6).map((w, i) => {
    const bal = dWalletBalance(w.id);
    const colors = [
      'linear-gradient(135deg,#7c5cff,#a78bfa)',
      'linear-gradient(135deg,#30d158,#00a844)',
      'linear-gradient(135deg,#ff5470,#ec4899)',
      'linear-gradient(135deg,#ffd24d,#ff9500)',
      'linear-gradient(135deg,#38bdf8,#0ea5e9)',
      'linear-gradient(135deg,#f472b6,#ec4899)'
    ];
    return `
      <div class="d-wallet-row">
        <div class="d-wallet-color" style="background:${colors[i % colors.length]}"></div>
        <div class="d-wallet-info">
          <div class="d-wallet-name">${dEsc(w.name)}</div>
          <div class="d-wallet-type">${dEsc(w.type)}</div>
        </div>
        <div class="d-wallet-bal">${dFmt(bal)}</div>
      </div>`;
  }).join('');
}

function dRenderGoals() {
  const list = document.getElementById('dGoalsQuick');
  if (!dState.goals.length) {
    list.innerHTML = `<div class="d-empty"><span class="mi">flag</span><div>No active goals. Set a target to start saving.</div></div>`;
    return;
  }
  list.innerHTML = dState.goals.slice(0, 3).map(g => {
    const pct = g.target > 0 ? Math.min(100, Math.round(((g.current || 0) / g.target) * 100)) : 0;
    return `
      <div class="d-goal-row">
        <div class="d-goal-head">
          <span>${dEsc(g.name || 'Goal')}</span>
          <span class="d-goal-pct">${pct}%</span>
        </div>
        <div class="d-progress"><div class="d-progress-bar" style="width:${pct}%"></div></div>
        <div class="d-stat-sub" style="margin-top:8px">${dFmt(g.current || 0)} of ${dFmt(g.target || 0)}</div>
      </div>`;
  }).join('');
}

function dRenderInsight() {
  const { inc, exp, monthTxs } = dStats();
  let msg;
  if (!dState.transactions.length) {
    msg = 'Add a few transactions to unlock personalized insights about your spending.';
  } else if (exp === 0) {
    msg = `You haven't logged any expenses this month. ${inc > 0 ? `You've earned ${dFmt(inc)} so far.` : ''}`;
  } else if (inc > exp) {
    const saved = inc - exp;
    msg = `Great work! You're saving ${dFmt(saved)} this month — ${Math.round((saved / inc) * 100)}% of your income.`;
  } else {
    const over = exp - inc;
    msg = `Heads up: you've spent ${dFmt(over)} more than you've earned this month. Time to review the budget.`;
  }
  // Top category
  const catMap = {};
  monthTxs.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + (t.amount || 0);
  });
  const top = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
  if (top) msg += ` Your biggest expense category is ${top[0]} (${dFmt(top[1])}).`;
  document.getElementById('dInsightText').textContent = msg;
}

// ── Charts ──
function dRenderCharts() {
  dRenderSparkChart();
  dRenderPieChart();
}

function dRenderSparkChart() {
  const canvas = document.getElementById('dSparkChart');
  if (!canvas || !window.Chart) return;
  // Last 14 days running balance
  const days = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    days.push(d);
  }
  let running = (dState.wallets || []).reduce((s, w) => s + (w.initialBalance || 0), 0);
  // running balance at start of window (transfers between wallets are zero-sum for total balance)
  const startStr = days[0].toISOString().slice(0, 10);
  dState.transactions.forEach(t => {
    if (t.date < startStr) {
      if (t.type === 'income') running += (t.amount || 0);
      else if (t.type === 'expense') running -= (t.amount || 0);
      // transfers don't change total balance (zero-sum between wallets)
    }
  });
  // Also add no-wallet balance from transactions before the window that have no walletId
  // (these are already included in the running calc above since we count ALL income/expense)
  const data = days.map(d => {
    const ds = d.toISOString().slice(0, 10);
    const dayTxs = dState.transactions.filter(t => t.date === ds);
    dayTxs.forEach(t => {
      if (t.type === 'income') running += (t.amount || 0);
      else if (t.type === 'expense') running -= (t.amount || 0);
      // transfers don't change total balance
    });
    return running;
  });
  if (dSparkChart) dSparkChart.destroy();
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 100);
  grad.addColorStop(0, 'rgba(124,92,255,0.45)');
  grad.addColorStop(1, 'rgba(124,92,255,0.0)');
  dSparkChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days.map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        data, borderColor: '#a78bfa', borderWidth: 2,
        backgroundColor: grad, fill: true, tension: 0.4,
        pointRadius: 0, pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a2e', borderColor: '#7c5cff', borderWidth: 1, padding: 8, displayColors: false } },
      scales: { x: { display: false }, y: { display: false } }
    }
  });
}

function dRenderPieChart() {
  const canvas = document.getElementById('dPieChart');
  const legend = document.getElementById('dCatLegend');
  if (!canvas || !window.Chart) return;
  const { monthTxs } = dStats();
  const catMap = {};
  monthTxs.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category || 'Other'] = (catMap[t.category || 'Other'] || 0) + (t.amount || 0);
  });
  const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (dPieChart) dPieChart.destroy();
  if (!entries.length) {
    legend.innerHTML = `<div class="d-empty" style="padding:20px"><span class="mi">pie_chart</span><div>No expenses this month</div></div>`;
    canvas.style.display = 'none';
    return;
  }
  canvas.style.display = '';
  const labels = entries.map(e => e[0]);
  const data = entries.map(e => e[1]);
  const colors = CAT_COLORS.slice(0, labels.length);
  dPieChart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a2e', borderColor: '#7c5cff', borderWidth: 1, padding: 8 } }
    }
  });
  const total = data.reduce((s, v) => s + v, 0);
  legend.innerHTML = entries.map((e, i) => `
    <div class="d-cat-item">
      <span class="l"><span class="dot" style="background:${colors[i]}"></span>${dEsc(e[0])}</span>
      <b>${total ? Math.round((e[1] / total) * 100) : 0}%</b>
    </div>
  `).join('');
}

// ── Add Transaction Modal ──
function dOpenAdd(type) {
  dState.currentType = type || 'expense';
  dState.selectedCat = '';
  document.getElementById('dAmount').value = '';
  document.getElementById('dNote').value = '';
  document.getElementById('dDate').value = new Date().toISOString().slice(0, 10);
  dSetType(dState.currentType);
  // populate members (default to first)
  const mSel = document.getElementById('dMember');
  mSel.innerHTML = dState.members.length
    ? dState.members.map(m => `<option value="${dEsc(m.id)}">${dEsc(m.name)}</option>`).join('')
    : '<option value="">No members — add one in Settings</option>';
  dUpdateWalletDropdown();
  document.getElementById('dAddModal').classList.add('open');
}

function dUpdateWalletDropdown() {
  const mId = document.getElementById('dMember').value;
  const wSel = document.getElementById('dWallet');
  const wallets = mId ? dState.wallets.filter(w => w.memberId === mId) : dState.wallets;
  wSel.innerHTML = '<option value="">No wallet</option>' +
    wallets.map(w => `<option value="${dEsc(w.id)}">${dEsc(w.name)} (${dEsc(w.type)})</option>`).join('');
}
function dCloseAdd() {
  document.getElementById('dAddModal').classList.remove('open');
}
function dSetType(type) {
  dState.currentType = type;
  document.getElementById('dAddTitle').textContent = type === 'income' ? 'Add Income' : 'Add Expense';
  document.querySelectorAll('.d-seg-btn').forEach(b => b.classList.toggle('active', b.dataset.type === type));
  dRenderCatChips();
}
function dRenderCatChips() {
  const wrap = document.getElementById('dCatChips');
  const cats = CATS[dState.currentType] || [];
  wrap.innerHTML = cats.map(c =>
    `<button class="d-cat-chip ${c === dState.selectedCat ? 'active' : ''}" onclick="dSelectCat('${dEsc(c).replace(/'/g, "\\'")}')">${CAT_ICONS[c] || ''} ${dEsc(c)}</button>`
  ).join('');
}
function dSelectCat(c) { dState.selectedCat = c; dRenderCatChips(); }

async function dSaveTx() {
  const amount = parseFloat(document.getElementById('dAmount').value);
  if (!amount || amount <= 0) { dToast('Enter a valid amount'); return; }
  if (!dState.selectedCat) { dToast('Pick a category'); return; }
  const note = document.getElementById('dNote').value.trim();
  const date = document.getElementById('dDate').value || new Date().toISOString().slice(0, 10);
  const walletId = document.getElementById('dWallet').value || null;
  const memberId = document.getElementById('dMember').value || (dState.members[0] && dState.members[0].id) || 'm_default';
  try {
    await db.collection('transactions').add({
      uid: dState.uid,
      type: dState.currentType,
      amount,
      category: dState.selectedCat,
      note,
      date,
      walletId,
      memberId,
      createdAt: new Date().toISOString()
    });
    dToast(dState.currentType === 'income' ? 'Income added' : 'Expense added');
    dCloseAdd();
  } catch (e) {
    dToast('Failed to save: ' + (e.message || 'unknown'));
  }
}

// ── Edit / Delete TX ──
function dOpenEditTx(id) {
  const tx = dState.transactions.find(t => t.id === id);
  if (!tx) return;
  dState.editId = id;
  dState.currentType = tx.type === 'income' ? 'income' : 'expense';
  dState.selectedCat = tx.category || '';
  document.getElementById('dAmount').value = tx.amount || '';
  document.getElementById('dNote').value = tx.note || '';
  document.getElementById('dDate').value = tx.date || new Date().toISOString().slice(0, 10);
  dSetType(dState.currentType);
  // populate members
  const mSel = document.getElementById('dMember');
  mSel.innerHTML = dState.members.length
    ? dState.members.map(m => `<option value="${dEsc(m.id)}" ${m.id === tx.memberId ? 'selected' : ''}>${dEsc(m.name)}</option>`).join('')
    : '<option value="">No members</option>';
  // populate wallets filtered by selected member, with current walletId selected
  const mId = mSel.value;
  const wSel = document.getElementById('dWallet');
  const wallets = mId ? dState.wallets.filter(w => w.memberId === mId) : dState.wallets;
  wSel.innerHTML = '<option value="">No wallet</option>' +
    wallets.map(w => `<option value="${dEsc(w.id)}" ${w.id === tx.walletId ? 'selected' : ''}>${dEsc(w.name)} (${dEsc(w.type)})</option>`).join('');
  document.getElementById('dAddTitle').textContent = 'Edit ' + (tx.type === 'income' ? 'Income' : 'Expense');
  document.getElementById('dDeleteTxBtn').style.display = '';
  document.getElementById('dAddModal').classList.add('open');
}

async function dDeleteTx() {
  if (!dState.editId) return;
  if (!confirm('Delete this transaction?')) return;
  try {
    await db.collection('transactions').doc(dState.editId).delete();
    dToast('Transaction deleted');
    dCloseAdd();
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
}

// Override dOpenAdd & dCloseAdd & dSaveTx to handle edit mode
const _dOpenAddOrig = dOpenAdd;
dOpenAdd = function (type) {
  dState.editId = null;
  document.getElementById('dDeleteTxBtn').style.display = 'none';
  _dOpenAddOrig(type);
};
const _dCloseAddOrig = dCloseAdd;
dCloseAdd = function () {
  dState.editId = null;
  document.getElementById('dDeleteTxBtn').style.display = 'none';
  _dCloseAddOrig();
};
const _dSaveTxOrig = dSaveTx;
dSaveTx = async function () {
  const amount = parseFloat(document.getElementById('dAmount').value);
  if (!amount || amount <= 0) { dToast('Enter a valid amount'); return; }
  if (!dState.selectedCat) { dToast('Pick a category'); return; }
  if (!dState.editId) return _dSaveTxOrig();
  const note = document.getElementById('dNote').value.trim();
  const date = document.getElementById('dDate').value || new Date().toISOString().slice(0, 10);
  const walletId = document.getElementById('dWallet').value || null;
  const memberId = document.getElementById('dMember').value || (dState.members[0] && dState.members[0].id) || 'm_default';
  try {
    await db.collection('transactions').doc(dState.editId).update({
      type: dState.currentType, amount, category: dState.selectedCat, note, date, walletId, memberId
    });
    dToast('Transaction updated');
    dCloseAdd();
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
};

// ── PREFS SAVE (members/wallets/goals/debts in user doc) ──
async function dSaveUserDoc(patch) {
  if (!dState.uid) return;
  await db.collection('users').doc(dState.uid).set(patch, { merge: true });
}

// ── TRANSACTIONS TABLE ──
function dPopulateTxFilters() {
  const cats = [...new Set(dState.transactions.map(t => t.category).filter(Boolean))].sort();
  const cur = document.getElementById('dTxCat').value;
  document.getElementById('dTxCat').innerHTML = '<option value="">All categories</option>' +
    cats.map(c => `<option value="${dEsc(c)}" ${c === cur ? 'selected' : ''}>${dEsc(c)}</option>`).join('');
  const curM = document.getElementById('dTxMember').value;
  document.getElementById('dTxMember').innerHTML = '<option value="">All members</option>' +
    dState.members.map(m => `<option value="${dEsc(m.id)}" ${m.id === curM ? 'selected' : ''}>${dEsc(m.name)}</option>`).join('');
  const curW = document.getElementById('dTxWallet').value;
  document.getElementById('dTxWallet').innerHTML = '<option value="">All wallets</option>' +
    dState.wallets.map(w => `<option value="${dEsc(w.id)}" ${w.id === curW ? 'selected' : ''}>${dEsc(w.name)}</option>`).join('');
}

function dFilteredTxs() {
  const q = (document.getElementById('dTxSearch')?.value || '').toLowerCase().trim();
  const type = document.getElementById('dTxType')?.value || '';
  const cat = document.getElementById('dTxCat')?.value || '';
  const wallet = document.getElementById('dTxWallet')?.value || '';
  const member = document.getElementById('dTxMember')?.value || '';
  const range = document.getElementById('dTxRange')?.value || 'all';
  const now = new Date();
  return dState.transactions.filter(t => {
    if (type && t.type !== type) return false;
    if (cat && t.category !== cat && t.type !== 'transfer') return false;
    if (cat && t.type === 'transfer') return false;
    if (wallet) {
      if (t.type === 'transfer') {
        if (t.walletId !== wallet && t.toWalletId !== wallet) return false;
      } else if (t.walletId !== wallet) return false;
    }
    if (member && t.type !== 'transfer' && t.memberId !== member) return false;
    if (member && t.type === 'transfer') {
      const fromW = dState.wallets.find(w => w.id === t.walletId);
      const toW = dState.wallets.find(w => w.id === t.toWalletId);
      if ((fromW?.memberId !== member) && (toW?.memberId !== member)) return false;
    }
    if (q) {
      const hay = ((t.note || '') + ' ' + (t.category || '')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (range !== 'all') {
      const d = new Date(t.date);
      if (range === 'month') {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
      } else if (range === 'lastmonth') {
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (d.getMonth() !== lm.getMonth() || d.getFullYear() !== lm.getFullYear()) return false;
      } else if (range === 'year') {
        if (d.getFullYear() !== now.getFullYear()) return false;
      }
    }
    return true;
  });
}

function dRenderTxTable() {
  dPopulateTxFilters();
  const body = document.getElementById('dTxTableBody');
  const foot = document.getElementById('dTxTableFoot');
  if (!body) return;
  const rows = dFilteredTxs();
  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="8"><div class="d-empty"><span class="mi">inbox</span><div>No transactions match these filters.</div></div></td></tr>`;
    foot.textContent = '';
    return;
  }
  body.innerHTML = rows.map(t => {
    const dt = new Date(t.date);
    if (t.type === 'transfer') {
      const fromW = dState.wallets.find(w => w.id === t.walletId);
      const toW = dState.wallets.find(w => w.id === t.toWalletId);
      const fromName = fromW ? dEsc(fromW.name) : '?';
      const toName = toW ? dEsc(toW.name) : '?';
      return `
        <tr onclick="dDeleteTransfer('${t.id}')" style="cursor:pointer">
          <td>${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
          <td><span class="d-type-pill transfer">transfer</span></td>
          <td><span class="d-td-cat">🔄 Transfer</span></td>
          <td>${dEsc(t.note || '—')}</td>
          <td><span style="color:var(--d-text2);font-size:0.82rem">—</span></td>
          <td><span style="font-size:0.82rem">${fromName} → ${toName}</span></td>
          <td class="r d-td-amt transfer">${dFmt(t.amount || 0).replace('-', '')}</td>
          <td class="r"><span class="mi" style="color:var(--d-text3);font-size:18px">delete</span></td>
        </tr>`;
    }
    const wallet = dState.wallets.find(w => w.id === t.walletId);
    return `
      <tr onclick="dOpenEditTx('${t.id}')">
        <td>${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
        <td><span class="d-type-pill ${t.type}">${t.type}</span></td>
        <td><span class="d-td-cat">${CAT_ICONS[t.category] || '📌'} ${dEsc(t.category || 'Other')}</span></td>
        <td>${dEsc(t.note || '—')}</td>
        <td>${dMemberPill(t.memberId)}</td>
        <td>${wallet ? dEsc(wallet.name) : '<span style="color:var(--d-text3)">—</span>'}</td>
        <td class="r d-td-amt ${t.type}">${t.type === 'income' ? '+' : '-'}${dFmt(t.amount || 0).replace('-', '')}</td>
        <td class="r"><span class="mi" style="color:var(--d-text3);font-size:18px">edit</span></td>
      </tr>`;
  }).join('');
  const total = rows.reduce((s, t) => {
    if (t.type === 'income') return s + (t.amount || 0);
    if (t.type === 'expense') return s - (t.amount || 0);
    return s;
  }, 0);
  foot.innerHTML = `<span>Showing <b>${rows.length}</b> transactions</span><span>Net: <b style="color:${total >= 0 ? 'var(--d-green)' : 'var(--d-red)'}">${total >= 0 ? '+' : ''}${dFmt(total).replace('-', '')}</b></span>`;
}

// ── EXPORT CSV ──
function dExportCSV() {
  const rows = dFilteredTxs();
  if (!rows.length) { dToast('Nothing to export'); return; }
  const header = ['Date', 'Type', 'Category', 'Note', 'Member', 'Wallet', 'Amount'];
  const csv = [header.join(',')].concat(rows.map(t => {
    const wallet = dState.wallets.find(w => w.id === t.walletId);
    const fields = [
      t.date,
      t.type,
      t.category || '',
      (t.note || '').replace(/"/g, '""'),
      dMemberName(t.memberId),
      wallet ? wallet.name : '',
      t.amount || 0
    ];
    return fields.map(f => `"${f}"`).join(',');
  })).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `ledger-${Date.now()}.csv`;
  a.click(); URL.revokeObjectURL(url);
  dToast('CSV downloaded');
}

// ── WALLETS PAGE (grouped by member) ──
const D_WALLET_COLORS = [
  'linear-gradient(135deg,#7c5cff,#a78bfa)',
  'linear-gradient(135deg,#30d158,#00a844)',
  'linear-gradient(135deg,#ff5470,#ec4899)',
  'linear-gradient(135deg,#ffd24d,#ff9500)',
  'linear-gradient(135deg,#38bdf8,#0ea5e9)',
  'linear-gradient(135deg,#f472b6,#ec4899)'
];

function dRenderWalletsPage() {
  const container = document.getElementById('dWalletsByMember');
  document.getElementById('dWalletsCount').textContent = dState.wallets.length;
  if (!dState.wallets.length) {
    container.innerHTML = `<div class="d-empty"><span class="mi">account_balance_wallet</span><div>No wallets yet. Click "New Wallet" to add one.</div></div>`;
    document.getElementById('dWalletsTotal').textContent = dFmt(0);
    return;
  }

  // Group wallets by member, preserving member order. Add orphans bucket at end.
  const memberOrder = dState.members.map(m => m.id);
  const groups = new Map();
  dState.members.forEach(m => groups.set(m.id, []));
  const orphans = [];
  dState.wallets.forEach(w => {
    if (groups.has(w.memberId)) groups.get(w.memberId).push(w);
    else orphans.push(w);
  });

  let total = 0;
  let walletIdx = 0;
  const sections = [];

  const renderSection = (memberId, name, wallets) => {
    if (!wallets.length) return '';
    const memberTotal = wallets.reduce((s, w) => s + dWalletBalance(w.id), 0);
    total += memberTotal;
    const initial = (name[0] || '?').toUpperCase();
    const walletsHtml = wallets.map(w => {
      const bal = dWalletBalance(w.id);
      const wTxs = dState.transactions.filter(t => t.walletId === w.id || t.toWalletId === w.id);
      const inc = dState.transactions.filter(t => t.type === 'income' && t.walletId === w.id).reduce((s, t) => s + (t.amount || 0), 0);
      const exp = dState.transactions.filter(t => t.type === 'expense' && t.walletId === w.id).reduce((s, t) => s + (t.amount || 0), 0);
      const bg = D_WALLET_COLORS[walletIdx++ % D_WALLET_COLORS.length];
      return `
        <div class="d-wallet-card" style="background:${bg}" onclick="dOpenWallet('${dEsc(w.id)}')">
          <div class="d-wallet-top">
            <div>
              <div class="d-wallet-name">${dEsc(w.name)}</div>
              <div style="font-size:0.72rem;color:rgba(255,255,255,0.78);margin-top:2px">
                <span class="mi" style="font-size:12px;vertical-align:-2px">person</span> ${dEsc(name)}
              </div>
            </div>
            <div class="d-wallet-type">${dEsc(w.type)}</div>
          </div>
          <div class="d-wallet-balance">${dFmt(bal)}</div>
          <div class="d-wallet-bottom">
            <span><span class="mi">trending_up</span>${dFmt(inc)}</span>
            <span><span class="mi">trending_down</span>${dFmt(exp)}</span>
            <span><span class="mi">receipt_long</span>${wTxs.length} txs</span>
          </div>
        </div>`;
    }).join('');
    return `
      <div class="d-member-section">
        <div class="d-member-section-head">
          <div class="d-member-avatar">${dEsc(initial)}</div>
          <div class="d-member-section-info">
            <div class="d-member-section-name">${dEsc(name)}</div>
            <div class="d-member-section-meta">${wallets.length} wallet${wallets.length === 1 ? '' : 's'}</div>
          </div>
          <div class="d-member-section-total">${dFmt(memberTotal)}</div>
        </div>
        <div class="d-wallets-grid">${walletsHtml}</div>
      </div>`;
  };

  memberOrder.forEach(mId => {
    const m = dState.members.find(x => x.id === mId);
    sections.push(renderSection(mId, m.name, groups.get(mId)));
  });
  if (orphans.length) {
    sections.push(renderSection(null, 'Unassigned', orphans));
  }

  container.innerHTML = sections.join('');
  document.getElementById('dWalletsTotal').textContent = dFmt(total);
}

let dEditWalletId = null;
function dOpenWallet(id) {
  dEditWalletId = id || null;
  const memSel = document.getElementById('dWalletMember');
  const curMember = id ? (dState.wallets.find(x => x.id === id)?.memberId) : (dState.members[0]?.id);
  memSel.innerHTML = dState.members.length
    ? dState.members.map(m => `<option value="${dEsc(m.id)}" ${m.id === curMember ? 'selected' : ''}>${dEsc(m.name)}</option>`).join('')
    : '<option value="">No members — add one first</option>';
  if (id) {
    const w = dState.wallets.find(x => x.id === id);
    if (!w) return;
    document.getElementById('dWalletTitle').textContent = 'Edit Wallet';
    document.getElementById('dWalletName').value = w.name || '';
    document.getElementById('dWalletType').value = w.type || 'Cash';
    document.getElementById('dWalletBalance').value = w.initialBalance || '';
    document.getElementById('dDeleteWalletBtn').style.display = '';
  } else {
    document.getElementById('dWalletTitle').textContent = 'New Wallet';
    document.getElementById('dWalletName').value = '';
    document.getElementById('dWalletType').value = 'Cash';
    document.getElementById('dWalletBalance').value = '';
    document.getElementById('dDeleteWalletBtn').style.display = 'none';
  }
  document.getElementById('dWalletModal').classList.add('open');
}
function dCloseWallet() {
  document.getElementById('dWalletModal').classList.remove('open');
  dEditWalletId = null;
}
async function dSaveWallet() {
  const name = document.getElementById('dWalletName').value.trim();
  const type = document.getElementById('dWalletType').value;
  const initialBalance = parseFloat(document.getElementById('dWalletBalance').value) || 0;
  if (!name) { dToast('Wallet name required'); return; }
  const memberId = document.getElementById('dWalletMember').value || (dState.members[0] && dState.members[0].id) || 'm_default';
  let wallets = [...(dState.wallets || [])];
  if (dEditWalletId) {
    wallets = wallets.map(w => w.id === dEditWalletId ? { ...w, name, type, initialBalance, memberId } : w);
  } else {
    wallets.push({ id: 'w_' + Date.now(), name, type, memberId, initialBalance });
  }
  try {
    await dSaveUserDoc({ wallets });
    dState.wallets = wallets;
    dRenderAll(); dRenderWalletsPage();
    dToast(dEditWalletId ? 'Wallet updated' : 'Wallet added');
    dCloseWallet();
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
}
async function dDeleteWallet() {
  if (!dEditWalletId) return;
  const wTxs = dState.transactions.filter(t => t.walletId === dEditWalletId);
  if (wTxs.length && !confirm(`This wallet has ${wTxs.length} transactions. Delete anyway? Transactions will become un-assigned.`)) return;
  if (!wTxs.length && !confirm('Delete this wallet?')) return;
  const wallets = dState.wallets.filter(w => w.id !== dEditWalletId);
  try {
    await dSaveUserDoc({ wallets });
    dState.wallets = wallets;
    dRenderAll(); dRenderWalletsPage();
    dToast('Wallet deleted');
    dCloseWallet();
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
}

// ── GOALS PAGE ──
function dRenderGoalsPage() {
  const grid = document.getElementById('dGoalsGrid');
  if (!dState.goals.length) {
    grid.innerHTML = `<div class="d-empty" style="grid-column:1/-1"><span class="mi">flag</span><div>No goals yet. Click "New Goal" to set a savings target.</div></div>`;
    return;
  }
  grid.innerHTML = dState.goals.map(g => {
    const target = g.target || 0;
    const cur = g.current || 0;
    const pct = target > 0 ? Math.min(100, Math.round((cur / target) * 100)) : 0;
    const complete = pct >= 100;
    const deadline = g.deadline ? `<div class="d-goal-deadline"><span class="mi" style="font-size:14px">event</span> Deadline: ${new Date(g.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>` : '';
    return `
      <div class="d-goal-card ${complete ? 'complete' : ''}" onclick="dOpenGoal('${dEsc(g.id)}')">
        <div class="d-goal-head">
          <span>${dEsc(g.name || 'Goal')}</span>
          <span class="d-goal-pct" style="float:right;color:var(--d-accent2)">${pct}%</span>
        </div>
        <div class="d-progress"><div class="d-progress-bar" style="width:${pct}%"></div></div>
        <div class="d-goal-amounts"><span>Saved <b>${dFmt(cur)}</b></span><span>Target <b>${dFmt(target)}</b></span></div>
        ${deadline}
      </div>`;
  }).join('');
}

let dEditGoalId = null;
function dOpenGoal(id) {
  dEditGoalId = id || null;
  if (id) {
    const g = dState.goals.find(x => x.id === id);
    if (!g) return;
    document.getElementById('dGoalTitle').textContent = 'Edit Goal';
    document.getElementById('dGoalName').value = g.name || '';
    document.getElementById('dGoalTarget').value = g.target || '';
    document.getElementById('dGoalCurrent').value = g.current || '';
    document.getElementById('dGoalDeadline').value = g.deadline || '';
    document.getElementById('dDeleteGoalBtn').style.display = '';
  } else {
    document.getElementById('dGoalTitle').textContent = 'New Goal';
    document.getElementById('dGoalName').value = '';
    document.getElementById('dGoalTarget').value = '';
    document.getElementById('dGoalCurrent').value = '';
    document.getElementById('dGoalDeadline').value = '';
    document.getElementById('dDeleteGoalBtn').style.display = 'none';
  }
  document.getElementById('dGoalModal').classList.add('open');
}
function dCloseGoal() { document.getElementById('dGoalModal').classList.remove('open'); dEditGoalId = null; }
async function dSaveGoal() {
  const name = document.getElementById('dGoalName').value.trim();
  const target = parseFloat(document.getElementById('dGoalTarget').value) || 0;
  const current = parseFloat(document.getElementById('dGoalCurrent').value) || 0;
  const deadline = document.getElementById('dGoalDeadline').value || '';
  if (!name) { dToast('Goal name required'); return; }
  if (target <= 0) { dToast('Target must be > 0'); return; }
  let goals = [...(dState.goals || [])];
  if (dEditGoalId) goals = goals.map(g => g.id === dEditGoalId ? { ...g, name, target, current, deadline } : g);
  else goals.push({ id: 'g_' + Date.now(), name, target, current, deadline });
  try {
    await dSaveUserDoc({ goals });
    dState.goals = goals;
    dRenderAll(); dRenderGoalsPage();
    dToast(dEditGoalId ? 'Goal updated' : 'Goal added');
    dCloseGoal();
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
}
async function dDeleteGoal() {
  if (!dEditGoalId) return;
  if (!confirm('Delete this goal?')) return;
  const goals = dState.goals.filter(g => g.id !== dEditGoalId);
  try {
    await dSaveUserDoc({ goals });
    dState.goals = goals;
    dRenderAll(); dRenderGoalsPage();
    dToast('Goal deleted');
    dCloseGoal();
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
}

// ── DEBTS PAGE ──
let dDebtType = 'owed';
let dEditDebtId = null;
function dRenderDebtsPage() {
  const grid = document.getElementById('dDebtsGrid');
  if (!dState.debts.length) {
    grid.innerHTML = `<div class="d-empty" style="grid-column:1/-1"><span class="mi">handshake</span><div>No debts tracked yet. Click "New Debt" to add one.</div></div>`;
    return;
  }
  grid.innerHTML = dState.debts.map(d => {
    const dir = d.type === 'owed' ? 'owed' : 'owe';
    const label = dir === 'owed' ? 'They owe you' : 'You owe them';
    return `
      <div class="d-debt-card ${dir}" onclick="dOpenDebt('${dEsc(d.id)}')">
        <div class="d-card-head">
          <span class="d-card-label">${label}</span>
          <span class="d-debt-status ${d.settled ? 'settled' : ''}">${d.settled ? 'Settled' : 'Pending'}</span>
        </div>
        <div class="d-debt-person">${dEsc(d.person || 'Unknown')}</div>
        <div class="d-debt-amount ${dir}">${dFmt(d.amount || 0)}</div>
        <div class="d-debt-meta">
          ${d.date ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
          ${d.note ? ' · ' + dEsc(d.note) : ''}
        </div>
      </div>`;
  }).join('');
}

function dOpenDebt(id) {
  dEditDebtId = id || null;
  if (id) {
    const d = dState.debts.find(x => x.id === id);
    if (!d) return;
    document.getElementById('dDebtTitle').textContent = 'Edit Debt';
    document.getElementById('dDebtPerson').value = d.person || '';
    document.getElementById('dDebtAmount').value = d.amount || '';
    document.getElementById('dDebtDate').value = d.date || '';
    document.getElementById('dDebtNote').value = d.note || '';
    dSetDebtType(d.type || 'owed');
    document.getElementById('dDeleteDebtBtn').style.display = '';
  } else {
    document.getElementById('dDebtTitle').textContent = 'New Debt';
    document.getElementById('dDebtPerson').value = '';
    document.getElementById('dDebtAmount').value = '';
    document.getElementById('dDebtDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('dDebtNote').value = '';
    dSetDebtType('owed');
    document.getElementById('dDeleteDebtBtn').style.display = 'none';
  }
  document.getElementById('dDebtModal').classList.add('open');
}
function dCloseDebt() { document.getElementById('dDebtModal').classList.remove('open'); dEditDebtId = null; }
function dSetDebtType(t) {
  dDebtType = t;
  document.querySelectorAll('#dDebtModal .d-seg-btn').forEach(b => b.classList.toggle('active', b.dataset.debt === t));
}
async function dSaveDebt() {
  const person = document.getElementById('dDebtPerson').value.trim();
  const amount = parseFloat(document.getElementById('dDebtAmount').value) || 0;
  const date = document.getElementById('dDebtDate').value || new Date().toISOString().slice(0, 10);
  const note = document.getElementById('dDebtNote').value.trim();
  if (!person) { dToast('Person name required'); return; }
  if (amount <= 0) { dToast('Amount must be > 0'); return; }
  let debts = [...(dState.debts || [])];
  if (dEditDebtId) debts = debts.map(d => d.id === dEditDebtId ? { ...d, person, amount, date, note, type: dDebtType } : d);
  else debts.push({ id: 'd_' + Date.now(), person, amount, date, note, type: dDebtType, settled: false });
  try {
    await dSaveUserDoc({ debts });
    dState.debts = debts;
    dRenderDebtsPage();
    dToast(dEditDebtId ? 'Debt updated' : 'Debt added');
    dCloseDebt();
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
}
async function dDeleteDebt() {
  if (!dEditDebtId) return;
  if (!confirm('Delete this debt record?')) return;
  const debts = dState.debts.filter(d => d.id !== dEditDebtId);
  try {
    await dSaveUserDoc({ debts });
    dState.debts = debts;
    dRenderDebtsPage();
    dToast('Debt deleted');
    dCloseDebt();
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
}

// ── ANALYTICS ──
let dBarChart = null, dTrendChart = null;

// Compute date range [start, end] (inclusive ISO date strings) for a period key.
function dPeriodRange(period) {
  const now = new Date();
  const iso = d => d.toISOString().slice(0, 10);
  const startOfMonth = (y, m) => new Date(y, m, 1);
  const endOfMonth = (y, m) => new Date(y, m + 1, 0);
  if (period === 'thisMonth') {
    return { start: iso(startOfMonth(now.getFullYear(), now.getMonth())), end: iso(endOfMonth(now.getFullYear(), now.getMonth())), label: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  }
  if (period === 'lastMonth') {
    const m = now.getMonth() - 1, y = now.getFullYear();
    const d = new Date(y, m, 1);
    return { start: iso(startOfMonth(d.getFullYear(), d.getMonth())), end: iso(endOfMonth(d.getFullYear(), d.getMonth())), label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  }
  if (period === 'last3') {
    const s = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return { start: iso(s), end: iso(endOfMonth(now.getFullYear(), now.getMonth())), label: 'Last 3 months' };
  }
  if (period === 'last6') {
    const s = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    return { start: iso(s), end: iso(endOfMonth(now.getFullYear(), now.getMonth())), label: 'Last 6 months' };
  }
  if (period === 'thisYear') {
    return { start: iso(new Date(now.getFullYear(), 0, 1)), end: iso(new Date(now.getFullYear(), 11, 31)), label: String(now.getFullYear()) };
  }
  if (period === 'lastYear') {
    const y = now.getFullYear() - 1;
    return { start: iso(new Date(y, 0, 1)), end: iso(new Date(y, 11, 31)), label: String(y) };
  }
  // specific month key e.g. "m_2025_03"
  if (period && period.startsWith('m_')) {
    const [, y, m] = period.split('_').map(Number);
    return { start: iso(startOfMonth(y, m)), end: iso(endOfMonth(y, m)), label: new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  }
  // all time
  return { start: null, end: null, label: 'All time' };
}

function dPopulateAnalyticsPeriods() {
  const sel = document.getElementById('dAnalyticsPeriod');
  if (!sel) return;
  // Find existing month options and rebuild only if needed
  const monthSet = new Set();
  dState.transactions.forEach(t => {
    if (!t.date) return;
    const d = new Date(t.date);
    if (isNaN(d)) return;
    monthSet.add(`${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`);
  });
  // Preserve current value
  const cur = sel.value || 'all';
  // Build static + dynamic month options
  const staticOpts = `
    <option value="all">All time</option>
    <option value="thisMonth">This month</option>
    <option value="lastMonth">Last month</option>
    <option value="last3">Last 3 months</option>
    <option value="last6">Last 6 months</option>
    <option value="thisYear">This year</option>
    <option value="lastYear">Last year</option>`;
  const months = [...monthSet].sort().reverse();
  const monthOpts = months.length ? '<optgroup label="Specific month">' + months.map(k => {
    const [y, m] = k.split('-').map(Number);
    const label = new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return `<option value="m_${y}_${m}">${label}</option>`;
  }).join('') + '</optgroup>' : '';
  sel.innerHTML = staticOpts + monthOpts;
  sel.value = cur;
}

function dRenderAnalytics() {
  dPopulateAnalyticsPeriods();
  const period = document.getElementById('dAnalyticsPeriod')?.value || 'all';
  const { start, end, label } = dPeriodRange(period);
  const labelEl = document.getElementById('dAnalyticsLabel');
  if (labelEl) labelEl.textContent = label;

  // Filter txs by period (ignore transfers in analytics — they don't change net)
  const inRange = t => {
    if (t.type === 'transfer') return false;
    if (!start) return true;
    return t.date >= start && t.date <= end;
  };
  const filtered = dState.transactions.filter(inRange);

  // Bar: months within range (or last 6 if all time)
  const now = new Date();
  let months = [];
  if (!start) {
    for (let i = 5; i >= 0; i--) months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  } else {
    const s = new Date(start), e = new Date(end);
    const cur = new Date(s.getFullYear(), s.getMonth(), 1);
    while (cur <= e) { months.push(new Date(cur)); cur.setMonth(cur.getMonth() + 1); }
    if (months.length > 12) months = months.slice(-12);
  }
  const incData = months.map(m => filtered.filter(t => {
    const d = new Date(t.date);
    return t.type === 'income' && d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
  }).reduce((s, t) => s + (t.amount || 0), 0));
  const expData = months.map(m => filtered.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
  }).reduce((s, t) => s + (t.amount || 0), 0));
  const labels = months.map(m => m.toLocaleDateString('en-US', { month: 'short', year: months.length > 6 ? '2-digit' : undefined }));
  const barTitleEl = document.getElementById('dBarChartTitle');
  if (barTitleEl) barTitleEl.textContent = months.length === 1 ? `Income vs Expenses · ${labels[0]}` : `Income vs Expenses · ${label}`;
  if (dBarChart) dBarChart.destroy();
  const barCanvas = document.getElementById('dBarChart');
  if (barCanvas) {
    dBarChart = new Chart(barCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Income', data: incData, backgroundColor: 'rgba(48,209,88,0.7)', borderRadius: 8 },
          { label: 'Expense', data: expData, backgroundColor: 'rgba(255,84,112,0.7)', borderRadius: 8 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: 'rgba(255,255,255,0.7)' } } },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { display: false } },
          y: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { color: 'rgba(255,255,255,0.06)' } }
        }
      }
    });
  }

  // Trend: daily running balance within selected period (or last 30 days if all time)
  const days = [];
  let trendStart, trendEnd;
  if (!start) {
    trendEnd = new Date(now);
    trendStart = new Date(now); trendStart.setDate(trendStart.getDate() - 29);
  } else {
    trendStart = new Date(start); trendEnd = new Date(end);
    // Cap at 180 days to keep chart readable
    const maxMs = 180 * 86400000;
    if (trendEnd - trendStart > maxMs) trendStart = new Date(trendEnd.getTime() - maxMs);
  }
  for (let d = new Date(trendStart); d <= trendEnd; d.setDate(d.getDate() + 1)) days.push(new Date(d));
  let running = (dState.wallets || []).reduce((s, w) => s + (w.initialBalance || 0), 0);
  const startStr = days[0].toISOString().slice(0, 10);
  dState.transactions.forEach(t => {
    if (t.date < startStr && t.type !== 'transfer') {
      if (t.type === 'income') running += (t.amount || 0);
      else if (t.type === 'expense') running -= (t.amount || 0);
    }
  });
  const trendData = days.map(d => {
    const ds = d.toISOString().slice(0, 10);
    dState.transactions.filter(t => t.date === ds && t.type !== 'transfer').forEach(t => {
      if (t.type === 'income') running += (t.amount || 0);
      else if (t.type === 'expense') running -= (t.amount || 0);
    });
    return running;
  });
  const trendTitleEl = document.getElementById('dTrendChartTitle');
  if (trendTitleEl) trendTitleEl.textContent = `Balance trend · ${label}`;
  if (dTrendChart) dTrendChart.destroy();
  const trendCanvas = document.getElementById('dTrendChart');
  if (trendCanvas) {
    const ctx = trendCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 280);
    grad.addColorStop(0, 'rgba(124,92,255,0.45)');
    grad.addColorStop(1, 'rgba(124,92,255,0)');
    dTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days.map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
          data: trendData, label: 'Balance', borderColor: '#a78bfa', borderWidth: 2,
          backgroundColor: grad, fill: true, tension: 0.4, pointRadius: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.6)', maxTicksLimit: 6 }, grid: { display: false } },
          y: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { color: 'rgba(255,255,255,0.06)' } }
        }
      }
    });
  }

  // Top categories (period-filtered)
  const catMap = {};
  filtered.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category || 'Other'] = (catMap[t.category || 'Other'] || 0) + (t.amount || 0);
  });
  const top = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = top[0]?.[1] || 1;
  const topEl = document.getElementById('dTopCats');
  if (topEl) {
    if (!top.length) topEl.innerHTML = `<div class="d-empty"><span class="mi">pie_chart</span><div>No expense data in this period</div></div>`;
    else topEl.innerHTML = top.map(([cat, amt]) => `
      <div class="d-top-cat-row">
        <span class="label">${CAT_ICONS[cat] || '📌'} ${dEsc(cat)}</span>
        <div class="bar"><div class="bar-fill" style="width:${(amt / max) * 100}%"></div></div>
        <span class="amt">${dFmt(amt)}</span>
      </div>`).join('');
  }

  // Quick stats (period-filtered)
  const totalInc = filtered.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExp = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  const expCount = filtered.filter(t => t.type === 'expense').length;
  const avgTx = expCount ? totalExp / expCount : 0;
  // Compute months count in range for avg monthly
  let monthsCount;
  if (!start) {
    const oldest = dState.transactions.reduce((m, t) => (!m || t.date < m) ? t.date : m, null);
    monthsCount = oldest ? Math.max(1, Math.ceil((Date.now() - new Date(oldest).getTime()) / (30 * 86400000))) : 1;
  } else {
    monthsCount = Math.max(1, months.length);
  }
  const avgMonthlyExp = totalExp / monthsCount;
  const qs = document.getElementById('dQuickStats');
  if (qs) {
    qs.innerHTML = `
      <div class="d-stat-cell"><div class="label">Total income</div><div class="val" style="color:var(--d-green)">${dFmt(totalInc)}</div></div>
      <div class="d-stat-cell"><div class="label">Total expense</div><div class="val" style="color:var(--d-red)">${dFmt(totalExp)}</div></div>
      <div class="d-stat-cell"><div class="label">Avg expense</div><div class="val">${dFmt(avgTx)}</div></div>
      <div class="d-stat-cell"><div class="label">Avg monthly</div><div class="val">${dFmt(avgMonthlyExp)}</div></div>
    `;
  }
}

// ── SETTINGS ──
function dRenderSettings() {
  document.getElementById('dSettingsName').value = dState.user || '';
  document.getElementById('dSettingsEmail').value = dState.email || '';
  const av = document.getElementById('dSettingsAvatar');
  if (dState.profilePhoto) {
    av.style.backgroundImage = `url(${dState.profilePhoto})`;
    av.textContent = '';
  } else {
    av.style.backgroundImage = '';
    av.textContent = (dState.user[0] || 'U').toUpperCase();
  }
  // currencies
  const sel = document.getElementById('dSettingsCurrency');
  sel.innerHTML = Object.keys(CURRENCIES).map(c =>
    `<option value="${c}" ${c === dState.currency ? 'selected' : ''}>${c} — ${CURRENCIES[c].s}</option>`
  ).join('');
  // theme
  document.querySelectorAll('#dView-settings .d-seg-btn').forEach(b => {
    b.classList.toggle('active',
      (b.dataset.theme === 'dark' && dState.darkMode) ||
      (b.dataset.theme === 'light' && !dState.darkMode));
  });
  // members list
  dRenderMembers();
}
async function dSaveProfile() {
  const name = document.getElementById('dSettingsName').value.trim() || 'User';
  try {
    await auth.currentUser.updateProfile({ displayName: name });
    dState.user = name;
    dShowApp();
    dToast('Profile saved');
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
}
function dSetThemeMode(dark) {
  dState.darkMode = !!dark;
  dApplyTheme();
  document.querySelectorAll('#dView-settings .d-seg-btn').forEach(b => {
    b.classList.toggle('active',
      (b.dataset.theme === 'dark' && dark) ||
      (b.dataset.theme === 'light' && !dark));
  });
  dRenderCharts();
}
async function dSavePrefs() {
  const currency = document.getElementById('dSettingsCurrency').value || 'BDT';
  dState.currency = currency; dState.baseCurrency = currency;
  try {
    await dSaveUserDoc({ currency, displayCurrency: currency, darkMode: dState.darkMode });
    dRenderAll();
    dToast('Preferences saved');
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
}

// ── MEMBERS CRUD ──
let dEditMemberId = null;
function dRenderMembers() {
  const list = document.getElementById('dMembersList');
  if (!list) return;
  if (!dState.members.length) {
    list.innerHTML = `<div class="d-empty" style="padding:20px"><span class="mi">group</span><div>No members yet. Click "Add member" above.</div></div>`;
    return;
  }
  list.innerHTML = dState.members.map(m => {
    const wallets = dState.wallets.filter(w => w.memberId === m.id).length;
    const txs = dState.transactions.filter(t => t.memberId === m.id).length;
    const initial = (m.name[0] || '?').toUpperCase();
    return `
      <div class="d-member-row">
        <div class="d-member-avatar">${dEsc(initial)}</div>
        <div class="d-member-info">
          <div class="d-member-name">${dEsc(m.name)}</div>
          <div class="d-member-meta">${wallets} wallet${wallets === 1 ? '' : 's'} · ${txs} transaction${txs === 1 ? '' : 's'}</div>
        </div>
        <div class="d-member-actions">
          <button class="d-icon-btn" title="Edit" onclick="dOpenMember('${dEsc(m.id)}')"><span class="mi">edit</span></button>
        </div>
      </div>`;
  }).join('');
}

function dOpenMember(id) {
  dEditMemberId = id || null;
  if (id) {
    const m = dState.members.find(x => x.id === id);
    if (!m) return;
    document.getElementById('dMemberTitle').textContent = 'Edit Member';
    document.getElementById('dMemberName').value = m.name || '';
    document.getElementById('dDeleteMemberBtn').style.display = dState.members.length > 1 ? '' : 'none';
  } else {
    document.getElementById('dMemberTitle').textContent = 'New Member';
    document.getElementById('dMemberName').value = '';
    document.getElementById('dDeleteMemberBtn').style.display = 'none';
  }
  document.getElementById('dMemberModal').classList.add('open');
}
function dCloseMember() {
  document.getElementById('dMemberModal').classList.remove('open');
  dEditMemberId = null;
}
async function dSaveMember() {
  const name = document.getElementById('dMemberName').value.trim();
  if (!name) { dToast('Member name required'); return; }
  let members = [...(dState.members || [])];
  if (dEditMemberId) {
    members = members.map(m => m.id === dEditMemberId ? { ...m, name } : m);
  } else {
    members.push({ id: 'm_' + Date.now(), name });
  }
  try {
    await dSaveUserDoc({ members });
    dState.members = members;
    dRenderMembers();
    dRenderAll();
    dToast(dEditMemberId ? 'Member updated' : 'Member added');
    dCloseMember();
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
}
async function dDeleteMember() {
  if (!dEditMemberId) return;
  if (dState.members.length <= 1) { dToast("Can't delete the only member"); return; }
  const txCount = dState.transactions.filter(t => t.memberId === dEditMemberId).length;
  const wCount = dState.wallets.filter(w => w.memberId === dEditMemberId).length;
  let msg = 'Delete this member?';
  if (txCount || wCount) {
    msg = `This member has ${txCount} transaction${txCount === 1 ? '' : 's'} and ${wCount} wallet${wCount === 1 ? '' : 's'}. They will be reassigned to "${dState.members.find(m => m.id !== dEditMemberId)?.name}". Continue?`;
  }
  if (!confirm(msg)) return;
  const fallback = dState.members.find(m => m.id !== dEditMemberId).id;
  const members = dState.members.filter(m => m.id !== dEditMemberId);
  const wallets = dState.wallets.map(w => w.memberId === dEditMemberId ? { ...w, memberId: fallback } : w);
  try {
    await dSaveUserDoc({ members, wallets });
    // Reassign transactions in batch
    const batch = db.batch();
    dState.transactions.filter(t => t.memberId === dEditMemberId).forEach(t => {
      batch.update(db.collection('transactions').doc(t.id), { memberId: fallback });
    });
    await batch.commit();
    dState.members = members;
    dState.wallets = wallets;
    dRenderMembers();
    dRenderAll();
    dToast('Member deleted');
    dCloseMember();
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
}

// ── TRANSFER MODAL ──
function dOpenTransfer() {
  if (!dState.members.length) { dToast('Add a member first'); return; }
  if (dState.wallets.length < 2) { dToast('You need at least 2 wallets to transfer'); return; }
  const memOpts = dState.members.map(m => `<option value="${dEsc(m.id)}">${dEsc(m.name)}</option>`).join('');
  document.getElementById('dTFromMember').innerHTML = memOpts;
  document.getElementById('dTToMember').innerHTML = memOpts;
  document.getElementById('dTFromMember').value = dState.members[0].id;
  document.getElementById('dTToMember').value = (dState.members[1] || dState.members[0]).id;
  document.getElementById('dTAmount').value = '';
  document.getElementById('dTNote').value = '';
  document.getElementById('dTDate').value = new Date().toISOString().slice(0, 10);
  dUpdateTransferWallets('from');
  dUpdateTransferWallets('to');
  document.getElementById('dTransferModal').classList.add('open');
}
function dCloseTransfer() {
  document.getElementById('dTransferModal').classList.remove('open');
}
function dUpdateTransferWallets(side) {
  const isFrom = side === 'from';
  const memId = document.getElementById(isFrom ? 'dTFromMember' : 'dTToMember').value;
  const sel = document.getElementById(isFrom ? 'dTFromWallet' : 'dTToWallet');
  const wallets = dState.wallets.filter(w => w.memberId === memId);
  sel.innerHTML = wallets.length
    ? wallets.map(w => `<option value="${dEsc(w.id)}">${dEsc(w.name)}</option>`).join('')
    : '<option value="">No wallets for this member</option>';
  if (isFrom) dUpdateTransferDisplay();
}
function dUpdateTransferDisplay() {
  const fromId = document.getElementById('dTFromWallet').value;
  const amt = parseFloat(document.getElementById('dTAmount').value) || 0;
  const info = document.getElementById('dTFromBalanceInfo');
  if (!fromId) { info.textContent = ''; return; }
  const bal = dWalletBalance(fromId);
  info.textContent = 'Available in source wallet: ' + dFmt(bal);
  info.style.color = amt > bal ? 'var(--d-red)' : 'var(--d-green)';
}
async function dSaveTransfer() {
  const fromWalletId = document.getElementById('dTFromWallet').value;
  const toWalletId = document.getElementById('dTToWallet').value;
  const amount = parseFloat(document.getElementById('dTAmount').value);
  const date = document.getElementById('dTDate').value || new Date().toISOString().slice(0, 10);
  const note = document.getElementById('dTNote').value.trim();
  if (!fromWalletId || !toWalletId) { dToast('Select both wallets'); return; }
  if (fromWalletId === toWalletId) { dToast('Source and destination must differ'); return; }
  if (!amount || amount <= 0) { dToast('Enter a valid amount'); return; }
  const bal = dWalletBalance(fromWalletId);
  if (amount > bal) { dToast('Insufficient funds in source wallet'); return; }
  try {
    await db.collection('transactions').add({
      uid: dState.uid,
      type: 'transfer',
      category: 'Transfer',
      amount,
      date,
      walletId: fromWalletId,
      toWalletId,
      note,
      createdAt: new Date().toISOString()
    });
    dToast('Transfer completed');
    dCloseTransfer();
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
}
async function dDeleteTransfer(id) {
  const t = dState.transactions.find(x => x.id === id);
  if (!t) return;
  if (!confirm('Delete this transfer? Balances will revert.')) return;
  try {
    await db.collection('transactions').doc(id).delete();
    dToast('Transfer deleted');
  } catch (e) { dToast('Failed: ' + (e.message || 'unknown')); }
}

// ── Override dNav to render the appropriate view ──
const _dNavOrig = dNav;
dNav = function (view) {
  _dNavOrig(view);
  if (view === 'transactions') dRenderTxTable();
  else if (view === 'wallets') dRenderWalletsPage();
  else if (view === 'goals') dRenderGoalsPage();
  else if (view === 'debts') dRenderDebtsPage();
  else if (view === 'analytics') dRenderAnalytics();
  else if (view === 'settings') dRenderSettings();
};

// ── Override dRenderAll to keep current view in sync ──
const _dRenderAllOrig = dRenderAll;
dRenderAll = function () {
  _dRenderAllOrig();
  // Refresh current view's data too
  const v = dState.view;
  if (v === 'transactions') dRenderTxTable();
  else if (v === 'wallets') dRenderWalletsPage();
  else if (v === 'goals') dRenderGoalsPage();
  else if (v === 'debts') dRenderDebtsPage();
  else if (v === 'analytics') dRenderAnalytics();
  else if (v === 'settings') dRenderSettings();
};

// ── Init keyboard shortcuts ──
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    dCloseAdd(); dCloseWallet(); dCloseGoal(); dCloseDebt(); dCloseMember(); dCloseTransfer();
  }
  if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'dPassword') dHandleAuth();
  // Ctrl/Cmd+N → new transaction
  if ((e.ctrlKey || e.metaKey) && e.key === 'n' && dState.uid) {
    e.preventDefault();
    dOpenAdd('expense');
  }
});
