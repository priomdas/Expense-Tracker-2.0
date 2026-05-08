// ─── BUILD MARKER (use this to verify cache is fresh) ───
console.log('%c[Ledger] Build v29 loaded', 'background:#5e5ce6;color:#fff;padding:4px 10px;border-radius:4px;font-weight:bold');

// ─── Disable pinch-zoom and double-tap-zoom on iOS Safari ───
// (the viewport meta tag is ignored by iOS since iOS 10).
document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
document.addEventListener('gesturechange', e => e.preventDefault(), { passive: false });
document.addEventListener('gestureend', e => e.preventDefault(), { passive: false });
document.addEventListener('touchmove', e => {
  if (e.touches && e.touches.length > 1) e.preventDefault();
}, { passive: false });
let __lastTouchEnd = 0;
document.addEventListener('touchend', e => {
  const now = Date.now();
  if (now - __lastTouchEnd <= 350) e.preventDefault();
  __lastTouchEnd = now;
}, { passive: false });
// Block Ctrl/Cmd + wheel zoom on desktop browsers as well.
document.addEventListener('wheel', e => {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

// XSS Mitigation Helper
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]));
}

// ─── HAPTIC FEEDBACK ───
function uiVibrate(type = 'light') {
  if (!navigator.vibrate) return;
  // High-fidelity patterns mimicking Taptic Engine (Haptic Engine)
  const patterns = {
    light: [10],           // Subtle tap (UI selection)
    medium: [20],          // Standard click (Button press)
    heavy: [30],           // Hard press (Destructive action)
    success: [10, 30, 15], // Double click (Action completed)
    error: [30, 40, 30]    // Buzz (Action failed)
  };
  const pattern = typeof type === 'string' ? (patterns[type] || patterns.light) : type;
  try { navigator.vibrate(pattern); } catch (e) { }
}

// ─── NUMBER COUNT-UP ANIMATION ───
function animateNumber(el, to, opts = {}) {
  if (!el) return;
  const { duration = 700, formatter = fmt } = opts;
  const prev = el.dataset.numValue;
  const from = prev !== undefined ? parseFloat(prev) : 0;
  if (!isFinite(to)) to = 0;
  el.dataset.numValue = String(to);
  if (Math.abs(from - to) < 0.005) { el.textContent = formatter(to); return; }
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const start = performance.now();
  if (el._rafId) cancelAnimationFrame(el._rafId);
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const v = from + (to - from) * easeOutCubic(t);
    el.textContent = formatter(v);
    if (t < 1) el._rafId = requestAnimationFrame(step);
    else { el.textContent = formatter(to); el._rafId = null; }
  }
  el._rafId = requestAnimationFrame(step);
}
const pctFormatter = v => Math.round(v) + '%';

// ─── CONFETTI CELEBRATION ───
function triggerConfetti() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#5e5ce6', '#30d158', '#ff453a', '#ffd60a', '#38bdf8', '#f472b6', '#a78bfa'];
  const container = document.createElement('div');
  container.className = 'confetti-container';
  const COUNT = 70;
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = (Math.random() * 100) + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = (Math.random() * 0.3) + 's';
    p.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
    p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    p.style.setProperty('--drift', ((Math.random() - 0.5) * 30) + 'vw');
    if (i % 3 === 0) p.classList.add('square');
    if (i % 5 === 0) p.classList.add('rect');
    container.appendChild(p);
  }
  document.body.appendChild(container);
  uiVibrate('success');
  setTimeout(() => container.remove(), 4000);
}

// ─── ACTION LOADER UI ───
function showActionLoader() {
  const l = document.getElementById('actionLoader');
  if(l) { l.style.display = 'flex'; setTimeout(() => l.style.opacity = '1', 10); }
}
function hideActionLoader() {
  const l = document.getElementById('actionLoader');
  if(l) {
    l.style.opacity = '0';
    setTimeout(() => { if(l.style.opacity === '0') l.style.display = 'none'; }, 200);
  }
}

// ─── CONSTANTS ───
const CURRENCIES = { BDT: { s: '৳' }, USD: { s: '$' }, EUR: { s: '€' }, GBP: { s: '£' }, INR: { s: '₹' }, JPY: { s: '¥' }, AUD: { s: 'A$' }, CAD: { s: 'C$' }, SGD: { s: 'S$' }, AED: { s: 'د.إ' }, SAR: { s: '﷼' }, MYR: { s: 'RM' } };
const CATS = { income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Bonus', 'Other Income'], expense: ['Food & Dining', 'Transport', 'Rent', 'EMI', 'Utilities', 'Shopping', 'Healthcare', 'Education', 'Entertainment', 'Clothing', 'Travel', 'Groceries', 'Other Expense'] };
const CAT_ICONS = { 'Food & Dining': '<span class="mi sm">restaurant</span>', 'Transport': '<span class="mi sm">commute</span>', 'Rent': '<span class="mi sm">home_work</span>', 'EMI': '<span class="mi sm">account_balance</span>', 'Utilities': '<span class="mi sm">bolt</span>', 'Shopping': '<span class="mi sm">shopping_bag</span>', 'Healthcare': '<span class="mi sm">local_hospital</span>', 'Education': '<span class="mi sm">school</span>', 'Entertainment': '<span class="mi sm">movie</span>', 'Clothing': '<span class="mi sm">checkroom</span>', 'Travel': '<span class="mi sm">flight</span>', 'Groceries': '<span class="mi sm">shopping_cart</span>', 'Salary': '<span class="mi sm">payments</span>', 'Freelance': '<span class="mi sm">laptop_mac</span>', 'Business': '<span class="mi sm">storefront</span>', 'Investment': '<span class="mi sm">monitoring</span>', 'Gift': '<span class="mi sm">card_giftcard</span>', 'Bonus': '<span class="mi sm">workspace_premium</span>', 'Other Income': '<span class="mi sm">savings</span>', 'Other Expense': '<span class="mi sm">receipt_long</span>' };
const WALLET_COLORS = ['linear-gradient(135deg,#5e5ce6,#a78bfa)', 'linear-gradient(135deg,#30d158,#00a844)', 'linear-gradient(135deg,#ff453a,#cc3355)', 'linear-gradient(135deg,#ffd60a,#ff9500)', 'linear-gradient(135deg,#38bdf8,#0ea5e9)', 'linear-gradient(135deg,#f472b6,#ec4899)'];

// Firebase
const firebaseConfig = { apiKey: "AIzaSyDsG05Ps-qmlCs3INEdgHQNTkp5uIVrYMU", authDomain: "ledger-app-565d2.firebaseapp.com", projectId: "ledger-app-565d2", storageBucket: "ledger-app-565d2.firebasestorage.app", messagingSenderId: "400710691366", appId: "1:400710691366:web:0dd3a1b0269b9cc5efd4e7" };
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); const db = firebase.firestore();
let messaging = null;
(async () => {
  try {
    const supported = firebase.messaging.isSupported();
    const ok = (supported && typeof supported.then === 'function') ? await supported : !!supported;
    if (ok) messaging = firebase.messaging();
  } catch (e) { console.log('Messaging unavailable:', e && e.message); }
})();

// ─── PWA SERVICE WORKER REGISTRATION ───
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.update();
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }).catch(err => console.log('SW config failed: ', err));

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!window.__ledgerSwRefreshed) {
        window.__ledgerSwRefreshed = true;
        window.location.reload();
      }
    });
  });
}

let state = { uid: null, user: '', currency: 'BDT', baseCurrency: 'BDT', transactions: [], members: [], wallets: [], goals: [], budgets: [], recurring: [], debts: [], noteBooks: [], notes: [], selectedNoteBookId: '', darkMode: true, heroTheme: 'ocean', profilePhoto: '', currentType: 'income', editId: null, isRecurring: false };
let exchangeRates = {};
let pageStack = [];
let selectedCat = '';
let themePickerOpen = false;
let pieChart = null, barChart = null;
const HERO_THEMES = {
  ocean: {
    name: 'Ocean Glow',
    dark: { heroGrad: 'linear-gradient(145deg,#1a1a2e,#16213e,#0f3460)', heroGlow: 'radial-gradient(circle,rgba(94,92,230,0.3),transparent 70%)', heroText: '#ffffff', heroAmount: '#ffffff', heroLabel: 'rgba(255,255,255,0.5)', heroStatBg: 'rgba(255,255,255,0.08)', insightGrad: 'linear-gradient(135deg,#1a1040,#0d1f3c)', insightBorder: 'rgba(94,92,230,0.2)', insightText: 'rgba(255,255,255,0.8)', insightStrong: '#ffffff' },
    light: { heroGrad: 'linear-gradient(145deg,#e7f0ff,#d8e6ff,#cedfff)', heroGlow: 'radial-gradient(circle,rgba(94,92,230,0.16),transparent 70%)', heroText: '#1b2440', heroAmount: '#1b2440', heroLabel: 'rgba(27,36,64,0.52)', heroStatBg: 'rgba(255,255,255,0.72)', insightGrad: 'linear-gradient(135deg,#eef2ff,#e3e9ff)', insightBorder: 'rgba(94,92,230,0.14)', insightText: '#39445f', insightStrong: '#1d2846' }
  },
  rose: {
    name: 'Rose Pay',
    dark: { heroGrad: 'linear-gradient(145deg,#7f1244,#e91e63,#ff5fa2)', heroGlow: 'radial-gradient(circle,rgba(255,255,255,0.2),transparent 72%)', heroText: '#fff7fb', heroAmount: '#ffffff', heroLabel: 'rgba(255,247,251,0.72)', heroStatBg: 'rgba(0,0,0,0.16)', insightGrad: 'linear-gradient(135deg,#56122f,#7f1244)', insightBorder: 'rgba(255,95,162,0.34)', insightText: 'rgba(255,237,247,0.92)', insightStrong: '#ffffff' },
    light: { heroGrad: 'linear-gradient(145deg,#ffd9eb,#ffc3dd,#ff9ec7)', heroGlow: 'radial-gradient(circle,rgba(233,30,99,0.24),transparent 72%)', heroText: '#5a1230', heroAmount: '#4c0f28', heroLabel: 'rgba(90,18,48,0.62)', heroStatBg: 'rgba(255,255,255,0.66)', insightGrad: 'linear-gradient(135deg,#fff0f6,#ffe3ef)', insightBorder: 'rgba(233,30,99,0.22)', insightText: '#6a2441', insightStrong: '#401225' }
  },
  emerald: {
    name: 'Emerald Cash',
    dark: { heroGrad: 'linear-gradient(145deg,#0c3b2e,#0f6b5c,#18a17f)', heroGlow: 'radial-gradient(circle,rgba(48,209,88,0.28),transparent 72%)', heroText: '#f3fff9', heroAmount: '#ffffff', heroLabel: 'rgba(243,255,249,0.72)', heroStatBg: 'rgba(0,0,0,0.16)', insightGrad: 'linear-gradient(135deg,#0e352b,#0f4f40)', insightBorder: 'rgba(48,209,88,0.3)', insightText: 'rgba(230,255,244,0.9)', insightStrong: '#ffffff' },
    light: { heroGrad: 'linear-gradient(145deg,#ddfff2,#c5f7e8,#a9f0d9)', heroGlow: 'radial-gradient(circle,rgba(24,161,127,0.24),transparent 72%)', heroText: '#0e473a', heroAmount: '#0d3f34', heroLabel: 'rgba(14,71,58,0.64)', heroStatBg: 'rgba(255,255,255,0.66)', insightGrad: 'linear-gradient(135deg,#ebfff6,#dcfced)', insightBorder: 'rgba(24,161,127,0.2)', insightText: '#24584a', insightStrong: '#0f3b31' }
  }
};
const THEME_ACCENTS = {
  ocean: { purple: '#5e5ce6', purpleLight: 'rgba(94,92,230,0.15)', accent2: '#7c7aff', accentShadow: 'rgba(94,92,230,0.42)' },
  rose: { purple: '#e91e63', purpleLight: 'rgba(233,30,99,0.18)', accent2: '#ff5fa2', accentShadow: 'rgba(233,30,99,0.42)' },
  emerald: { purple: '#18a17f', purpleLight: 'rgba(24,161,127,0.18)', accent2: '#39cba6', accentShadow: 'rgba(24,161,127,0.42)' }
};

// ─── NAVIGATION ───
// Marks a container as "fresh" so its entrance animation runs on this
// page-entry render only. Subsequent re-renders (after add/edit/delete)
// do NOT re-animate, preventing the flicker glitch.
function markFresh(containerId) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.classList.add('fresh');
  // Clear after the entrance animation completes (~500ms + buffer).
  setTimeout(() => c.classList.remove('fresh'), 700);
}

function refreshPage(pageId) {
  if (pageId === 'p-home') renderHome();
  if (pageId === 'p-stats') rebuildCharts();
  if (pageId === 'p-wallets') { markFresh('memberCards'); renderWallets(); }
  if (pageId === 'p-family') { markFresh('familyList'); renderFamily(); }
  if (pageId === 'p-goals') { markFresh('goalsList'); renderGoals(); }
  if (pageId === 'p-recurring') renderRecurring();
  if (pageId === 'p-notes') renderNotes();
  if (pageId === 'p-note-detail') renderNoteBookDetail();
  if (pageId === 'p-transactions') renderFullTx();
  if (pageId === 'p-debts') { markFresh('debtsList'); renderDebts(); }
  if (pageId === 'p-transfer-history') renderTransferHistory();
  // Always update main stats behind the scenes just in case
  refreshStats();
}

function showPage(pageId, isBack = false) {
  const current = document.querySelector('.page.active');
  if (current && current.id === pageId) return;
  const next = document.getElementById(pageId);
  if (!next) return;

  if (current) {
    if (isBack) {
      current.style.transform = 'translateX(100%)';
      current.classList.remove('active');
      setTimeout(() => current.style.transform = '', 600);
    } else {
      current.classList.remove('active');
      current.classList.add('prev');
    }
  }

  next.style.transform = '';
  next.classList.remove('prev');
  next.classList.add('active');

  updateBottomNav(pageId);
  refreshPage(pageId);
}

function navigate(pageId) {
  uiVibrate('light');
  const current = document.querySelector('.page.active');
  if (current && current.id === pageId) return;
  if (!document.getElementById(pageId)) return;
  pageStack.push(current ? current.id : 'p-home');
  showPage(pageId, false);
}

function goBack() {
  uiVibrate('light');
  const fallback = 'p-home';
  const target = pageStack.pop() || fallback;
  showPage(target, true);
}

function navTo(name) {
  const map = { home: 'p-home', stats: 'p-stats', wallets: 'p-wallets', goals: 'p-goals', debts: 'p-debts' };
  const id = map[name];
  if (!id) return;
  pageStack = [];
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active', 'prev'); });
  const next = document.getElementById(id);
  if (next) { next.style.transform = ''; next.classList.add('active'); }
  updateBottomNav(id);
  refreshPage(id);
}

function updateBottomNav(pageId) {
  const map = { 'p-home': 'home', 'p-stats': 'stats', 'p-wallets': 'wallets', 'p-goals': 'goals', 'p-settings': 'settings', 'p-family': 'settings', 'p-recurring': 'settings', 'p-notes': 'settings', 'p-note-detail': 'settings', 'p-debts': 'debts' };
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const nm = map[pageId];
  if (nm) {
    const mobile = document.getElementById('nav-' + nm);
    const desktop = document.getElementById('rail-' + nm);
    if (mobile) {
      mobile.classList.add('active');
      moveNavBlob(mobile);
    }
    if (desktop) desktop.classList.add('active');
  }
}

// Custom Liquid Glass UI Navigation logic
function moveNavBlob(targetEl, isDragging = false, dragX = null) {
  const blob = document.getElementById('navBlob');
  const nav = document.getElementById('bottomNav');
  if (!blob || !nav) return;

  if (isDragging && dragX !== null) {
    // Continuous drag following the finger
    const navRect = nav.getBoundingClientRect();
    let x = dragX - navRect.left;
    // Bound the drop within the nav bar
    x = Math.max(25, Math.min(x, navRect.width - 25));
    blob.style.transition = 'none'; // Disable transition for 1:1 finger tracking
    blob.style.left = x + 'px';
    blob.classList.add('squish');
  } else if (targetEl) {
    // Snap to target
    const navRect = nav.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const centerLeft = (targetRect.left - navRect.left) + (targetRect.width / 2);
    blob.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.9, 0.1, 1), left 0.4s cubic-bezier(0.2, 0.9, 0.1, 1), width 0.4s cubic-bezier(0.2, 0.9, 0.1, 1), height 0.4s cubic-bezier(0.2, 0.9, 0.1, 1), background 0.3s';
    blob.style.left = centerLeft + 'px';
    blob.classList.remove('squish');
  }
}

function initLiquidNav() {
  const nav = document.getElementById('bottomNav');
  const blob = document.getElementById('navBlob');
  if (!nav || !blob) return;

  let isDragging = false;

  const handleStart = (clientX) => {
    isDragging = true;
    if (blob) blob.classList.add('active');
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    moveNavBlob(null, true, clientX);

    // Visually highlight the icon we are currently over
    const el = document.elementFromPoint(clientX, clientY);
    const navItem = el ? el.closest('.nav-item') : null;
    nav.querySelectorAll('.nav-item').forEach(n => n.classList.remove('drag-hover')); // Reset
    if (navItem) {
      navItem.classList.add('drag-hover');
    }
  };

  const handleEnd = (clientX, clientY) => {
    if (!isDragging) return;
    isDragging = false;
    if (blob) blob.classList.remove('active');
    nav.querySelectorAll('.nav-item').forEach(n => n.classList.remove('drag-hover')); // Reset scale/float

    // Find closest item upon release
    const el = document.elementFromPoint(clientX, clientY);
    const triggerItem = el ? el.closest('.nav-item') : null;

    if (triggerItem) {
      triggerItem.click(); // Trigger routing (which will call updateBottomNav and properly snap it)
    } else {
      // Revert to active item
      const active = nav.querySelector('.nav-item.active');
      if (active) moveNavBlob(active);
    }
  };

  // Touch Events
  nav.addEventListener('touchstart', (e) => { handleStart(e.touches[0].clientX); }, { passive: true });
  nav.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  nav.addEventListener('touchend', (e) => { handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY); });
  nav.addEventListener('touchcancel', (e) => { handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY); });

  // Mouse Events (for testing on desktop)
  nav.addEventListener('mousedown', (e) => { handleStart(e.clientX); });
  nav.addEventListener('mousemove', (e) => {
    if (isDragging) e.preventDefault();
    handleMove(e.clientX, e.clientY);
  });
  window.addEventListener('mouseup', (e) => {
    if (isDragging) handleEnd(e.clientX, e.clientY);
  });

  // Initial setup
  setTimeout(() => {
    const active = nav.querySelector('.nav-item.active');
    if (active) moveNavBlob(active);
  }, 100);
}

document.addEventListener('DOMContentLoaded', initLiquidNav);

// ─── ADD SHEET ───
function openAddSheet(type) {
  uiVibrate('medium');
  state.currentType = type || 'expense';
  setSheetType(state.currentType);
  document.getElementById('fAmount').value = '';
  document.getElementById('fNote').value = '';
  document.getElementById('fDate').valueAsDate = new Date();
  updateAmountDisplay();
  selectedCat = '';
  renderCatChips();
  populateFormDropdowns();
  state.isRecurring = false;
  const rt = document.getElementById('recurringToggle');
  rt.classList.remove('active');
  document.getElementById('recurringFreqSection').style.display = 'none';
  document.getElementById('addSheet').classList.add('open');
}

function closeAddSheet() { document.getElementById('addSheet').classList.remove('open') }

function openTransferSheet() {
  uiVibrate('medium');
  document.getElementById('tAmount').value = '';
  document.getElementById('tNote').value = '';
  document.getElementById('tDate').valueAsDate = new Date();
  populateTransferMembers();
  updateTransferDisplay();
  document.getElementById('transferSheet').classList.add('open');
}

function closeTransferSheet() {
  document.getElementById('transferSheet').classList.remove('open');
}

function populateTransferMembers() {
  const fromMemSel = document.getElementById('tFromMember');
  const toMemSel = document.getElementById('tToMember');

  const optionsHtml = state.members.map(m => `<option value="${m.id}">${escapeHTML(m.name)}</option>`).join('');
  fromMemSel.innerHTML = optionsHtml;
  toMemSel.innerHTML = optionsHtml;

  if (state.members.length > 0) {
    fromMemSel.value = state.members[0].id;
    toMemSel.value = state.members.length > 1 ? state.members[1].id : state.members[0].id;
  }

  populateTransferWallets('from');
  populateTransferWallets('to');
}

function populateTransferWallets(side) {
  if (!side) {
    populateTransferWallets('from');
    populateTransferWallets('to');
    return;
  }

  const isFrom = side === 'from';
  const memId = document.getElementById(isFrom ? 'tFromMember' : 'tToMember').value;
  const walletSel = document.getElementById(isFrom ? 'tFromWallet' : 'tToWallet');

  const memberWallets = state.wallets.filter(w => w.memberId === memId);
  walletSel.innerHTML = '<option value="">Select wallet</option>' + memberWallets.map(w => {
    return `<option value="${w.id}">${escapeHTML(w.name)}</option>`;
  }).join('');

  // Auto-select the first wallet if available
  if (memberWallets.length > 0) {
    walletSel.value = memberWallets[0].id;
  }

  if (isFrom) {
    updateTransferDisplay();
  }
}

function updateTransferDisplay() {
  const v = parseFloat(document.getElementById('tAmount').value) || 0;
  const sym = CURRENCIES[state.currency]?.s || '';
  document.getElementById('tAmountDisplay').textContent = sym + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // Show available balance from source wallet
  const fromId = document.getElementById('tFromWallet').value;
  const infoEl = document.getElementById('tFromBalanceInfo');
  if (infoEl) {
    if (fromId) {
      const bal = getLiveWalletBalance(fromId);
      infoEl.textContent = 'Available: ' + fmt(bal);
      infoEl.style.color = v > bal ? 'var(--red)' : 'var(--green)';
    } else {
      infoEl.textContent = '';
    }
  }
}

async function addTransfer() {
  const fromWalletId = document.getElementById('tFromWallet').value;
  const toWalletId = document.getElementById('tToWallet').value;
  let amount = parseFloat(document.getElementById('tAmount').value);
  const date = document.getElementById('tDate').value;
  const note = document.getElementById('tNote').value.trim();

  if (!fromWalletId || !toWalletId) { showToast('Select both wallets!'); return; }
  if (fromWalletId === toWalletId) { showToast('Select different wallets!'); return; }
  if (!amount || amount <= 0) { showToast('Enter a valid amount!'); return; }
  if (!date) { showToast('Select a date!'); return; }

  const fromBalance = getLiveWalletBalance(fromWalletId);
  if (amount > fromBalance) { showToast('Insufficient funds in source wallet!'); return; }

  if (exchangeRates[state.currency] && state.currency !== state.baseCurrency) { amount = amount / exchangeRates[state.currency]; }

  const tx = {
    uid: state.uid,
    type: 'transfer',
    category: 'Transfer',
    amount,
    date,
    walletId: fromWalletId,
    toWalletId: toWalletId,
    note,
    createdAt: new Date().toISOString()
  };

  showActionLoader();
  try {
    uiVibrate('success');
    await db.collection('transactions').add(tx);
    closeTransferSheet();
    showToast('Transfer completed!');
  } catch (e) {
    uiVibrate('error');
    console.error(e);
    showToast('Error processing transfer');
  } finally {
    hideActionLoader();
  }
}

function setSheetType(type) {
  state.currentType = type;
  const pi = document.getElementById('pillInc'), pe = document.getElementById('pillExp');
  const sb = document.getElementById('submitBtn');
  pi.classList.toggle('active', type === 'income');
  pi.classList.toggle('inc', type === 'income');
  pe.classList.toggle('active', type === 'expense');
  pe.classList.toggle('exp', type === 'expense');
  sb.className = 'submit-big ' + (type === 'income' ? 'inc' : 'exp');
  sb.textContent = type === 'income' ? 'Add Income' : 'Add Expense';
  document.getElementById('fWalletSection').style.display = '';
  selectedCat = '';
  renderCatChips();
}

function updateAmountDisplay() {
  const v = parseFloat(document.getElementById('fAmount').value) || 0;
  const sym = CURRENCIES[state.currency]?.s || '';
  document.getElementById('amountDisplay').textContent = sym + v.toLocaleString('en-US', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
  // Smart hint
  const hint = document.getElementById('amountHint');
  if (v === 0) { hint.textContent = ''; return; }
  if (state.currentType === 'expense') {
    const walletId = document.getElementById('fWallet')?.value || '';
    const bal = walletId ? getLiveWalletBalance(walletId) : getNoWalletBalance();
    if (v > bal) { hint.textContent = walletId ? '⚠️ Exceeds wallet balance' : '⚠️ Exceeds available balance'; hint.style.color = 'var(--red)' }
    else if (v > bal * 0.5) { hint.textContent = 'That\'s a big expense!'; hint.style.color = 'var(--yellow)' }
    else { hint.textContent = 'Looks good 👍'; hint.style.color = 'var(--green)' }
  } else { hint.textContent = ''; }
}

function toggleRecurring() {
  state.isRecurring = !state.isRecurring;
  document.getElementById('recurringToggle').classList.toggle('active', state.isRecurring);
  document.getElementById('recurringFreqSection').style.display = state.isRecurring ? 'block' : 'none';
}

function renderCatChips() {
  const cats = CATS[state.currentType];
  document.getElementById('catChips').innerHTML = cats.map(c => `<button class="cat-chip${c === selectedCat ? ' selected' : ''}" onclick="selectCat('${c}')">${CAT_ICONS[c] || ''} ${c}</button>`).join('');
}

function selectCat(cat) { selectedCat = cat; renderCatChips(); }

function populateFormDropdowns() {
  const mSel = document.getElementById('fMember');
  mSel.innerHTML = state.members.map(m => `<option value="${m.id}">${escapeHTML(m.name)}</option>`).join('');
  updateWalletDropdown();
}

function updateWalletDropdown() {
  const mId = document.getElementById('fMember').value;
  const wSel = document.getElementById('fWallet');
  wSel.innerHTML = '<option value="">No Wallet</option>' + state.wallets.filter(w => w.memberId === mId).map(w => `<option value="${w.id}">${escapeHTML(w.name)} (${escapeHTML(w.type)})</option>`).join('');
  updateAmountDisplay();
}

// ─── TRANSACTIONS ───
function getNoWalletBalance() {
  const inc = state.transactions.filter(t => t.type === 'income' && !t.walletId).reduce((s, t) => s + t.amount, 0);
  const exp = state.transactions.filter(t => t.type === 'expense' && !t.walletId).reduce((s, t) => s + t.amount, 0);
  let transOut = state.transactions.filter(t => t.type === 'transfer' && !t.walletId).reduce((s, t) => s + t.amount, 0);
  let transIn = state.transactions.filter(t => t.type === 'transfer' && !t.toWalletId).reduce((s, t) => s + t.amount, 0);
  return inc - exp - transOut + transIn;
}

function getLiveWalletBalance(walletId) {
  const w = state.wallets.find(x => x.id === walletId);
  if (!w) return 0;
  let bal = w.initialBalance || 0;
  state.transactions.forEach(t => {
    if (t.type === 'transfer') {
      if (t.walletId === walletId) bal -= t.amount;
      if (t.toWalletId === walletId) bal += t.amount;
    } else {
      if (t.walletId !== walletId) return;
      bal += t.type === 'income' ? t.amount : -t.amount;
    }
  });
  return bal;
}

async function addTransaction() {
  let amount = parseFloat(document.getElementById('fAmount').value);
  const date = document.getElementById('fDate').value;
  const note = document.getElementById('fNote').value.trim();
  const memberId = document.getElementById('fMember').value;
  const walletId = document.getElementById('fWallet').value;

  if (!amount || amount <= 0) { showToast('Enter a valid amount!'); return; }
  if (exchangeRates[state.currency] && state.currency !== state.baseCurrency) { amount = amount / exchangeRates[state.currency]; }
  if (!date) { showToast('Select a date!'); return; }
  if (!selectedCat) { showToast('Select a category!'); return; }
  if (state.currentType === 'expense') {
    if (walletId && amount > getLiveWalletBalance(walletId)) { showToast('Insufficient wallet funds!'); return; }
    if (!walletId && amount > getNoWalletBalance()) { showToast('Insufficient balance in No Wallet!'); return; }
  }

  const tx = { uid: state.uid, type: state.currentType, amount, date, category: selectedCat, note, memberId, walletId, createdAt: new Date().toISOString() };
  showActionLoader();
  try {
    uiVibrate('success');
    await db.collection('transactions').add(tx);
    // If recurring, save to recurring list
    if (state.isRecurring) {
      const freq = document.getElementById('fFreq').value;
      state.recurring.push({ id: 'r_' + Date.now(), name: selectedCat, amount: tx.amount, type: tx.type, freq, nextDate: date, active: true });
      await savePrefs();
    }
    closeAddSheet();
    showToast((state.currentType === 'income' ? 'Income' : 'Expense') + ' added!');
  } catch (e) { showToast('Error saving transaction'); }
  finally { hideActionLoader(); }
}

async function deleteTx(id) {
  if (!confirm('Delete this transaction?')) return;
  showActionLoader();
  try { uiVibrate('heavy'); await db.collection('transactions').doc(id).delete(); showToast('Deleted!'); } catch (e) { uiVibrate('error'); showToast('Error'); }
  finally { hideActionLoader(); }
}

function openEdit(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;
  state.editId = id;
  document.getElementById('eAmount').value = tx.amount;
  document.getElementById('eDate').value = tx.date;
  document.getElementById('eNote').value = tx.note || '';
  const ecat = document.getElementById('eCategory');
  const typeCats = CATS[tx.type];
  ecat.innerHTML = typeCats.map(c => `<option value="${c}"${c === tx.category ? ' selected' : ''}>${c}</option>`).join('');
  openModal('editModal');
}

async function saveEdit() {
  let amount = parseFloat(document.getElementById('eAmount').value);
  const tx = state.transactions.find(t => t.id === state.editId);
  if (!amount || amount <= 0) { showToast('Invalid amount'); return; }
  if (!tx) { showToast('Transaction not found'); return; }
  if (exchangeRates[state.currency] && state.currency !== state.baseCurrency) { amount = amount / exchangeRates[state.currency]; }
  if (tx.type === 'expense') {
    const available = tx.walletId ? getLiveWalletBalance(tx.walletId) + tx.amount : getNoWalletBalance() + tx.amount;
    if (amount > available) { showToast(tx.walletId ? 'Insufficient wallet funds!' : 'Insufficient balance!'); return; }
  }
    showActionLoader();
    try {
      await db.collection('transactions').doc(state.editId).update({ amount, date: document.getElementById('eDate').value, category: document.getElementById('eCategory').value, note: document.getElementById('eNote').value.trim() });
      closeModal('editModal'); showToast('Updated!');
    } catch (e) { showToast('Error'); }
    finally { hideActionLoader(); }
}

// ─── TOGGLE DETAILS ───
window.toggleTxDetails = function(item) {
  if (typeof item === 'string') {
    item = document.querySelector(`.tx-item[data-tx-id="${CSS.escape(item)}"]`);
  }
  if (!item) return;
  const willOpen = !item.classList.contains('expanded');
  // close any other open ones for cleaner UX
  document.querySelectorAll('.tx-item.expanded').forEach(el => { if (el !== item) el.classList.remove('expanded'); });
  item.classList.toggle('expanded', willOpen);
  uiVibrate('light');
};

// ─── RENDER TRANSACTIONS ───
function txHTML(t, showActs = true) {
  const fullDate = new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const shortDate = new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (t.type === 'transfer') {
    const fromW = state.wallets.find(w => w.id === t.walletId);
    const toW = state.wallets.find(w => w.id === t.toWalletId);
    const fromMember = state.members.find(m => m.id === (fromW && fromW.memberId));
    const toMember = state.members.find(m => m.id === (toW && toW.memberId));
    const fromMName = fromMember ? escapeHTML(fromMember.name) : '—';
    const toMName = toMember ? escapeHTML(toMember.name) : '—';
    const fromWName = escapeHTML((fromW && fromW.name) || 'Unknown');
    const toWName = escapeHTML((toW && toW.name) || 'Unknown');
    const noteText = t.note ? escapeHTML(t.note) : '';
    const acts = showActs ? `<button class="tx-detail-btn danger" onclick="deleteTx('${t.id}'); event.stopPropagation();"><span class="mi sm">delete</span> Delete</button>` : '';

    return `<div class="tx-item compact" data-tx-id="${t.id}" onclick="toggleTxDetails(this)">
      <div class="tx-row">
        <div class="tx-icon" style="background:rgba(56, 189, 248, 0.15);color:#38bdf8"><span class="mi sm">sync_alt</span></div>
        <div class="tx-info">
          <div class="tx-name">Wallet Transfer</div>
          <div class="tx-meta">${fromWName} → ${toWName}</div>
        </div>
        <div class="tx-right">
          <div class="tx-amount" style="color:#38bdf8">${fmt(t.amount)}</div>
          <div class="tx-date-small">${shortDate}</div>
        </div>
        <span class="tx-chevron mi sm">expand_more</span>
      </div>
      <div class="tx-details-dropdown">
        <div class="tx-details-inner">
          <div class="tx-details-grid">
            <div class="tx-detail-row"><span class="tx-detail-label">From</span><span class="tx-detail-value">${fromMName} · ${fromWName}</span></div>
            <div class="tx-detail-row"><span class="tx-detail-label">To</span><span class="tx-detail-value">${toMName} · ${toWName}</span></div>
            <div class="tx-detail-row"><span class="tx-detail-label">Date</span><span class="tx-detail-value">${fullDate}</span></div>
            ${noteText ? `<div class="tx-detail-row"><span class="tx-detail-label">Note</span><span class="tx-detail-value">${noteText}</span></div>` : ''}
          </div>
          ${acts ? `<div class="tx-detail-actions">${acts}</div>` : ''}
        </div>
      </div>
    </div>`;
  }

  const icon = CAT_ICONS[t.category] || '<span class="mi sm">payments</span>';
  const sign = t.type === 'income' ? '+' : '-';
  const safeCat = escapeHTML(t.category);
  const safeNote = t.note ? escapeHTML(t.note) : '';
  const member = state.members.find(m => m.id === t.memberId);
  const memberName = member ? escapeHTML(member.name) : '';
  let walletName = '—';
  let walletDeleted = false;
  if (t.walletId) {
    const wallet = state.wallets.find(w => w.id === t.walletId);
    walletName = wallet ? escapeHTML(wallet.name) : 'Deleted Wallet';
    walletDeleted = !wallet;
  } else if (t.deletedWalletName) {
    walletName = escapeHTML(t.deletedWalletName) + ' (deleted)';
    walletDeleted = true;
  }
  // Meta line shows "memberName · walletName" (each piece optional).
  // Note is rendered on its own single-line truncated row below.
  const metaParts = [];
  if (memberName) metaParts.push(memberName);
  if (walletName && walletName !== '—') metaParts.push(walletName);
  const metaLine = metaParts.join(' · ');
  const noteLine = safeNote ? `<div class="tx-note" title="${safeNote}">${safeNote}</div>` : '';
  const acts = showActs ? `
    <button class="tx-detail-btn" onclick="openEdit('${t.id}'); event.stopPropagation();"><span class="mi sm">edit</span> Edit</button>
    <button class="tx-detail-btn danger" onclick="deleteTx('${t.id}'); event.stopPropagation();"><span class="mi sm">delete</span> Delete</button>` : '';

  return `<div class="tx-item compact" data-tx-id="${t.id}" onclick="toggleTxDetails(this)">
    <div class="tx-row">
      <div class="tx-icon ${t.type === 'income' ? 'inc' : 'exp'}">${icon}</div>
      <div class="tx-info">
        <div class="tx-name">${safeCat}</div>
        ${metaLine ? `<div class="tx-meta">${metaLine}</div>` : ''}
        ${noteLine}
      </div>
      <div class="tx-right">
        <div class="tx-amount ${t.type === 'income' ? 'inc' : 'exp'}">${sign}${fmt(t.amount)}</div>
        <div class="tx-date-small">${shortDate}</div>
      </div>
      <span class="tx-chevron mi sm">expand_more</span>
    </div>
    <div class="tx-details-dropdown">
      <div class="tx-details-inner">
        <div class="tx-details-grid">
          ${memberName ? `<div class="tx-detail-row"><span class="tx-detail-label">Member</span><span class="tx-detail-value">${memberName}</span></div>` : ''}
          <div class="tx-detail-row"><span class="tx-detail-label">${t.type === 'income' ? 'Into wallet' : 'From wallet'}</span><span class="tx-detail-value"${walletDeleted ? ' style="opacity:0.7"' : ''}>${walletName}</span></div>
          <div class="tx-detail-row"><span class="tx-detail-label">Category</span><span class="tx-detail-value">${safeCat}</span></div>
          <div class="tx-detail-row"><span class="tx-detail-label">Date</span><span class="tx-detail-value">${fullDate}</span></div>
          ${safeNote ? `<div class="tx-detail-row"><span class="tx-detail-label">Note</span><span class="tx-detail-value">${safeNote}</span></div>` : ''}
        </div>
        ${acts ? `<div class="tx-detail-actions">${acts}</div>` : ''}
      </div>
    </div>
  </div>`;
}

function renderHome() {
  const txs = state.transactions;

  // Calculate current month's income and expenses
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthTxs = txs.filter(t => t.date.startsWith(currentMonthStr) && t.type !== 'transfer');

  const inc = currentMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const exp = currentMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Calculate total main balance matching wallets plus unassigned transactions (Lifetime)
  const totalAllWallets = state.wallets.reduce((sum, w) => sum + getLiveWalletBalance(w.id), 0);
  const bal = totalAllWallets + getNoWalletBalance();

  const heroBalEl = document.getElementById('heroBalance');
  heroBalEl.style.color = bal < 0 ? 'var(--red)' : '';
  animateNumber(heroBalEl, bal);
  animateNumber(document.getElementById('heroIncome'), inc);
  animateNumber(document.getElementById('heroExpense'), exp);

  const recent = currentMonthTxs.slice(0, 5);
  document.getElementById('recentTxList').innerHTML = recent.length
    ? `<div style="background:var(--surface);border-radius:var(--radius-sm);border:1px solid var(--border);padding:0 16px">` + recent.map(t => txHTML(t, true)).join('') + `</div>`
    : `<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">No transactions this month yet.<br>Tap + to add one!</div></div>`;

  // Insight
  const insight = generateInsight(currentMonthTxs, inc, exp, bal);
  const ic = document.getElementById('insightCard');
  if (insight) { ic.style.display = 'flex'; document.getElementById('insightText').innerHTML = insight; }
  else { ic.style.display = 'none'; }
}

function generateInsight(currentMonthTxs, inc, exp, bal) {
  if (!currentMonthTxs.length) return null;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const spending = {};
  currentMonthTxs.filter(t => t.type === 'expense').forEach(t => { spending[t.category] = (spending[t.category] || 0) + t.amount; });
  for (const b of state.budgets) {
    const spent = spending[b.category] || 0;
    if (spent >= b.limit) return `⚠️ You exceeded your <b>${b.category}</b> budget! (${fmt(b.limit)})`;
    if (spent >= b.limit * 0.8) return `⚠️ Used over 80% of <b>${b.category}</b> budget!`;
  }

  const savingsRate = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0;
  // Top expense category
  const catMap = {}; currentMonthTxs.filter(t => t.type === 'expense' && t.type !== 'transfer').forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
  if (savingsRate < 0) return `You're spending more than you earn. Consider reviewing your <b>${topCat ? topCat[0] : 'expenses'}</b> category.`;
  if (savingsRate > 40) return `Great job! You're saving <b>${savingsRate}%</b> of your income. Keep it up! 🎉`;
  if (topCat) return `Your biggest expense is <b>${topCat[0]}</b> at ${fmt(topCat[1])}. Your savings rate is <b>${savingsRate}%</b>.`;
  return null;
}

function renderFullTx() {
  const typeF = document.getElementById('filterType').value;
  const catF = document.getElementById('filterCat').value;
  const searchF = document.getElementById('filterSearch').value.toLowerCase();
  const dateF = document.getElementById('filterDate').value;

  const now = new Date();
  const thisMonthHash = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthHash = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  let txs = state.transactions.filter(t => {
    if (t.type === 'transfer') return false;
    if (typeF && t.type !== typeF) return false;
    if (catF && t.category !== catF) return false;
    if (searchF) {
      const matchName = (t.category || '').toLowerCase().includes(searchF);
      const matchNote = (t.note || '').toLowerCase().includes(searchF);
      if (!matchName && !matchNote) return false;
    }
    if (dateF === 'thisMonth' && !t.date.startsWith(thisMonthHash)) return false;
    if (dateF === 'lastMonth' && !t.date.startsWith(lastMonthHash)) return false;
    return true;
  });
  const allCats = [...CATS.income, ...CATS.expense];
  document.getElementById('filterCat').innerHTML = '<option value="">All Categories</option>' + allCats.map(c => `<option value="${c}">${c}</option>`).join('');
  document.getElementById('filterCat').value = catF;
  document.getElementById('fullTxList').innerHTML = txs.length
    ? `<div style="background:var(--surface);border-radius:var(--radius-sm);border:1px solid var(--border);padding:0 16px;margin-bottom:16px">` + txs.map(t => txHTML(t, true)).join('') + `</div>`
    : `<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">No transactions found.</div></div>`;
}

// ─── TRANSFER HISTORY ───
function renderTransferHistory() {
  const searchF = (document.getElementById('transferSearchFilter')?.value || '').toLowerCase();

  let transfers = state.transactions
    .filter(t => t.type === 'transfer')
    .filter(t => {
      if (!searchF) return true;
      const fromW = state.wallets.find(w => w.id === t.walletId)?.name || '';
      const toW = state.wallets.find(w => w.id === t.toWalletId)?.name || '';
      const note = t.note || '';
      return (
        fromW.toLowerCase().includes(searchF) ||
        toW.toLowerCase().includes(searchF) ||
        note.toLowerCase().includes(searchF)
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalAmount = transfers.reduce((s, t) => s + t.amount, 0);
  const container = document.getElementById('transferHistoryList');
  if (!container) return;

  if (!transfers.length) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🔄</div>
        <div class="empty-text">No transfers found.<br>Use "Make Transfer" to move funds between wallets.</div>
      </div>`;
    return;
  }

  const summaryBar = `
    <div style="display:flex;gap:12px;padding:0 0 16px;">
      <div class="stat-box" style="flex:1;cursor:default">
        <div class="stat-box-label"><span class="stat-dot" style="background:#38bdf8"></span>Total Transfers</div>
        <div class="stat-box-val" style="color:#38bdf8">${transfers.length}</div>
        <div class="stat-box-sub">transactions</div>
      </div>
      <div class="stat-box" style="flex:1;cursor:default">
        <div class="stat-box-label"><span class="stat-dot" style="background:#a78bfa"></span>Total Moved</div>
        <div class="stat-box-val" style="color:#a78bfa">${fmt(totalAmount)}</div>
        <div class="stat-box-sub">across wallets</div>
      </div>
    </div>`;

  const listHTML = `<div style="background:var(--surface);border-radius:var(--radius-sm);border:1px solid var(--border);padding:0 16px;margin-bottom:16px">${transfers.map(t => txHTML(t, true)).join('')}</div>`;

  container.innerHTML = summaryBar + listHTML;
}

// ─── STATS ───
function openTransactionsFromStat(type) {
  document.getElementById('filterSearch').value = '';
  document.getElementById('filterDate').value = 'all';
  document.getElementById('filterType').value = type === 'income' || type === 'expense' ? type : '';
  document.getElementById('filterCat').value = '';
  navigate('p-transactions');
  renderFullTx();
}

function populateAnalyticsMonths() {
  const filterEl = document.getElementById('analyticsMonthFilter');
  if (!filterEl) return;

  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Automatically collect all months with transactions
  const monthSet = new Set();
  monthSet.add(currentKey); // Always include current month
  state.transactions.forEach(t => {
    if (t.date && t.date.length >= 7) {
      monthSet.add(t.date.substring(0, 7));
    }
  });

  const sortedMonths = Array.from(monthSet).sort((a, b) => b.localeCompare(a));

  const prevValue = filterEl.value;
  filterEl.innerHTML = sortedMonths.map(m => {
    const [y, mo] = m.split('-');
    const label = new Date(y, mo - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    return `<option value="${m}">${label}${m === currentKey ? ' (Current)' : ''}</option>`;
  }).join('');

  if (sortedMonths.includes(prevValue)) {
    filterEl.value = prevValue;
  } else {
    filterEl.value = sortedMonths[0]; // defaults to newest/current
  }
}

function refreshStats() {
  populateAnalyticsMonths();
  const txs = state.transactions;
  const filterEl = document.getElementById('analyticsMonthFilter');
  let filterMonthStr = filterEl ? filterEl.value : '';
  if (!filterMonthStr) {
    const now = new Date();
    filterMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  const currentMonthTxs = txs.filter(t => t.date.startsWith(filterMonthStr));

  const inc = currentMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const exp = currentMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const totalAllWallets = state.wallets.reduce((sum, w) => sum + getLiveWalletBalance(w.id), 0);
  const bal = totalAllWallets + getNoWalletBalance();

  const savings = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0;
  animateNumber(document.getElementById('sb-balance'), bal);
  animateNumber(document.getElementById('sb-income'), inc);
  animateNumber(document.getElementById('sb-expense'), exp);
  animateNumber(document.getElementById('sb-savings'), savings, { formatter: pctFormatter, duration: 600 });
  document.getElementById('sb-icount').textContent = currentMonthTxs.filter(t => t.type === 'income').length + ' txns';
  document.getElementById('sb-ecount').textContent = currentMonthTxs.filter(t => t.type === 'expense').length + ' txns';
}

function rebuildCharts() {
  refreshStats();
  const css = getComputedStyle(document.documentElement);
  const COLORS = [
    css.getPropertyValue('--purple').trim() || '#5e5ce6', '#30d158', '#ff453a', '#ffd60a',
    css.getPropertyValue('--accent-2').trim() || '#a78bfa', '#38bdf8', '#fb923c', '#34d399',
    '#f472b6', '#60a5fa', '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4',
    '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8',
    '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
  ];
  const textColor = css.getPropertyValue('--text').trim() || '#3a3a3c'; const gridColor = css.getPropertyValue('--border2').trim() || '#1c1c1e';
  Chart.defaults.color = textColor; Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
  Chart.defaults.animation = { duration: 800, easing: 'easeOutCubic' };

  // PIE
  const now = new Date();
  const filterEl = document.getElementById('analyticsMonthFilter');
  let filterMonthStr = filterEl ? filterEl.value : '';
  if (!filterMonthStr) {
    filterMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  const catMap = {};
  state.transactions.filter(t => t.type === 'expense' && t.date.startsWith(filterMonthStr)).forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const labs = Object.keys(catMap), vals = Object.values(catMap);
  if (pieChart) pieChart.destroy();
  const pc = document.getElementById('pieChart').getContext('2d');
  pieChart = new Chart(pc, { type: 'doughnut', data: { labels: labs.length ? labs : ['No data'], datasets: [{ data: vals.length ? vals : [1], backgroundColor: vals.length ? COLORS.slice(0, labs.length) : [gridColor], borderWidth: 0, hoverOffset: 8 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '68%', animation: { animateRotate: true, animateScale: true, duration: 900, easing: 'easeOutCubic' }, plugins: { legend: { position: 'right', labels: { boxWidth: 8, boxHeight: 8, font: { size: 10 } } }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)}` } } } } });

  const months = {};
  for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; months[k] = { income: 0, expense: 0 }; }
  state.transactions.forEach(t => {
    if (t.type === 'transfer') return;
    const k = t.date.slice(0, 7);
    if (months[k]) months[k][t.type] += t.amount;
  });

  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDt = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDt.getFullYear()}-${String(lastMonthDt.getMonth() + 1).padStart(2, '0')}`;
  const tmExp = months[thisMonthKey] ? months[thisMonthKey].expense : 0;
  const lmExp = months[lastMonthKey] ? months[lastMonthKey].expense : 0;
  const mc = document.getElementById('monthlyComparison');
  if (mc) {
    if (lmExp === 0 && tmExp > 0) { mc.innerHTML = 'First month of tracking!'; mc.style.color = "var(--text2)"; }
    else if (lmExp === 0) { mc.innerHTML = ''; }
    else {
      const diff = tmExp - lmExp;
      const pct = Math.abs(Math.round((diff / lmExp) * 100));
      if (diff > 0) { mc.innerHTML = `⚠️ ${pct}% more spent than last month`; mc.style.color = 'var(--red)'; }
      else { mc.innerHTML = `📉 ${pct}% less spent than last month`; mc.style.color = 'var(--green)'; }
    }
  }

  try {
    const mLabs = Object.keys(months).map(k => { const [y, m] = k.split('-'); return new Date(y, m - 1).toLocaleString('default', { month: 'short' }); });
    if (barChart) barChart.destroy();
    const bc = document.getElementById('barChart').getContext('2d');
    
    // Fallback data if all zero, just to ensure Chart.js scales properly without crashing
    const incData = Object.values(months).map(m => m.income);
    const expData = Object.values(months).map(m => m.expense);
    
    barChart = new Chart(bc, { 
      type: 'bar', 
      data: { 
        labels: mLabs, 
        datasets: [
          { label: 'Income', data: incData, backgroundColor: 'rgba(48,209,88,0.8)', borderRadius: 4 }, 
          { label: 'Expense', data: expData, backgroundColor: 'rgba(255,69,58,0.8)', borderRadius: 4 }
        ] 
      }, 
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutCubic' },
        plugins: { 
          legend: { labels: { font: { size: 10 } } }
        }, 
        scales: { 
          y: { 
            beginAtZero: true,
            suggestedMax: 100,
            grid: { color: gridColor }
          }, 
          x: { 
            grid: { display: false } 
          } 
        } 
      } 
    });
  } catch (err) {
    console.error('BarChart init error:', err);
    const mc = document.getElementById('monthlyComparison');
    if (mc) { mc.innerHTML = 'Chart Error: ' + err.message; mc.style.color = 'var(--red)'; }
  }

  renderBudgets();
}

// ─── BUDGETS ───
function openBudgetModal() {
  const allCats = [...CATS.expense];
  document.getElementById('bCategory').innerHTML = allCats.map(c => `<option value="${c}">${c}</option>`).join('');
  document.getElementById('bLimit').value = '';
  openModal('budgetModal');
}

async function saveBudget() {
  const cat = document.getElementById('bCategory').value;
  const limit = parseFloat(document.getElementById('bLimit').value);
  if (!limit || limit <= 0) { showToast('Enter a valid limit'); return; }
  const existing = state.budgets.findIndex(b => b.category === cat);
  if (existing >= 0) state.budgets[existing].limit = limit;
  else state.budgets.push({ id: 'b_' + Date.now(), category: cat, limit });
  await savePrefs(); closeModal('budgetModal'); renderBudgets(); showToast('Budget saved!');
}

function renderBudgets() {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const spending = {};
  state.transactions.filter(t => t.type === 'expense' && t.type !== 'transfer' && t.date.startsWith(monthKey)).forEach(t => { spending[t.category] = (spending[t.category] || 0) + t.amount; });
  const bl = document.getElementById('budgetList');
  if (!state.budgets.length) { bl.innerHTML = '<div class="empty" style="padding:24px"><div class="empty-text">No budgets set yet.</div></div>'; return; }
  bl.innerHTML = state.budgets.map(b => {
    const spent = spending[b.category] || 0;
    const pct = Math.min((spent / b.limit) * 100, 100);
    const over = spent > b.limit;
    const color = over ? 'var(--red)' : pct > 70 ? 'var(--yellow)' : 'var(--green)';
    return `<div class="budget-item"><div class="budget-row"><div class="budget-name">${CAT_ICONS[b.category] || ''} ${escapeHTML(b.category)}</div><div class="budget-vals">${fmt(spent)} / ${fmt(b.limit)}</div></div><div class="budget-bar"><div class="budget-fill" style="width:${pct}%;background:${color}"></div></div></div>`;
  }).join('');
}

// ─── GOALS ───
function openGoalModal() { document.getElementById('gName').value = ''; document.getElementById('gTarget').value = ''; document.getElementById('gSaved').value = '0'; openModal('goalModal'); }

async function saveGoal() {
  const name = document.getElementById('gName').value.trim();
  const target = parseFloat(document.getElementById('gTarget').value);
  const saved = parseFloat(document.getElementById('gSaved').value) || 0;
  const color = document.getElementById('gColor').value;
  if (!name || !target || target <= 0) { showToast('Fill in all fields'); return; }
  state.goals.push({ id: 'g_' + Date.now(), name, target, saved, color });
  await savePrefs(); closeModal('goalModal'); renderGoals(); showToast('Goal added!');
}

function renderGoals() {
  const gl = document.getElementById('goalsList');
  if (!state.goals.length) { gl.innerHTML = '<div class="empty"><div class="empty-icon">🎯</div><div class="empty-text">No goals yet.<br>Tap + to add a savings goal!</div></div>'; return; }
  gl.innerHTML = state.goals.map((g, i) => {
    const pct = Math.min(Math.round((g.saved / g.target) * 100), 100);
    return `<div class="goal-item" style="--g-color:${g.color}"><div style="position:absolute;top:0;left:0;bottom:0;width:4px;background:${g.color};border-radius:4px 0 0 4px"></div>
    <div class="goal-top"><div><div class="goal-name">${escapeHTML(g.name)}</div><div class="goal-amounts">${fmt(g.saved)} saved of ${fmt(g.target)}</div></div><div class="goal-pct" style="color:${g.color}">${pct}%</div></div>
    <div class="goal-bar"><div class="goal-fill" style="width:${pct}%;background:${g.color}"></div></div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="modal-btn cancel" style="flex:none;padding:7px 14px;font-size:0.78rem" onclick="addToGoal(${i})">+ Add</button>
      <button class="modal-btn cancel" style="flex:none;padding:7px 14px;font-size:0.78rem;color:var(--red)" onclick="deleteGoal(${i})">Delete</button>
    </div></div>`;
  }).join('');
}

async function addToGoal(i) {
  const amt = parseFloat(prompt('Amount to add to goal:'));
  if (!amt || amt <= 0) return;
  const wasComplete = state.goals[i].saved >= state.goals[i].target;
  state.goals[i].saved += amt;
  const isComplete = state.goals[i].saved >= state.goals[i].target;
  await savePrefs(); renderGoals();
  if (!wasComplete && isComplete) { showToast('🎉 Goal reached!'); triggerConfetti(); }
  else { showToast('Goal updated!'); }
}

async function deleteGoal(i) {
  if (!confirm('Delete this goal?')) return;
  state.goals.splice(i, 1); await savePrefs(); renderGoals(); showToast('Goal deleted');
}

// ─── RECURRING ───
function openRecurringModal() { document.getElementById('rName').value = ''; document.getElementById('rAmount').value = ''; document.getElementById('rDate').valueAsDate = new Date(); openModal('recurringModal'); }

async function saveRecurring() {
  const name = document.getElementById('rName').value.trim();
  const amount = parseFloat(document.getElementById('rAmount').value);
  const type = document.getElementById('rType').value;
  const freq = document.getElementById('rFreq').value;
  const nextDate = document.getElementById('rDate').value;
  if (!name || !amount || amount <= 0) { showToast('Fill in all fields'); return; }
  state.recurring.push({ id: 'r_' + Date.now(), name, amount, type, freq, nextDate, active: true });
  await savePrefs(); closeModal('recurringModal'); renderRecurring(); showToast('Recurring added!');
}

function renderRecurring() {
  const rl = document.getElementById('recurringList');
  if (!state.recurring.length) { rl.innerHTML = '<div class="empty" style="padding:24px"><div class="empty-text">No recurring transactions.</div></div>'; return; }
  rl.innerHTML = state.recurring.map((r, i) => {
    const icon = CAT_ICONS[r.name] || '🔁';
    const color = r.type === 'income' ? 'var(--green)' : 'var(--red)';
    const sign = r.type === 'income' ? '+' : '-';
    return `<div class="recurring-item"><div class="rec-icon" style="background:${r.type === 'income' ? 'var(--green-light)' : 'var(--red-light)'}">${icon}</div><div class="rec-info"><div class="rec-name">${escapeHTML(r.name)}</div><div class="rec-freq">${escapeHTML(r.freq)} · ${r.type}</div></div><div class="rec-right"><div class="rec-amount" style="color:${color}">${sign}${fmt(r.amount)}</div><div class="rec-next">Next: ${r.nextDate}</div></div><button class="rec-toggle${r.active ? ' on' : ''}" onclick="toggleRecurringItem(${i})"></button></div>`;
  }).join('');

  // Upcoming bills (next 7 days)
  const today = new Date(); const in7 = new Date(today); in7.setDate(today.getDate() + 7);
  const upcoming = state.recurring.filter(r => { const d = new Date(r.nextDate); return d >= today && d <= in7 && r.active; });
  const upDiv = document.getElementById('recurringUpcoming');
  if (upcoming.length) {
    upDiv.style.display = 'block';
    document.getElementById('upcomingList').innerHTML = upcoming.map(r => `<div style="background:var(--yellow-light);border:1px solid rgba(255,214,10,0.2);border-radius:var(--radius-sm);padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:12px"><div style="font-size:1.2rem">⚠️</div><div><div style="font-size:0.88rem;font-weight:700">${escapeHTML(r.name)} due on ${r.nextDate}</div><div style="font-size:0.78rem;color:var(--text2);font-weight:600">${fmt(r.amount)} · ${r.type}</div></div></div>`).join('');
  } else { upDiv.style.display = 'none'; }
}

async function toggleRecurringItem(i) { state.recurring[i].active = !state.recurring[i].active; await savePrefs(); renderRecurring(); }

// ─── NOTEBOOKS ───
function ensureNoteBooks() {
  state.noteBooks = state.noteBooks || [];
  state.notes = state.notes || [];
  if (!state.noteBooks.length && state.notes.length) {
    const id = 'nb_default';
    state.noteBooks.push({ id, name: 'Default Notebook', desc: 'Old notes', createdAt: new Date().toISOString() });
    state.notes = state.notes.map(n => ({ ...n, bookId: n.bookId || id }));
    return true;
  }
  return false;
}

function openNoteBookModal() {
  document.getElementById('noteBookName').value = '';
  document.getElementById('noteBookDesc').value = '';
  openModal('noteBookModal');
}

async function saveNoteBook() {
  const name = document.getElementById('noteBookName').value.trim();
  const desc = document.getElementById('noteBookDesc').value.trim();
  if (!name) { showToast('Notebook name required'); return; }
  state.noteBooks.push({ id: 'nb_' + Date.now(), name, desc, createdAt: new Date().toISOString() });
  await savePrefs();
  closeModal('noteBookModal');
  renderNotes();
  showToast('Notebook created!');
}

function noteBookTotal(bookId) {
  return (state.notes || []).filter(n => n.bookId === bookId).reduce((s, n) => s + (parseFloat(n.amount) || 0), 0);
}

function openNoteBook(bookId) {
  state.selectedNoteBookId = bookId;
  navigate('p-note-detail');
  renderNoteBookDetail();
}

function backToNoteBooks() {
  state.selectedNoteBookId = '';
  pageStack = [];
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active', 'prev'));
  const notesPage = document.getElementById('p-notes');
  if (notesPage) { notesPage.style.transform = ''; notesPage.classList.add('active'); }
  updateBottomNav('p-settings');
  renderNotes();
}

function backToSettings() {
  state.selectedNoteBookId = '';
  pageStack = [];
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active', 'prev'));
  const settingsPage = document.getElementById('p-settings');
  if (settingsPage) { settingsPage.style.transform = ''; settingsPage.classList.add('active'); }
  updateBottomNav('p-settings');
}

function renderNotes() {
  ensureNoteBooks();
  const totalEl = document.getElementById('notesTotalValue');
  const listEl = document.getElementById('noteBooksList');
  if (!totalEl || !listEl) return;
  const total = (state.notes || []).reduce((s, n) => s + (parseFloat(n.amount) || 0), 0);
  totalEl.textContent = fmt(total);
  if (!state.noteBooks.length) {
    listEl.innerHTML = '<div class="empty"><div class="empty-icon">🧾</div><div class="empty-text">No notebooks yet.<br>Tap + to create one!</div></div>';
    return;
  }
  listEl.innerHTML = state.noteBooks.map(book => {
    const count = (state.notes || []).filter(n => n.bookId === book.id).length;
    const desc = book.desc ? `<div class="note-details">${escapeHTML(book.desc)}</div>` : '';
    return `<div class="note-item note-book-item">
      <div class="note-main" onclick="openNoteBook('${book.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' ')openNoteBook('${book.id}')">
        <div class="note-title">${escapeHTML(book.name)}</div>
        <div class="note-date">${count} entries</div>
        ${desc}
      </div>
      <div class="note-right" onclick="openNoteBook('${book.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' ')openNoteBook('${book.id}')">
        <div class="note-amount">${fmt(noteBookTotal(book.id))}</div>
        <span class="note-arrow">→</span>
      </div>
      <button class="tx-act note-delete-btn" onclick="deleteNoteBook('${book.id}')">🗑️</button>
    </div>`;
  }).join('');
}

async function deleteNoteBook(bookId) {
  const book = (state.noteBooks || []).find(b => b.id === bookId);
  if (!book || !confirm(`Delete "${book.name}" notebook and all its entries?`)) return;
  state.noteBooks = state.noteBooks.filter(b => b.id !== bookId);
  state.notes = (state.notes || []).filter(n => n.bookId !== bookId);
  if (state.selectedNoteBookId === bookId) state.selectedNoteBookId = '';
  await savePrefs();
  renderNotes();
  showToast('Notebook deleted');
}

function openNoteModal() {
  if (!state.selectedNoteBookId) { showToast('Select a notebook first'); return; }
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteAmount').value = '';
  document.getElementById('noteDetails').value = '';
  document.getElementById('noteDate').valueAsDate = new Date();
  openModal('noteModal');
}

async function saveNote() {
  const title = document.getElementById('noteTitle').value.trim();
  const amount = parseFloat(document.getElementById('noteAmount').value);
  const date = document.getElementById('noteDate').value;
  const details = document.getElementById('noteDetails').value.trim();
  if (!state.selectedNoteBookId) { showToast('Select a notebook first'); return; }
  if (!title || !amount || amount <= 0 || !date) { showToast('Fill in all fields'); return; }
  state.notes.push({ id: 'n_' + Date.now(), bookId: state.selectedNoteBookId, title, amount, date, details, createdAt: new Date().toISOString() });
  state.notes.sort((a, b) => new Date(b.date) - new Date(a.date));
  await savePrefs();
  closeModal('noteModal');
  renderNoteBookDetail();
  showToast('Entry saved!');
}

function renderNoteBookDetail() {
  ensureNoteBooks();
  const book = state.noteBooks.find(b => b.id === state.selectedNoteBookId);
  const titleEl = document.getElementById('noteBookTitle');
  const subEl = document.getElementById('noteBookSub');
  const totalEl = document.getElementById('noteBookTotalValue');
  const listEl = document.getElementById('notesList');
  if (!titleEl || !subEl || !totalEl || !listEl) return;
  if (!book) {
    titleEl.textContent = 'Notebook';
    subEl.textContent = 'Select a notebook';
    totalEl.textContent = fmt(0);
    listEl.innerHTML = '<div class="empty"><div class="empty-icon">🧾</div><div class="empty-text">Select a notebook first.</div></div>';
    return;
  }
  const notes = (state.notes || []).filter(n => n.bookId === book.id).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  titleEl.textContent = book.name;
  subEl.textContent = book.desc || `${notes.length} entries`;
  totalEl.textContent = fmt(noteBookTotal(book.id));
  if (!notes.length) {
    listEl.innerHTML = '<div class="empty"><div class="empty-icon">🧾</div><div class="empty-text">No entries yet.<br>Tap + to add one!</div></div>';
    return;
  }
  listEl.innerHTML = notes.map((n, i) => {
    const d = new Date(n.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const details = n.details ? `<div class="note-details">${escapeHTML(n.details)}</div>` : '';
    return `<div class="note-item">
      <div class="note-main">
        <div class="note-title">${escapeHTML(n.title)}</div>
        <div class="note-date">${d}</div>
        ${details}
      </div>
      <div class="note-right">
        <div class="note-amount">${fmt(n.amount)}</div>
        <button class="tx-act" onclick="deleteNote(${i})">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

async function deleteNote(i) {
  const notes = (state.notes || []).filter(n => n.bookId === state.selectedNoteBookId).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  const note = notes[i];
  if (!note || !confirm('Delete this entry?')) return;
  state.notes = state.notes.filter(n => n.id !== note.id);
  await savePrefs();
  renderNoteBookDetail();
  showToast('Entry deleted');
}

// ─── WALLETS ───
// Track which member cards are currently expanded across re-renders.
const expandedMemberCards = new Set();

function toggleMemberCard(memberId) {
  const card = document.querySelector(`.member-card[data-member-id="${CSS.escape(memberId)}"]`);
  if (!card) return;
  const isOpen = card.classList.toggle('expanded');
  if (isOpen) expandedMemberCards.add(memberId);
  else expandedMemberCards.delete(memberId);
  uiVibrate('light');
}

function renderWallets() {
  const totalAllWallets = state.wallets.reduce((sum, w) => sum + getLiveWalletBalance(w.id), 0);
  const totalEl = document.getElementById('walletsTotalValue');
  if (totalEl) totalEl.textContent = fmt(totalAllWallets);

  // Only show members who actually have wallets created.
  const membersWithWallets = state.members.filter(m =>
    state.wallets.some(w => w.memberId === m.id)
  );

  if (!membersWithWallets.length) {
    document.getElementById('memberCards').innerHTML = `
      <div class="empty" style="padding:24px">
        <div class="empty-icon">👛</div>
        <div class="empty-text">No wallets yet.<br>Go to <b>Family</b> and add a wallet to a member.</div>
      </div>`;
    return;
  }

  document.getElementById('memberCards').innerHTML = membersWithWallets.map(m => {
    const mWallets = state.wallets.filter(w => w.memberId === m.id);
    const total = mWallets.reduce((s, w) => s + getLiveWalletBalance(w.id), 0);
    const isExpanded = expandedMemberCards.has(m.id);
    const walletsHtml = mWallets.map(w => {
      const bal = getLiveWalletBalance(w.id);
      return `<div class="wallet-row"><div class="wallet-left"><div class="wallet-dot" style="background:var(--purple)"></div><div><div class="wallet-name">${escapeHTML(w.name)}</div><div class="wallet-type">${escapeHTML(w.type)}</div></div></div><div style="display:flex;align-items:center;gap:8px"><div class="wallet-bal">${fmt(bal)}</div><div class="wallet-acts"><button class="tx-act" onclick="event.stopPropagation();openEditWalletModal('${w.id}')">✏️</button><button class="tx-act" onclick="event.stopPropagation();deleteWallet('${w.id}')">🗑️</button></div></div></div>`;
    }).join('');
    return `<div class="member-card${isExpanded ? ' expanded' : ''}" data-member-id="${m.id}">
      <div class="member-header" onclick="toggleMemberCard('${m.id}')">
        <div class="member-info">
          <div class="member-avatar">${m.name[0].toUpperCase()}</div>
          <div>
            <div class="member-name">${escapeHTML(m.name)}</div>
            <div class="member-total">Total: ${fmt(total)} · ${mWallets.length} wallet${mWallets.length > 1 ? 's' : ''}</div>
          </div>
        </div>
        <div class="member-header-actions">
          <button class="modal-btn confirm" style="flex:none;padding:8px 14px;font-size:0.8rem" onclick="event.stopPropagation();openWalletModal('${m.id}')">+ Wallet</button>
          <span class="member-chevron mi">expand_more</span>
        </div>
      </div>
      <div class="member-wallets-wrap">
        <div class="member-wallets">${walletsHtml}</div>
      </div>
    </div>`;
  }).join('') + '<div style="height:4px"></div>';
}



function refreshMainBalances() {
  renderHome();
  refreshStats();
}

function openWalletModal(memberId) { document.getElementById('wMemberId').value = memberId; document.getElementById('wName').value = ''; document.getElementById('wBalance').value = '0'; openModal('walletModal'); }

async function saveWallet() {
  const name = document.getElementById('wName').value.trim();
  const type = document.getElementById('wType').value;
  const memberId = document.getElementById('wMemberId').value;
  const initialBalance = parseFloat(document.getElementById('wBalance').value) || 0;
  if (!name) { showToast('Name required'); return; }
  
  const newId = 'w_' + Date.now();
  state.wallets.push({ id: newId, name, type, memberId, initialBalance });
  
  // Future merge logic: Find if there are transactions that were orphaned by a deleted wallet with the exact same name
  const orphanedTxs = state.transactions.filter(t => t.deletedWalletName && t.deletedWalletName.toLowerCase() === name.toLowerCase());
  if (orphanedTxs.length > 0) {
    const batch = db.batch();
    orphanedTxs.forEach(t => batch.update(db.collection('transactions').doc(t.id), { walletId: newId, deletedWalletName: firebase.firestore.FieldValue.delete() }));
    await batch.commit();
    state.transactions = state.transactions.map(t => {
      if (t.deletedWalletName && t.deletedWalletName.toLowerCase() === name.toLowerCase()) {
        const { deletedWalletName, ...rest } = t;
        return { ...rest, walletId: newId };
      }
      return t;
    });
    showToast(`Wallet added & merged with previous data!`);
  } else {
    showToast('Wallet added!');
  }

  await savePrefs(); closeModal('walletModal'); renderWallets(); refreshMainBalances(); populateFormDropdowns();
}

function openEditWalletModal(walletId) {
  const w = state.wallets.find(x => x.id === walletId);
  if (!w) return;
  document.getElementById('ewId').value = walletId;
  document.getElementById('ewName').value = w.name || '';
  document.getElementById('ewType').value = w.type || 'Cash';
  document.getElementById('ewBalance').value = getLiveWalletBalance(walletId);
  openModal('editWalletModal');
}

async function saveEditedWallet() {
  const id = document.getElementById('ewId').value;
  const name = document.getElementById('ewName').value.trim();
  const type = document.getElementById('ewType').value;
  const typedBal = parseFloat(document.getElementById('ewBalance').value);

  if (!name) { showToast('Name required'); return; }
  if (isNaN(typedBal)) { showToast('Invalid balance'); return; }

  const w = state.wallets.find(x => x.id === id);
  if (w) {
    w.name = name;
    w.type = type;

    let netTransactions = 0;
    state.transactions.forEach(t => {
      if (t.walletId !== w.id) return;
      netTransactions += t.type === 'income' ? t.amount : -t.amount;
    });

    w.initialBalance = typedBal - netTransactions;

    await savePrefs();
    closeModal('editWalletModal');
    renderWallets();
    refreshMainBalances();
    renderFamily();
    populateFormDropdowns();
    showToast('Wallet updated!');
  }
}

async function deleteWallet(walletId) {
  if (!confirm('Delete this wallet?')) return;
  try {
    const w = state.wallets.find(x => x.id === walletId);
    const wName = w ? w.name : '';
    const linkedTxs = state.transactions.filter(t => t.walletId === walletId);
    if (linkedTxs.length) {
      const batch = db.batch();
      linkedTxs.forEach(t => batch.update(db.collection('transactions').doc(t.id), { walletId: '', deletedWalletName: wName }));
      await batch.commit();
      state.transactions = state.transactions.map(t => t.walletId === walletId ? { ...t, walletId: '', deletedWalletName: wName } : t);
    }
    state.wallets = state.wallets.filter(w => w.id !== walletId);
    await savePrefs();
    renderWallets();
    refreshMainBalances();
    updateWalletDropdown();
    showToast('Wallet deleted');
  } catch (e) { showToast('Error deleting wallet'); }
}

// ─── FAMILY ───
function openMemberModal() { document.getElementById('mName').value = ''; openModal('memberModal'); }

async function saveMember() {
  const name = document.getElementById('mName').value.trim();
  if (!name) { showToast('Name required'); return; }
  state.members.push({ id: 'm_' + Date.now(), name }); await savePrefs(); closeModal('memberModal'); renderFamily(); populateFormDropdowns(); showToast('Member added!');
}

function renderFamily() {
  const fl = document.getElementById('familyList');
  fl.innerHTML = state.members.map(m => {
    const mWallets = state.wallets.filter(w => w.memberId === m.id);
    const total = mWallets.reduce((s, w) => s + getLiveWalletBalance(w.id), 0);
    return `<div class="member-card"><div class="member-header"><div class="member-info"><div class="member-avatar">${m.name[0].toUpperCase()}</div><div><div class="member-name">${escapeHTML(m.name)}</div><div class="member-total">Wallets: ${mWallets.length} · Total: ${fmt(total)}</div></div></div><button class="modal-btn confirm" style="flex:none;padding:8px 14px;font-size:0.8rem" onclick="openWalletModal('${m.id}')">+ Wallet</button></div>${mWallets.length ? `<div class="member-wallets">${mWallets.map(w => `<div class="wallet-row"><div class="wallet-left"><div class="wallet-dot" style="background:var(--purple)"></div><div><div class="wallet-name">${escapeHTML(w.name)}</div><div class="wallet-type">${escapeHTML(w.type)}</div></div></div><div style="display:flex;align-items:center;gap:8px"><div class="wallet-bal">${fmt(getLiveWalletBalance(w.id))}</div><div class="wallet-acts"><button class="tx-act" onclick="openEditWalletModal('${w.id}')">✏️</button><button class="tx-act" onclick="deleteWallet('${w.id}')">🗑️</button></div></div></div>`).join('')}</div>` : ''}</div>`;
  }).join('') + '<div style="height:8px"></div>';
}

// ─── UTILS ───
function fmt(n) {
  const sym = CURRENCIES[state.currency]?.s || '';
  let v = n; if (exchangeRates[state.currency] && state.currency !== state.baseCurrency) v = n * exchangeRates[state.currency];
  const sign = v < 0 ? '-' : '';
  return sign + sym + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

let toastTimer;
function showToast(msg) {
  const existing = document.querySelector('.toast'); if (existing) existing.remove(); clearTimeout(toastTimer);
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  toastTimer = setTimeout(() => t.remove(), 2500);
}

function syncModalState() {
  const shell = document.getElementById('appShell');
  if (!shell) return;
  const hasOpenModal = !!document.querySelector('.modal-overlay.open');
  shell.classList.toggle('modal-open', hasOpenModal);
}

function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  // Lift the modal to <body> so no ancestor (with overflow/transform/etc.)
  // can clip or constrain the fixed-position overlay. Idempotent.
  if (m.parentElement !== document.body) {
    document.body.appendChild(m);
  }
  // If a previous close animation is still running, cancel it.
  m.classList.remove('closing');
  m.classList.add('open');
  syncModalState();
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (!m || !m.classList.contains('open') || m.classList.contains('closing')) return;
  const box = m.querySelector('.modal-box');
  // Drop .open immediately so the .modal-overlay.open .modal-box modalPop
  // animation stops competing with the slide-down. The .closing class
  // keeps it visible (display:flex) until the exit animation finishes.
  m.classList.remove('open');
  m.classList.add('closing');
  syncModalState();
  const finish = () => {
    m.classList.remove('closing');
  };
  if (box) {
    let done = false;
    const onEnd = (e) => {
      if (e.target !== box || done) return;
      done = true;
      box.removeEventListener('animationend', onEnd);
      finish();
    };
    box.addEventListener('animationend', onEnd);
    // Safety fallback in case animationend never fires.
    setTimeout(() => { if (!done) { done = true; box.removeEventListener('animationend', onEnd); finish(); } }, 450);
  } else {
    setTimeout(finish, 320);
  }
}

function syncThemeSettingUI() {
  const toggleEl = document.getElementById('settingsThemeToggle');
  const checkboxEl = document.getElementById('themeCheckbox');
  const subEl = document.getElementById('settingsThemeSub');
  const iconEl = document.getElementById('settingsThemeIcon');
  if (toggleEl) {
    if (state.darkMode) toggleEl.classList.add('active');
    else toggleEl.classList.remove('active');
  }
  if (checkboxEl) checkboxEl.checked = state.darkMode;
  if (subEl) subEl.textContent = state.darkMode ? 'Dark mode' : 'Light mode';
  if (iconEl) iconEl.innerHTML = state.darkMode ? '<span class="mi">light_mode</span>' : '<span class="mi">dark_mode</span>';
}

function updateSettingsAvatar() {
  const avatar = document.getElementById('settingsAvatar');
  if (!avatar) return;
  const fallback = (state.user || 'User').trim().charAt(0).toUpperCase() || 'U';
  if (state.profilePhoto) {
    avatar.innerHTML = `<img class="settings-avatar-photo" src="${state.profilePhoto}" alt="Profile photo">`;
  } else {
    avatar.innerHTML = `<div class="profile-photo-empty"><div class="settings-avatar-fallback">${fallback}</div></div>`;
  }
}

function triggerProfilePhotoPick() {
  const input = document.getElementById('profilePhotoInput');
  if (input) input.click();
}

function toggleProfilePhotoMenu() {
  const menu = document.getElementById('profilePhotoMenu');
  if (!menu) return;
  menu.classList.toggle('open');
}

function closeProfilePhotoMenu() {
  const menu = document.getElementById('profilePhotoMenu');
  if (menu) menu.classList.remove('open');
}

function handleProfilePhotoPick(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Please choose an image'); return; }
  const reader = new FileReader();
  reader.onload = async () => {
    state.profilePhoto = String(reader.result || '');
    updateSettingsAvatar();
    await savePrefs();
    closeProfilePhotoMenu();
    showToast('Profile photo updated');
  };
  reader.readAsDataURL(file);
}

async function clearProfilePhoto() {
  if (!state.profilePhoto) return;
  if (!confirm('Remove profile photo?')) return;
  state.profilePhoto = '';
  updateSettingsAvatar();
  await savePrefs();
  closeProfilePhotoMenu();
  showToast('Profile photo removed');
}

function applyHeroTheme(themeKey) {
  const key = HERO_THEMES[themeKey] ? themeKey : 'ocean';
  const mode = state.darkMode ? 'dark' : 'light';
  const t = HERO_THEMES[key][mode];
  const r = document.documentElement;
  const hero = document.querySelector('.home-hero');
  const profile = document.querySelector('.profile-card');
  if (hero) {
    hero.classList.toggle('is-dark-sky', state.darkMode);
    hero.classList.toggle('is-light-sky', !state.darkMode);
  }
  if (profile) {
    profile.classList.toggle('is-dark-sky', state.darkMode);
    profile.classList.toggle('is-light-sky', !state.darkMode);
  }
  r.style.setProperty('--hero-grad', t.heroGrad);
  r.style.setProperty('--hero-glow', t.heroGlow);
  r.style.setProperty('--hero-text', t.heroText);
  r.style.setProperty('--hero-amount', t.heroAmount);
  r.style.setProperty('--hero-label', t.heroLabel);
  r.style.setProperty('--hero-stat-bg', t.heroStatBg);
  r.style.setProperty('--insight-grad', t.insightGrad);
  r.style.setProperty('--insight-border', t.insightBorder);
  r.style.setProperty('--insight-text', t.insightText);
  r.style.setProperty('--insight-strong', t.insightStrong);
  const sceneMap = {
    ocean: { dark: { cloud: 'rgba(212,232,255,0.34)', hill1: 'rgba(126,181,255,0.24)', hill2: 'rgba(168,205,255,0.2)', hillBase: 'rgba(6,18,42,0.38)', tower1: 'rgba(188,217,255,0.24)', tower2: 'rgba(129,173,228,0.2)', city1: 'rgba(173,209,255,0.26)', city2: 'rgba(132,183,255,0.18)', city3: 'rgba(196,223,255,0.28)', ground: 'rgba(6,15,33,0.44)' }, light: { cloud: 'rgba(96,128,182,0.28)', hill1: 'rgba(101,136,194,0.24)', hill2: 'rgba(128,159,211,0.22)', hillBase: 'rgba(44,78,129,0.24)', tower1: 'rgba(111,143,196,0.24)', tower2: 'rgba(86,122,183,0.2)', city1: 'rgba(120,152,204,0.24)', city2: 'rgba(98,133,191,0.2)', city3: 'rgba(137,167,214,0.27)', ground: 'rgba(48,84,136,0.3)' } },
    rose: { dark: { cloud: 'rgba(255,221,235,0.4)', hill1: 'rgba(255,166,203,0.3)', hill2: 'rgba(255,130,186,0.26)', hillBase: 'rgba(83,8,38,0.42)', tower1: 'rgba(255,190,220,0.25)', tower2: 'rgba(229,125,181,0.22)', city1: 'rgba(255,188,218,0.3)', city2: 'rgba(255,146,196,0.24)', city3: 'rgba(255,205,227,0.33)', ground: 'rgba(88,7,39,0.46)' }, light: { cloud: 'rgba(146,36,83,0.22)', hill1: 'rgba(184,37,102,0.24)', hill2: 'rgba(230,58,134,0.2)', hillBase: 'rgba(140,31,82,0.24)', tower1: 'rgba(181,34,100,0.23)', tower2: 'rgba(144,25,80,0.21)', city1: 'rgba(168,35,93,0.22)', city2: 'rgba(219,49,123,0.2)', city3: 'rgba(195,42,106,0.24)', ground: 'rgba(128,26,74,0.3)' } },
    emerald: { dark: { cloud: 'rgba(224,255,241,0.35)', hill1: 'rgba(117,236,196,0.28)', hill2: 'rgba(87,214,171,0.24)', hillBase: 'rgba(5,62,47,0.42)', tower1: 'rgba(158,248,215,0.24)', tower2: 'rgba(89,204,168,0.21)', city1: 'rgba(181,255,227,0.28)', city2: 'rgba(112,224,184,0.22)', city3: 'rgba(205,255,236,0.3)', ground: 'rgba(4,56,43,0.44)' }, light: { cloud: 'rgba(19,120,95,0.23)', hill1: 'rgba(22,142,112,0.24)', hill2: 'rgba(30,170,136,0.21)', hillBase: 'rgba(13,103,80,0.23)', tower1: 'rgba(18,130,101,0.22)', tower2: 'rgba(15,103,81,0.2)', city1: 'rgba(18,134,104,0.22)', city2: 'rgba(29,162,129,0.2)', city3: 'rgba(21,148,115,0.24)', ground: 'rgba(11,98,76,0.3)' } }
  };
  const sc = (sceneMap[key] && sceneMap[key][mode]) ? sceneMap[key][mode] : sceneMap.ocean.dark;
  r.style.setProperty('--scene-cloud', sc.cloud);
  r.style.setProperty('--scene-hill-1', sc.hill1);
  r.style.setProperty('--scene-hill-2', sc.hill2);
  r.style.setProperty('--scene-hill-base', sc.hillBase);
  r.style.setProperty('--scene-tower-1', sc.tower1);
  r.style.setProperty('--scene-tower-2', sc.tower2);
  r.style.setProperty('--scene-city-1', sc.city1);
  r.style.setProperty('--scene-city-2', sc.city2);
  r.style.setProperty('--scene-city-3', sc.city3);
  r.style.setProperty('--scene-ground', sc.ground);
}

function applyThemePalette(themeKey) {
  const key = THEME_ACCENTS[themeKey] ? themeKey : 'ocean';
  const p = THEME_ACCENTS[key];
  const r = document.documentElement;
  r.style.setProperty('--purple', p.purple);
  r.style.setProperty('--purple-light', p.purpleLight);
  r.style.setProperty('--accent-2', p.accent2);
  r.style.setProperty('--accent-shadow', p.accentShadow);
}

function renderThemeOptions() {
  const panel = document.getElementById('themePicker');
  const current = document.getElementById('themeCurrentLabel');
  if (current) {
    const label = HERO_THEMES[state.heroTheme || 'ocean']?.name || 'Ocean Glow';
    current.innerHTML = `<span>${label}</span><span class="mi">keyboard_arrow_down</span>`;
  }
  if (!panel) return;
  panel.style.display = themePickerOpen ? 'block' : 'none';
  panel.innerHTML = Object.entries(HERO_THEMES).map(([key, val]) => {
    const active = state.heroTheme === key ? ' active' : '';
    return `<button class="theme-option${active}" onclick="event.stopPropagation(); setHeroTheme('${key}')"><span>${val.name}</span><span class="theme-option-sub">${key === 'rose' ? 'bKash vibe' : key === 'emerald' ? 'Fresh money' : 'Classic blue'}</span></button>`;
  }).join('');
}

function toggleThemePicker() {
  themePickerOpen = !themePickerOpen;
  renderThemeOptions();
}

async function setHeroTheme(themeKey) {
  if (!HERO_THEMES[themeKey]) return;
  state.heroTheme = themeKey;
  themePickerOpen = false;
  applyThemePalette(themeKey);
  applyHeroTheme(themeKey);
  renderThemeOptions();
  try { await savePrefs(); showToast(HERO_THEMES[themeKey].name + ' theme applied'); }
  catch (e) { showToast('Error saving theme'); }
}

function applyBaseThemeMode(isDark) {
  const r = document.documentElement;
  r.style.colorScheme = isDark ? 'dark' : 'light';
  if (!isDark) {
    r.style.setProperty('--bg', '#eef0f5'); r.style.setProperty('--surface', 'rgba(255,255,255,0.55)'); r.style.setProperty('--surface2', 'rgba(255,255,255,0.8)'); r.style.setProperty('--surface3', '#e5e5ea');
    r.style.setProperty('--border', 'rgba(0,0,0,0.06)'); r.style.setProperty('--border2', 'rgba(0,0,0,0.12)');
    r.style.setProperty('--glass-border', 'rgba(255,255,255,0.8)'); r.style.setProperty('--glass-shadow', '0 16px 36px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,0.9)');
    r.style.setProperty('--text', '#000000'); r.style.setProperty('--text2', '#6c6c70'); r.style.setProperty('--text3', '#aeaeb2');
    r.style.setProperty('--form-option-bg', '#ffffff'); r.style.setProperty('--form-option-text', '#1c1c1e'); r.style.setProperty('--form-color-scheme', 'light');
    r.style.setProperty('--nav-bg', 'linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.70))'); r.style.setProperty('--nav-shadow', '0 -8px 24px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.6)');
    r.style.setProperty('--settings-panel-bg', 'linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78) 42%,rgba(255,255,255,0.62) 100%)');
    r.style.setProperty('--settings-icon-bg', 'linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,255,255,0.64) 46%,rgba(255,255,255,0.48) 100%)');
    r.style.setProperty('--settings-icon-border', 'rgba(255,255,255,0.8)'); r.style.setProperty('--settings-icon-shine', 'rgba(255,255,255,0.9)');
    r.style.setProperty('--theme-current-bg', 'rgba(0,0,0,0.03)'); r.style.setProperty('--theme-current-border', 'rgba(0,0,0,0.06)'); r.style.setProperty('--theme-current-shine', 'rgba(255,255,255,0.6)');
    r.style.setProperty('--theme-picker-bg', 'linear-gradient(180deg,rgba(255,255,255,0.94),rgba(250,250,250,0.94))'); r.style.setProperty('--theme-picker-border', 'rgba(0,0,0,0.1)'); r.style.setProperty('--theme-picker-shine', 'rgba(255,255,255,0.5)');
    r.style.setProperty('--theme-option-hover', 'rgba(0,0,0,0.04)'); r.style.setProperty('--theme-option-active', 'linear-gradient(145deg,rgba(0,0,0,0.05),rgba(255,255,255,0.6))');
    r.style.setProperty('--currency-select-bg', 'rgba(0,0,0,0.03)'); r.style.setProperty('--currency-select-border', 'rgba(0,0,0,0.06)'); r.style.setProperty('--currency-select-text', '#1c1c1e'); r.style.setProperty('--currency-select-shine', 'rgba(255,255,255,0.6)');
    r.style.setProperty('--profile-grad-light', 'rgba(255,255,255,0.95)'); r.style.setProperty('--profile-grad-mid', 'rgba(255,255,255,0.85)'); r.style.setProperty('--profile-grad-dark', 'rgba(240,240,245,0.8)');
    r.style.setProperty('--profile-accent', 'linear-gradient(135deg, rgba(94, 92, 230, 0.15), rgba(255,255,255,0.8))'); r.style.setProperty('--profile-text', '#000000'); r.style.setProperty('--profile-email-text', '#6c6c70');
    r.style.setProperty('--profile-border', 'rgba(255,255,255,0.9)'); r.style.setProperty('--profile-shadow', '0 14px 30px rgba(0,0,0,0.05),inset 0 1px 0 rgba(255,255,255,0.9)');
    r.style.setProperty('--profile-shine', 'radial-gradient(circle,rgba(255,255,255,0.9),transparent 70%)');
    r.style.setProperty('--avatar-ring-color', 'var(--purple)'); r.style.setProperty('--avatar-ring-empty', 'rgba(0,0,0,0.06)'); r.style.setProperty('--avatar-bg', '#ffffff');
    r.style.setProperty('--avatar-border', 'rgba(255,255,255,0.9)'); r.style.setProperty('--avatar-shine', 'rgba(255,255,255,0.6)'); r.style.setProperty('--avatar-reflection', 'linear-gradient(180deg, rgba(255,255,255,0.8), transparent)');
    r.style.setProperty('--wallet-balance-bg', 'linear-gradient(145deg,rgba(0,0,0,0.04),rgba(0,0,0,0.01) 42%,rgba(255,255,255,0.4) 100%)'); r.style.setProperty('--wallet-balance-accent', 'linear-gradient(135deg,rgba(94, 92, 230, 0.15),rgba(255,255,255,0.8))');
    r.style.setProperty('--wallet-balance-text', '#000000'); r.style.setProperty('--wallet-balance-label', '#6c6c70'); r.style.setProperty('--wallet-balance-value', '#1c1c1e'); r.style.setProperty('--wallet-balance-subtitle', '#6c6c70');
    r.style.setProperty('--nav-add-bg', 'linear-gradient(145deg,rgba(0,0,0,0.03),rgba(0,0,0,0.01) 46%,rgba(255,255,255,0.4) 100%)'); r.style.setProperty('--nav-add-accent', 'linear-gradient(135deg,var(--accent-2),var(--purple))');
    r.style.setProperty('--nav-add-text', '#ffffff'); r.style.setProperty('--nav-add-shine', 'rgba(255,255,255,0.6)');
    r.style.setProperty('--nav-add-shadow', '0 10px 24px rgba(94, 92, 230, 0.25)'); r.style.setProperty('--nav-add-shadow-active', '0 4px 14px rgba(94, 92, 230, 0.25)');
  } else {
    r.style.setProperty('--bg', '#0a0a0a'); r.style.setProperty('--surface', '#141414'); r.style.setProperty('--surface2', '#1c1c1e'); r.style.setProperty('--surface3', '#252528');
    r.style.setProperty('--border', 'rgba(255,255,255,0.08)'); r.style.setProperty('--border2', 'rgba(255,255,255,0.14)');
    r.style.setProperty('--glass-border', 'rgba(255,255,255,0.08)'); r.style.setProperty('--glass-shadow', '0 16px 36px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)');
    r.style.setProperty('--text', '#ffffff'); r.style.setProperty('--text2', '#8e8e93'); r.style.setProperty('--text3', '#3a3a3c');
    r.style.setProperty('--form-option-bg', '#1c1c1e'); r.style.setProperty('--form-option-text', '#ffffff'); r.style.setProperty('--form-color-scheme', 'dark');
    r.style.setProperty('--nav-bg', 'linear-gradient(180deg,rgba(20,20,20,0.95),rgba(15,15,15,0.95))'); r.style.setProperty('--nav-shadow', '0 -8px 24px rgba(0,0,0,0.18),inset 0 1px 0 rgba(255,255,255,0.05)');
    r.style.setProperty('--settings-panel-bg', 'linear-gradient(145deg,rgba(28,28,30,0.94),rgba(28,28,30,0.78) 42%,rgba(28,28,30,0.62) 100%)');
    r.style.setProperty('--settings-icon-bg', 'linear-gradient(145deg,rgba(37,37,40,0.92),rgba(37,37,40,0.64) 46%,rgba(37,37,40,0.48) 100%)');
    r.style.setProperty('--settings-icon-border', 'rgba(255,255,255,0.08)'); r.style.setProperty('--settings-icon-shine', 'rgba(255,255,255,0.05)');
    r.style.setProperty('--theme-current-bg', 'rgba(255,255,255,0.03)'); r.style.setProperty('--theme-current-border', 'rgba(255,255,255,0.06)'); r.style.setProperty('--theme-current-shine', 'rgba(255,255,255,0.05)');
    r.style.setProperty('--theme-picker-bg', 'linear-gradient(180deg,rgba(40,40,40,0.94),rgba(20,20,20,0.94))'); r.style.setProperty('--theme-picker-border', 'rgba(255,255,255,0.1)'); r.style.setProperty('--theme-picker-shine', 'rgba(255,255,255,0.05)');
    r.style.setProperty('--theme-option-hover', 'rgba(255,255,255,0.08)'); r.style.setProperty('--theme-option-active', 'linear-gradient(145deg,var(--purple-light),rgba(255,255,255,0.02))');
    r.style.setProperty('--currency-select-bg', 'rgba(255,255,255,0.03)'); r.style.setProperty('--currency-select-border', 'rgba(255,255,255,0.06)'); r.style.setProperty('--currency-select-text', '#ffffff'); r.style.setProperty('--currency-select-shine', 'rgba(255,255,255,0.05)');
    r.style.setProperty('--profile-grad-light', 'rgba(28,28,30,0.95)'); r.style.setProperty('--profile-grad-mid', 'rgba(28,28,30,0.85)'); r.style.setProperty('--profile-grad-dark', 'rgba(20,20,20,0.8)');
    r.style.setProperty('--profile-accent', 'linear-gradient(135deg,var(--purple-light),rgba(255,255,255,0.02))'); r.style.setProperty('--profile-text', '#ffffff'); r.style.setProperty('--profile-email-text', '#8e8e93');
    r.style.setProperty('--profile-border', 'rgba(255,255,255,0.08)'); r.style.setProperty('--profile-shadow', '0 14px 30px var(--accent-shadow),inset 0 1px 0 rgba(255,255,255,0.05)');
    r.style.setProperty('--profile-shine', 'radial-gradient(circle,rgba(255,255,255,0.1),var(--purple-light) 55%,transparent 70%)');
    r.style.setProperty('--avatar-ring-color', 'var(--purple)'); r.style.setProperty('--avatar-ring-empty', 'rgba(255,255,255,0.06)'); r.style.setProperty('--avatar-bg', '#1c1c1e');
    r.style.setProperty('--avatar-border', 'rgba(255,255,255,0.08)'); r.style.setProperty('--avatar-shine', 'rgba(255,255,255,0.05)'); r.style.setProperty('--avatar-reflection', 'linear-gradient(180deg, rgba(255,255,255,0.1), transparent)');
    r.style.setProperty('--wallet-balance-bg', 'linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04) 42%,rgba(255,255,255,0.02) 100%)'); r.style.setProperty('--wallet-balance-accent', 'linear-gradient(135deg,var(--purple-light),rgba(255,255,255,0.02))');
    r.style.setProperty('--wallet-balance-text', '#ffffff'); r.style.setProperty('--wallet-balance-label', 'rgba(255,255,255,0.55)'); r.style.setProperty('--wallet-balance-value', '#ffffff'); r.style.setProperty('--wallet-balance-subtitle', 'rgba(255,255,255,0.60)');
    r.style.setProperty('--nav-add-bg', 'linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02) 46%,rgba(255,255,255,0.01) 100%)'); r.style.setProperty('--nav-add-accent', 'linear-gradient(135deg,var(--accent-2),var(--purple))');
    r.style.setProperty('--nav-add-text', '#ffffff'); r.style.setProperty('--nav-add-shine', 'rgba(255,255,255,0.12)');
    r.style.setProperty('--nav-add-shadow', '0 10px 24px var(--accent-shadow)'); r.style.setProperty('--nav-add-shadow-active', '0 4px 14px var(--accent-shadow)');
  }
}

async function toggleTheme() {
  state.darkMode = !state.darkMode;
  applyBaseThemeMode(state.darkMode);
  applyThemePalette(state.heroTheme || 'ocean');
  applyHeroTheme(state.heroTheme || 'ocean');
  syncThemeSettingUI();
  try { await savePrefs(); }
  catch (e) { showToast('Error saving theme'); }
}

async function changeCurrency(val) {
  state.currency = val; document.getElementById('settingsCurLabel').textContent = val; refreshAll();
  try { await savePrefs(); showToast('Currency: ' + val); }
  catch (e) { showToast('Error saving currency'); }
}

function exportCSV() {
  if (!state.transactions.length) { showToast('No data to export!'); return; }
  const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = state.transactions.map(t => [t.date, t.type, t.category, t.amount, state.baseCurrency, t.note || '']);
  const csv = [['Date', 'Type', 'Category', 'Amount', 'Currency', 'Note'], ...rows].map(r => r.map(csvCell).join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv' }));
  a.download = `ledger_${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); showToast('CSV downloaded!');
}

function savePrefs() {
  if (!state.uid) return Promise.resolve();
  showActionLoader();
  return db.collection('users').doc(state.uid).set({ currency: state.baseCurrency, displayCurrency: state.currency, darkMode: state.darkMode, heroTheme: state.heroTheme || 'ocean', profilePhoto: state.profilePhoto || '', members: state.members, wallets: state.wallets, goals: state.goals, budgets: state.budgets, recurring: state.recurring, debts: state.debts, noteBooks: state.noteBooks || [], notes: state.notes || [] }, { merge: true }).finally(() => hideActionLoader());
}

function refreshAll() { renderHome(); renderFullTx(); if (document.getElementById('p-stats').classList.contains('active')) rebuildCharts(); if (document.getElementById('p-wallets').classList.contains('active')) renderWallets(); if (document.getElementById('p-notes').classList.contains('active')) renderNotes(); if (document.getElementById('p-note-detail').classList.contains('active')) renderNoteBookDetail(); }

async function fetchRates(base) {
  try { const r = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`); const d = await r.json(); exchangeRates = d.rates; refreshAll(); } catch (e) { console.error('Rates error'); }
}

// ─── AUTH ───
let isReg = false;
function toggleAuth() {
  isReg = !isReg;
  document.getElementById('authSub').textContent = isReg ? 'Create a new account' : 'Sign in to your account';
  const btnText = document.querySelector('#authBtn .auth-btn-text');
  if (btnText) btnText.textContent = isReg ? 'Create Account' : 'Sign In';
  document.getElementById('authToggle').innerHTML = isReg ? 'Already have one? <b>Sign in</b>' : 'New here? <b>Create account</b>';
  const nameGroup = document.getElementById('nameGroup');
  const currencyGroup = document.getElementById('currencyGroup');
  if (nameGroup) nameGroup.style.display = isReg ? 'block' : 'none';
  if (currencyGroup) currencyGroup.style.display = isReg ? 'block' : 'none';
  const forgotBtn = document.getElementById('forgotPwdBtn');
  if (forgotBtn) forgotBtn.style.display = isReg ? 'none' : 'block';
}

function togglePasswordVisibility() {
  const pwdInput = document.getElementById('passwordInput');
  const icon = document.getElementById('passwordToggleIcon');
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    icon.textContent = 'visibility_off';
  } else {
    pwdInput.type = 'password';
    icon.textContent = 'visibility';
  }
}

async function handleForgotPassword() {
  const email = document.getElementById('emailInput').value.trim();
  if (!email) {
    showToast('Enter your email first to reset password');
    return;
  }
  try {
    await auth.sendPasswordResetEmail(email);
    showToast('Password reset email sent! Check your inbox.');
  } catch (err) {
    showToast(err.message);
  }
}

async function handleAuth() {
  const email = document.getElementById('emailInput').value.trim();
  const pass = document.getElementById('passwordInput').value;
  if (!email || !pass) { showToast('Enter email and password'); return; }
  const btn = document.getElementById('authBtn');
  const btnText = btn.querySelector('.auth-btn-text');
  btn.classList.add('loading');
  try {
    if (isReg) {
      const name = document.getElementById('nameInput').value.trim() || 'User';
      const cur = document.getElementById('obCurrency').value;
      const cred = await auth.createUserWithEmailAndPassword(email, pass);
      await cred.user.updateProfile({ displayName: name });
      await db.collection('users').doc(cred.user.uid).set({ currency: cur, darkMode: true, profilePhoto: '', members: [{ id: 'm_default', name }], wallets: [{ id: 'w_default', name: 'Cash', type: 'Cash', memberId: 'm_default', initialBalance: 0 }], goals: [], budgets: [], recurring: [], noteBooks: [], notes: [] });
    } else { await auth.signInWithEmailAndPassword(email, pass); }
  } catch (err) { showToast(err.message); btn.classList.remove('loading'); if (btnText) btnText.textContent = isReg ? 'Create Account' : 'Sign In'; }
}

async function handleGoogleAuth() {
  const p = new firebase.auth.GoogleAuthProvider();
  try {
    const c = await auth.signInWithPopup(p);
    const ds = await db.collection('users').doc(c.user.uid).get();
    if (!ds.exists) { await db.collection('users').doc(c.user.uid).set({ currency: 'BDT', darkMode: true, profilePhoto: '', members: [{ id: 'm_default', name: c.user.displayName }], wallets: [{ id: 'w_default', name: 'Cash', type: 'Cash', memberId: 'm_default', initialBalance: 0 }], goals: [], budgets: [], recurring: [], noteBooks: [], notes: [] }); }
  } catch (err) { if (err.code !== 'auth/popup-closed-by-user') showToast(err.message); }
}

function logout() { auth.signOut(); }

function firstNameFromUser(rawName) {
  const txt = (rawName || 'User').trim();
  if (!txt) return 'User';
  const base = txt.includes('@') ? txt.split('@')[0] : txt;
  const name = base.split(/[._\-\s]+/).filter(Boolean)[0] || 'User';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function launchApp() {
  document.getElementById('auth').style.display = 'none';
  document.getElementById('appShell').style.display = 'flex';
  const u = state.user;
  const first = firstNameFromUser(u);
  document.getElementById('homeGreeting').textContent = 'Hello!';
  document.getElementById('homeName').textContent = first;
  document.getElementById('settingsName').textContent = u;
  const railName = document.getElementById('railUserName');
  if (railName) railName.textContent = first;
  const railSub = document.getElementById('railUserSub');
  if (railSub) railSub.textContent = 'Track spending, wallets, goals, and budgets in one place.';
  applyBaseThemeMode(state.darkMode);
  applyThemePalette(state.heroTheme || 'ocean');
  applyHeroTheme(state.heroTheme || 'ocean');
  renderThemeOptions();
  updateSettingsAvatar();
  syncThemeSettingUI();
  document.getElementById('currencySelect').value = state.currency;
  document.getElementById('settingsCurLabel').textContent = state.currency;
  document.getElementById('fDate').valueAsDate = new Date();
  populateFormDropdowns();
  processRecurringDebts();
}

// ─── DEBTS ───
let isDebtRecurring = false;
function toggleDebtRecurring() {
  isDebtRecurring = !isDebtRecurring;
  document.getElementById('dRecToggle').classList.toggle('active', isDebtRecurring);
  document.getElementById('dRecSection').style.display = isDebtRecurring ? 'block' : 'none';
}

function openDebtModal() {
  document.getElementById('dId').value = '';
  document.getElementById('dName').value = '';
  document.getElementById('dAmount').value = '';
  document.getElementById('dType').value = 'borrowed';
  document.getElementById('dCleared').value = '0';
  document.getElementById('dDueDate').value = '';
  document.getElementById('dNote').value = '';

  isDebtRecurring = false;
  document.getElementById('dRecToggle').classList.remove('active');
  document.getElementById('dRecSection').style.display = 'none';
  document.getElementById('dRecAmount').value = '';
  document.getElementById('dRecNext').value = '';

  document.getElementById('debtModalTitle').textContent = 'Add Debt / Loan';
  openModal('debtModal');
}

async function saveDebt() {
  const name = document.getElementById('dName').value.trim();
  const amount = parseFloat(document.getElementById('dAmount').value);
  const type = document.getElementById('dType').value;
  const cleared = parseFloat(document.getElementById('dCleared').value) || 0;
  const dueDate = document.getElementById('dDueDate').value;
  const note = document.getElementById('dNote').value.trim();
  const dId = document.getElementById('dId').value;

  const isRec = isDebtRecurring;
  const recAmount = parseFloat(document.getElementById('dRecAmount').value) || 0;
  const recFreq = document.getElementById('dRecFreq').value;
  const recNext = document.getElementById('dRecNext').value;

  if (!name || !amount || amount <= 0) { showToast('Fill name and total amount!'); return; }

  if (dId) {
    const d = state.debts.find(x => x.id === dId);
    if (d) {
      d.name = name; d.amount = amount; d.type = type; d.cleared = cleared; d.dueDate = dueDate; d.note = note;
      d.isRecurring = isRec; d.recAmount = recAmount; d.recFreq = recFreq; d.recNext = recNext;
    }
  } else {
    state.debts.push({
      id: 'd_' + Date.now(), name, amount, type, cleared, dueDate, note,
      isRecurring: isRec, recAmount, recFreq, recNext, createdAt: new Date().toISOString()
    });
  }

  await savePrefs();
  closeModal('debtModal');
  renderDebts();
  showToast('Debt saved!');
}

function openDebtPayModal(id) {
  document.getElementById('dpId').value = id;
  document.getElementById('dpAmount').value = '';
  openModal('debtPayModal');
}

async function saveDebtPayment() {
  const id = document.getElementById('dpId').value;
  const amt = parseFloat(document.getElementById('dpAmount').value);
  if (!amt || amt <= 0) { showToast('Invalid amount'); return; }

  const d = state.debts.find(x => x.id === id);
  if (!d) return;

  const wasComplete = (d.cleared || 0) >= d.amount;
  d.cleared = (d.cleared || 0) + amt;
  const justCompleted = !wasComplete && d.cleared >= d.amount;
  if (d.cleared >= d.amount) {
    if (justCompleted) triggerConfetti();
    if (confirm('Debt is fully paid! Archive/Remove it?')) {
      state.debts = state.debts.filter(x => x.id !== id);
    } else {
      d.cleared = d.amount; // Cap it
    }
  }

  await savePrefs();
  closeModal('debtPayModal');
  renderDebts();
  showToast('Payment added!');
}

async function deleteDebt(id) {
  if (!confirm('Delete/Settle this debt completely?')) return;
  state.debts = state.debts.filter(d => d.id !== id);
  await savePrefs();
  renderDebts();
  showToast('Debt removed!');
}

function renderDebts() {
  const dl = document.getElementById('debtsList');
  if (!state.debts.length) {
    dl.innerHTML = '<div class="empty" style="padding:24px"><div class="empty-icon">🤝</div><div class="empty-text">No active debts.<br>Tap + to track money lent or borrowed!</div></div>';
    document.getElementById('debtsOweDisplay').textContent = fmt(0);
    document.getElementById('debtsLentDisplay').textContent = fmt(0);
    return;
  }

  let owe = 0; let lent = 0;

  dl.innerHTML = state.debts.map(d => {
    const remains = d.amount - (d.cleared || 0);
    if (remains > 0) {
      if (d.type === 'borrowed') owe += remains;
      else lent += remains;
    }

    const iconColor = d.type === 'borrowed' ? 'var(--red)' : 'var(--green)';
    const pct = d.amount > 0 ? Math.min(Math.round(((d.cleared || 0) / d.amount) * 100), 100) : 0;
    const recStr = d.isRecurring ? `<div style="font-size:0.75rem; color:var(--purple); margin-top:2px;">🔁 Auto: ${fmt(d.recAmount || 0)} ${d.recFreq}</div>` : '';
    const dueStr = d.dueDate ? `<div style="font-size:0.75rem; color:var(--text2); margin-top:2px;">📅 Due: ${d.dueDate}</div>` : '';

    return `<div class="goal-item" style="--g-color:${iconColor}; margin-bottom:12px; position:relative; overflow:hidden">
      <div style="position:absolute;top:0;left:0;bottom:0;width:4px;background:${iconColor};border-radius:4px 0 0 4px"></div>
      <div class="goal-top" style="position:relative; z-index:1; padding: 14px 14px 0;">
        <div>
          <div class="goal-name">${escapeHTML(d.name)} <span style="font-size:0.7rem;font-weight:normal;opacity:0.7;background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:8px">${d.type === 'borrowed' ? 'Borrowed' : 'Lent'}</span></div>
          <div class="goal-amounts">${fmt(d.cleared || 0)} cleared of ${fmt(d.amount)}</div>
        </div>
        <div class="goal-pct" style="color:${iconColor};text-align:right">
          ${pct}%<br><span style="font-size:0.75rem;opacity:0.8">${fmt(remains)} left</span>
        </div>
      </div>
      <div class="goal-bar" style="margin: 10px 14px 10px"><div class="goal-fill" style="width:${pct}%;background:${iconColor}"></div></div>
      <div style="margin: 0 14px; font-size:0.8rem; color:var(--text2)">${escapeHTML(d.note || '')}</div>
      <div style="margin: 4px 14px 0">${dueStr} ${recStr}</div>
      <div style="display:flex;gap:8px;margin:10px 14px 14px">
        <button class="modal-btn cancel" style="flex:none;padding:7px 14px;font-size:0.78rem" onclick="openDebtPayModal('${d.id}')">+ Pay</button>
        <button class="modal-btn cancel" style="flex:none;padding:7px 14px;font-size:0.78rem;color:var(--red)" onclick="deleteDebt('${d.id}')">Clear</button>
      </div>
    </div>`;
  }).join('');

  document.getElementById('debtsOweDisplay').textContent = fmt(owe);
  document.getElementById('debtsLentDisplay').textContent = fmt(lent);
}

async function processRecurringTransactions() {
  if (!state.uid || !state.recurring || !state.recurring.length) return;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const additions = [];
  let changed = false;

  for (const r of state.recurring) {
    if (!r.active || !r.nextDate) continue;
    let safety = 36; // hard cap to avoid runaway loops
    while (r.nextDate && r.nextDate <= todayStr && safety-- > 0) {
      additions.push({
        uid: state.uid,
        type: r.type === 'income' ? 'income' : 'expense',
        amount: r.amount,
        date: r.nextDate,
        category: r.name,
        note: 'Auto-recurring',
        memberId: (state.members[0] && state.members[0].id) || '',
        walletId: '',
        createdAt: new Date().toISOString(),
        recurringId: r.id
      });
      const nd = new Date(r.nextDate + 'T00:00:00');
      if (r.freq === 'weekly') nd.setDate(nd.getDate() + 7);
      else if (r.freq === 'yearly') nd.setFullYear(nd.getFullYear() + 1);
      else nd.setMonth(nd.getMonth() + 1);
      r.nextDate = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, '0')}-${String(nd.getDate()).padStart(2, '0')}`;
      changed = true;
    }
  }

  if (additions.length) {
    try {
      const batch = db.batch();
      additions.forEach(tx => batch.set(db.collection('transactions').doc(), tx));
      await batch.commit();
    } catch (e) { console.error('Recurring batch failed', e); }
  }
  if (changed) { try { await savePrefs(); } catch (e) { /* noop */ } }
}

async function processRecurringDebts() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  let changed = false;

  for (let d of state.debts) {
    if (d.isRecurring && d.recNext && d.recNext <= todayStr) {
      if (d.cleared >= d.amount) {
        d.isRecurring = false; // Turn off if already paid
        changed = true;
        continue;
      }

      while (d.recNext <= todayStr) {
        d.cleared = (d.cleared || 0) + (d.recAmount || 0);

        let nd = new Date(d.recNext);
        if (d.recFreq === 'monthly') nd.setMonth(nd.getMonth() + 1);
        else if (d.recFreq === 'weekly') nd.setDate(nd.getDate() + 7);
        else nd.setFullYear(nd.getFullYear() + 1);

        d.recNext = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, '0')}-${String(nd.getDate()).padStart(2, '0')}`;

        if (d.cleared >= d.amount) { d.isRecurring = false; d.cleared = d.amount; break; } // stop loop if paid
      }
      changed = true;
    }
  }

  if (changed) {
    await savePrefs();
  }
}

// ─── FIREBASE AUTH LISTENER ───
let unsubTxs = null;
auth.onAuthStateChanged(async user => {
  if (user) {
    state.uid = user.uid; state.user = user.displayName || user.email || 'User';
    document.getElementById('settingsEmail').textContent = user.email || '';
    const snap = await db.collection('users').doc(user.uid).get();
    if (snap.exists) {
      const d = snap.data();
      state.baseCurrency = d.currency || 'BDT'; state.currency = d.displayCurrency || state.baseCurrency;
      state.darkMode = d.darkMode !== undefined ? d.darkMode : true;
      state.heroTheme = d.heroTheme || 'ocean';
      state.profilePhoto = d.profilePhoto || '';
      state.members = d.members || [{ id: 'm_default', name: state.user }];
      state.wallets = d.wallets || [{ id: 'w_default', name: 'Cash', type: 'Cash', memberId: 'm_default', initialBalance: 0 }];
      state.goals = d.goals || []; state.budgets = d.budgets || []; state.recurring = d.recurring || []; state.debts = d.debts || []; state.noteBooks = d.noteBooks || []; state.notes = d.notes || [];
      if (ensureNoteBooks()) await savePrefs();
    } else {
      state.heroTheme = 'ocean';
      state.profilePhoto = '';
      state.members = [{ id: 'm_default', name: state.user }];
      state.wallets = [{ id: 'w_default', name: 'Cash', type: 'Cash', memberId: 'm_default', initialBalance: 0 }];
      state.goals = []; state.budgets = []; state.recurring = []; state.debts = []; state.noteBooks = []; state.notes = [];
      await savePrefs();
    }
    fetchRates(state.baseCurrency);
    await processRecurringTransactions();
    launchApp();
    const ls = document.getElementById('loadingScreen');
    if (ls) ls.style.display = 'none';
    unsubTxs = db.collection('transactions').where('uid', '==', user.uid).onSnapshot(snap => {
      const txs = []; snap.forEach(doc => txs.push({ id: doc.id, ...doc.data() }));
      txs.sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      state.transactions = txs; refreshAll();
    });
  } else {
    if (unsubTxs) unsubTxs();
    if (typeof pushInterval !== 'undefined' && pushInterval) { clearInterval(pushInterval); pushInterval = null; }
    state.transactions = []; state.uid = null;
    const ls = document.getElementById('loadingScreen');
    if (ls) ls.style.display = 'none';
    document.getElementById('auth').style.display = 'flex';
    document.getElementById('appShell').style.display = 'none';
    document.getElementById('authBtn').textContent = isReg ? 'Create Account' : 'Sign In';
  }
});

document.getElementById('passwordInput').addEventListener('keydown', e => { if (e.key === 'Enter') handleAuth(); });
document.addEventListener('click', e => {
  const wrap = document.getElementById('settingsAvatarWrap');
  const menu = document.getElementById('profilePhotoMenu');
  if (!wrap || !menu || !menu.classList.contains('open')) return;
  if (wrap.contains(e.target) || menu.contains(e.target)) return;
  menu.classList.remove('open');
});

// == SMART ENGAGEMENT NOTIFICATION SYSTEM ==

const smartMessages = [
  'ব্যালেন্স মেলালেন তো?! না মেলালে পরে পস্তাতে হবে কিন্তু 😅',
  'আজকের খরচের হিসাব Ledger অ্যাপে টুকে রেখেছেন তো?',
  'টুকটাক যা খরচ হয়েছে মনে করে এখনই এন্ট্রি করে নিন!',
  'আপনার ফিনান্সিয়াল ট্র্যাকিংয়ে আজকে গ্যাপ পড়লো! হিসাব মিলিয়ে নিন 🧐',
  'টাকা কি গাছের পাতা? হিসাব না রাখলে কিন্তু বিপদ! 💸'
];

async function initializeNotifications() {
  if (!('Notification' in window)) return;

  if (Notification.permission !== 'granted') {
    return; // Don't prompt immediately, wait for user to toggle settings
  }

  // Set up local daily notification check
  setupDailyReminder();

  // Placeholder for Firebase Cloud Messaging (FCM)
  try {
    if (messaging) {
      // You must add your actual VAPID key in place of 'YOUR_VAPID_KEY_HERE'
      const token = await messaging.getToken({ vapidKey: 'BA9nnVgkPLuQjBDAgKxD8iWOy6dK29JwzCtOhW1LA5kfmg58e7aneqWLVTCwVzmFlGXxscQ7umkMoY5SjZsJSOc' });
      console.log('FCM Token:', token);
      
      // Optionally save to Firestore
      if (token && state.uid) {
        await db.collection('users').doc(state.uid).set({ fcmToken: token }, { merge: true });
      }

      messaging.onMessage((payload) => {
        console.log('Message received. ', payload);
        const { title, body } = payload.notification;
        // Check if service worker exists to show notification, else fallback
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
              body,
              icon: 'logo.png',
              badge: 'logo.png'
            });
          });
        }
      });
    }
  } catch (e) {
    console.log('FCM not fully set up', e);
  }
}

let pushInterval;
function setupDailyReminder() {
  if (pushInterval) clearInterval(pushInterval);
  const msg = smartMessages[Math.floor(Math.random() * smartMessages.length)];

  // 1. CAPACITOR NATIVE LOCAL NOTIFICATIONS (For when wrapped in Android/iOS app)
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
    const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;

    LocalNotifications.requestPermissions().then(result => {
      if (result.display === 'granted') {
        // Schedule notification at 9 PM (21:00) every day
        LocalNotifications.schedule({
          notifications: [
            {
              title: "Ledger Reminder",
              body: msg,
              id: 1,
              schedule: { on: { hour: 21, minute: 0 }, repeats: true },
              smallIcon: "ic_stat_icon_config_sample", // Update with your actual native Android icon
              iconColor: "#5e5ce6"
            }
          ]
        });
      }
    }).catch(e => console.log('Capacitor LocalNotifications not available', e));
    return;
  }

  // 2. WEB PWA LOCAL NOTIFICATIONS (Fallback for browser)
  // Web browsers don't support running setInterval reliably in the background when the app is closed.
  // This will only trigger if the user happens to have the app open around 9 PM.
  // To test this immediately, you can temporarily change the hour/minute below.
  pushInterval = setInterval(async () => {
    const now = new Date();
    // 21 is 9 PM local time
    if (now.getHours() === 21 && now.getMinutes() === 0) {
      await checkIfNudgeNeeded();
    }
  }, 60000);
}

async function checkIfNudgeNeeded() {
  const today = new Date().toISOString().split('T')[0];
  const hasTxnToday = (state.transactions || []).some(t => t.date === today);

  if (!hasTxnToday && Notification.permission === 'granted') {
    const msg = smartMessages[Math.floor(Math.random() * smartMessages.length)];

    // Android PWA requires using the Service Worker to show notifications reliably
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        registration.showNotification('Ledger Reminder', {
          body: msg,
          icon: 'logo.png',
          badge: 'logo.png',
          vibrate: [200, 100, 200]
        });
        return;
      }
    }

    // Desktop fallback
    new Notification('Ledger Reminder', {
      body: msg,
      icon: 'logo.png'
    });
  }
}

async function toggleNotifications() {
  const toggleBtn = document.getElementById('settingsNotifToggle');
  const sub = document.getElementById('settingsNotifSub');
  if (!toggleBtn || !sub) return;

  const isEnabled = toggleBtn.checked;

  if (!isEnabled) {
    sub.textContent = 'Notifications disabled';
    localStorage.setItem('ledger_notif_pref', 'off');
    return;
  }

  if (!('Notification' in window)) {
    showToast('Notifications are not supported on this device');
    toggleBtn.checked = false;
    sub.textContent = 'Notifications unavailable on this device';
    localStorage.setItem('ledger_notif_pref', 'off');
    return;
  }

  if (Notification.permission === 'denied') {
    showToast('Notification permission is blocked in browser settings');
    toggleBtn.checked = false;
    sub.textContent = 'Permission blocked in browser settings';
    localStorage.setItem('ledger_notif_pref', 'off');
    return;
  }

  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission();

  if (permission === 'granted') {
    toggleBtn.checked = true;
    sub.textContent = 'Daily engaging alerts on';
    localStorage.setItem('ledger_notif_pref', 'on');
    initializeNotifications();
  } else {
    toggleBtn.checked = false;
    sub.textContent = 'Notifications disabled';
    localStorage.setItem('ledger_notif_pref', 'off');
  }
}

// Initial setup call on load if pref is on
window.addEventListener('load', () => {
  const pref = localStorage.getItem('ledger_notif_pref');
  const toggleBtn = document.getElementById('settingsNotifToggle');
  const sub = document.getElementById('settingsNotifSub');
  if (!toggleBtn || !sub) return;

  const canNotify = 'Notification' in window && Notification.permission === 'granted';
  const shouldEnable = pref === 'on' && canNotify;
  toggleBtn.checked = shouldEnable;
  sub.textContent = shouldEnable ? 'Daily engaging alerts on' : 'Notifications disabled';

  if (shouldEnable) initializeNotifications();
});


