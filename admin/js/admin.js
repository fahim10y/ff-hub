// ═══════════════════════════════════════════════
//  FF HUB E-SPORTS — admin.js
//  Futuristic Esports Administrator Dashboard Controller
// ═══════════════════════════════════════════════

let DB = { 
  users: {}, 
  deposits: [], 
  withdrawals: [], 
  joined: {}, 
  history: {}, 
  roomCodes: {},
  settings: {
    liveLink: 'https://www.youtube.com/embed/gU9yZgW1gYI',
    tutorialLink: 'https://www.youtube.com/embed/xR2zB27C174',
    payNumbers: {
      bkash: '01712-345678',
      nagad: '01812-345678',
      rocket: '01912-345678'
    }
  }
};
let selectedMatchForResult = null;

// ── LOAD DB ─────────────────────────────────────
function load() {
  const d = localStorage.getItem('ffhub_db');
  if (d) {
    try {
      DB = JSON.parse(d);
    } catch(e) {}
  }
  // Initialize safe defaults
  if (!DB.settings) {
    DB.settings = {
      liveLink: 'https://www.youtube.com/embed/gU9yZgW1gYI',
      tutorialLink: 'https://www.youtube.com/embed/xR2zB27C174',
      payNumbers: {
        bkash: '01712-345678',
        nagad: '01812-345678',
        rocket: '01912-345678'
      }
    };
  }
  if (!DB.settings.modeRules) DB.settings.modeRules = {};
  if (!DB.settings.payNumbers) {
    DB.settings.payNumbers = {
      bkash: '01712-345678',
      nagad: '01812-345678',
      rocket: '01912-345678'
    };
  }
  if (!DB.users) DB.users = {};
  if (!DB.deposits) DB.deposits = [];
  if (!DB.withdrawals) DB.withdrawals = [];
  if (!DB.joined) DB.joined = {};
  if (!DB.history) DB.history = {};
  if (!DB.roomCodes) DB.roomCodes = {};
  if (!DB.matches) DB.matches = [];
  if (!DB.matchPlayers) DB.matchPlayers = {};
  // Load default modes only on first visit (never overwrite admin's changes)
  if (DB.settings.bgImage === undefined) DB.settings.bgImage = '';
  
  if(!DB.settings.banners || DB.settings.banners.length === 0) {
    DB.settings.banners = [
      { img: 'img/modes/mode-br.jpg', link: 'https://t.me/yourtelegram' },
      { img: 'img/modes/mode-cs.jpg', link: 'https://wa.me/8801712345678' }
    ];
  }
  
  if (!DB.modes) {
    DB.modes = [
      { id: 'all', name: 'All Matches', tag: 'all', image: 'img/modes/mode-all.jpg' },
      { id: 'survival', name: 'BR Match', tag: 'survival', image: 'img/modes/mode-br.jpg' },
      { id: 'squad', name: 'CS 4 VS 4', tag: 'squad', image: 'img/modes/mode-cs.jpg' },
      { id: '1vs1', name: 'Lone Wolf', tag: '1vs1', image: 'img/modes/mode-lonewolf.jpg' },
      { id: 'headshot', name: 'Headshot Only', tag: 'headshot', image: 'img/modes/mode-headshot.jpg' }
    ];
  }
  if (!Array.isArray(DB.modes)) {
    DB.modes = [];
  }
}

function save() { 
  localStorage.setItem('ffhub_db', JSON.stringify(DB));
  // Persist to server file (db.json) — data survives server restarts
  try {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DB)
    }).catch(function(){});
  } catch(e) {}
}

// ── TOAST ───────────────────────────────────────
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'show ' + type;
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.className = ''; }, 3000);
}

// ── TABS ────────────────────────────────────────
let currentResMode = '';
let currentNotifyMode = '';
let currentResMatchId = null;
let currentNotifyMatchId = null;

function populateMatchSelects() {
  load();
  
  const modes = (DB.modes || []).filter(m => m.tag !== 'all');
  
  // Render grid for Results Tab
  const resGrid = document.getElementById('resModeGrid');
  if (resGrid) {
    resGrid.innerHTML = modes.map(m => `
      <div class="admin-mode-box" 
           onclick="selectResMode('${m.tag}')"
           style="background: url('${m.image}') center/cover;">
        <div class="amb-title">${m.name}</div>
      </div>
    `).join('');
  }
  
  // Render grid for Notify Tab
  const notGrid = document.getElementById('notifyModeGrid');
  if (notGrid) {
    notGrid.innerHTML = modes.map(m => `
      <div class="admin-mode-box" 
           onclick="selectNotifyMode('${m.tag}')"
           style="background: url('${m.image}') center/cover;">
        <div class="amb-title">${m.name}</div>
      </div>
    `).join('');
  }

  // Reset to default views when repopulating (safely)
  const rModeView = document.getElementById('resModeView');
  const rMatchListView = document.getElementById('resMatchListView');
  const rActionView = document.getElementById('resActionView');
  if (rModeView) rModeView.style.display = 'block';
  if (rMatchListView) rMatchListView.style.display = 'none';
  if (rActionView) rActionView.style.display = 'none';

  const nModeView = document.getElementById('notifyModeView');
  const nMatchListView = document.getElementById('notifyMatchListView');
  const nActionView = document.getElementById('notifyActionView');
  if (nModeView) nModeView.style.display = 'block';
  if (nMatchListView) nMatchListView.style.display = 'none';
  if (nActionView) nActionView.style.display = 'none';
}

function selectResMode(tag) {
  currentResMode = tag;
  const modeName = DB.modes.find(m => m.tag === tag)?.name || 'All Modes';
  const resModeTitle = document.getElementById('resModeTitle');
  if (resModeTitle) resModeTitle.textContent = modeName;
  
  document.getElementById('resModeView').style.display = 'none';
  document.getElementById('resMatchListView').style.display = 'block';
  document.getElementById('resActionView').style.display = 'none';
  
  loadResultMatchCards();
}

function backToResModes() {
  document.getElementById('resModeView').style.display = 'block';
  document.getElementById('resMatchListView').style.display = 'none';
  document.getElementById('resActionView').style.display = 'none';
}

function selectResMatch(matchId) {
  currentResMatchId = parseInt(matchId);
  const m = DB.matches.find(x => x.id === currentResMatchId);
  if(!m) return;
  document.getElementById('resSelectedMatchTitle').textContent = m.name + ' — ৳' + m.perKill + '/kill';
  
  document.getElementById('resMatchListView').style.display = 'none';
  document.getElementById('resActionView').style.display = 'block';
  
  // Update internal logic: since we removed the `<select>` but functions might rely on reading `document.getElementById('resTournament').value`, we need to change how `submitResult` gets the tournament ID or just create a hidden input.
  // We can just rely on `currentResMatchId`. Let's mock a select element or just modify `loadMatchPlayers`.
  // Wait, let's just make a hidden select or modify `loadMatchPlayers` to use `currentResMatchId`.
  loadMatchPlayersForAdmin(currentResMatchId);
}

function backToResMatchList() {
  document.getElementById('resMatchListView').style.display = 'block';
  document.getElementById('resActionView').style.display = 'none';
  // clear result views
  document.getElementById('matchPlayersList').innerHTML = '<div class="aempty"><i class="fa-solid fa-users"></i><span>ম্যাচ সিলেক্ট করুন</span></div>';
  document.getElementById('giveResultCard').style.display = 'none';
}

function selectNotifyMode(tag) {
  currentNotifyMode = tag;
  const modeName = DB.modes.find(m => m.tag === tag)?.name || 'All Modes';
  const notifyModeTitle = document.getElementById('notifyModeTitle');
  if (notifyModeTitle) notifyModeTitle.textContent = modeName;

  document.getElementById('notifyModeView').style.display = 'none';
  document.getElementById('notifyMatchListView').style.display = 'block';
  document.getElementById('notifyActionView').style.display = 'none';
  
  loadNotifyMatchCards();
}

function backToNotifyModes() {
  document.getElementById('notifyModeView').style.display = 'block';
  document.getElementById('notifyMatchListView').style.display = 'none';
  document.getElementById('notifyActionView').style.display = 'none';
}

function selectNotifyMatch(matchId) {
  currentNotifyMatchId = parseInt(matchId);
  const m = DB.matches.find(x => x.id === currentNotifyMatchId);
  if(!m) return;
  document.getElementById('notifySelectedMatchTitle').textContent = m.name;
  
  document.getElementById('notifyMatchListView').style.display = 'none';
  document.getElementById('notifyActionView').style.display = 'block';
}

function backToNotifyMatchList() {
  document.getElementById('notifyMatchListView').style.display = 'block';
  document.getElementById('notifyActionView').style.display = 'none';
}

// ── MATCH CARDS RENDERERS ──
function loadResultMatchCards() {
  load();
  const filter = currentResMode;
  const matches = (DB.matches || []).filter(m => (filter === '' || m.category === filter) && m.status !== 'done');
  
  const html = matches.length
    ? matches.map(m => `
      <div class="user-card" style="cursor:pointer; background:rgba(0,0,0,0.3); margin-bottom:10px;" onclick="selectResMatch(${m.id})">
        <div class="user-avatar" style="background:linear-gradient(135deg, rgba(255,183,0,0.2), rgba(255,0,85,0.2)); border-color:var(--gold);">
          <i class="fa-solid fa-trophy"></i>
        </div>
        <div class="user-info">
          <div class="user-name">${m.name}</div>
          <div class="user-sub">🗺 ${m.map} &nbsp;·&nbsp; 🕐 ${m.time}</div>
          <div class="user-misc" style="color:var(--green); font-weight:bold;">Per Kill: ৳${m.perKill}</div>
        </div>
        <div>
          <i class="fa-solid fa-chevron-right" style="color:var(--muted)"></i>
        </div>
      </div>
    `).join('')
    : '<div class="aempty"><i class="fa-solid fa-box-open"></i><span>কোনো ম্যাচ নেই</span></div>';
    
  const el = document.getElementById('resMatchCardsList');
  if (el) el.innerHTML = html;
}

function loadNotifyMatchCards() {
  load();
  const filter = currentNotifyMode;
  const matches = (DB.matches || []).filter(m => (filter === '' || m.category === filter) && m.status !== 'done');
  
  const html = matches.length
    ? matches.map(m => `
      <div class="user-card" style="cursor:pointer; background:rgba(0,0,0,0.3); margin-bottom:10px;" onclick="selectNotifyMatch(${m.id})">
        <div class="user-avatar" style="background:linear-gradient(135deg, rgba(0,240,255,0.2), rgba(0,255,136,0.2)); border-color:var(--secondary);">
          <i class="fa-solid fa-key"></i>
        </div>
        <div class="user-info">
          <div class="user-name">${m.name}</div>
          <div class="user-sub">🗺 ${m.map} &nbsp;·&nbsp; 🕐 ${m.time}</div>
        </div>
        <div>
          <i class="fa-solid fa-chevron-right" style="color:var(--muted)"></i>
        </div>
      </div>
    `).join('')
    : '<div class="aempty"><i class="fa-solid fa-box-open"></i><span>কোনো ম্যাচ নেই</span></div>';
    
  const el = document.getElementById('notifyMatchCardsList');
  if (el) el.innerHTML = html;
}

const TAB_TITLES = {
  users: '<i class="fa-solid fa-users"></i> Users Management',
  deposits: '<i class="fa-solid fa-arrow-down-to-line"></i> Deposit Requests',
  withdrawals: '<i class="fa-solid fa-money-bill-transfer"></i> Withdrawal Requests',
  matches: '<i class="fa-solid fa-gamepad"></i> Matches Management',
  results: '<i class="fa-solid fa-trophy"></i> Match Results',
  notify: '<i class="fa-solid fa-bell"></i> Room Codes \u0026 Balance',
  modes: '<i class="fa-solid fa-layer-group"></i> Game Modes Management',
  settings: '<i class="fa-solid fa-sliders"></i> App Settings',
};

function aTab(name, el) {
  document.querySelectorAll('.anav-item').forEach(x => x.classList.remove('active'));
  const navEl = document.getElementById('nav-' + name);
  if (navEl) navEl.classList.add('active');

  document.querySelectorAll('.atab-pane').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('tab-' + name);
  if (target) target.classList.add('active');

  // Update topbar title
  const tb = document.getElementById('topbarTitle');
  if (tb) tb.innerHTML = TAB_TITLES[name] || name;

  if (name === 'users')       renderUsers();
  if (name === 'deposits')    renderDeposits();
  if (name === 'withdrawals') renderWithdrawals();
  if (name === 'matches')     { populateModeSelects(); renderMatchList(); }
  if (name === 'results')     { populateMatchSelects(); renderResultHistory(); }
  if (name === 'notify')      { populateMatchSelects(); }
  if (name === 'modes')       renderModes();
  if (name === 'settings')    { loadSettingsToForm(); loadModeRulesForm(); }

  updateBadges();

  if (document.getElementById('adminSidebar').classList.contains('open')) {
    toggleAdminSidebar();
  }
}

// ── USERS ───────────────────────────────────────
function renderUsers() {
  load();
  const users = Object.values(DB.users);
  const el = document.getElementById('allUsersList');
  if (!el) return;

  if (!users.length) {
    el.innerHTML = '<div class="aempty"><i class="fa-solid fa-users"></i><span>কোন ইউজার নেই</span></div>';
    return;
  }
  el.innerHTML = users.map(u => {
    const bal = u.balance || 0;
    const earn = u.earnBalance || 0;
    
    return `
      <div class="user-card" style="cursor:pointer;" onclick="openUserModal('${u.phone}')">
        <div class="user-avatar"><i class="fa-solid fa-user-astronaut"></i></div>
        <div class="user-info">
          <div class="user-name">${u.name} ${u.supportPin ? `<span class="user-pin-badge">PIN: ${u.supportPin}</span>` : ''}</div>
          <div class="user-sub">
            <span class="user-uid">UID: ${u.uid}</span> | 
            <span class="user-ffname">FF: ${u.ffname}</span><br>
            📱 ${u.phone}
          </div>
        </div>
        <div class="user-stats">
          <div class="user-dep">Dep: ৳${bal}</div>
          <div class="user-earn">Earn: ৳${earn}</div>
          <div class="user-misc">Win: ৳${u.totalPrize||0} | Kills: ${u.totalKills||0}</div>
        </div>
      </div>`;
  }).join('');
}

function searchUser() {
  load();
  const q = document.getElementById('searchQ').value.trim().toLowerCase();
  const el = document.getElementById('userResults');
  if (!el) return;
  if (!q) { el.innerHTML = ''; return; }

  const found = Object.values(DB.users).filter(u =>
    u.uid.toLowerCase().includes(q) ||
    u.ffname.toLowerCase().includes(q) ||
    u.name.toLowerCase().includes(q) ||
    u.phone.includes(q)
  );

  if (!found.length) {
    el.innerHTML = '<div class="aempty"><i class="fa-solid fa-xmark"></i><span>কোনো ইউজার পাওয়া যায়নি</span></div>';
    return;
  }

  el.innerHTML = found.map(u => {
    const bal = u.balance || 0;
    const earn = u.earnBalance || 0;
    
    return `
      <div class="user-card" style="border-color: var(--secondary); cursor:pointer;" onclick="openUserModal('${u.phone}')">
        <div class="user-avatar"><i class="fa-solid fa-user-astronaut"></i></div>
        <div class="user-info">
          <div class="user-name">${u.name} ${u.supportPin ? `<span class="user-pin-badge">PIN: ${u.supportPin}</span>` : ''}</div>
          <div class="user-sub">
            <span class="user-uid">UID: ${u.uid}</span> | 
            <span class="user-ffname">FF: ${u.ffname}</span><br>
            📱 ${u.phone}
          </div>
        </div>
        <div class="user-stats">
          <div class="user-dep">Dep: ৳${bal}</div>
          <div class="user-earn">Earn: ৳${earn}</div>
          <div class="user-misc">Win: ৳${u.totalPrize||0} | Kills: ${u.totalKills||0}</div>
        </div>
      </div>`;
  }).join('');
}


// ── USER MODAL ACTIONS ───────────────────────────
let currentModalUserPhone = null;

function openUserModal(phone) {
  load();
  const u = DB.users[phone];
  if (!u) return;
  currentModalUserPhone = phone;
  
  document.getElementById('umInfo').innerHTML = `
    <strong>নাম:</strong> ${u.name}<br>
    <strong>মোবাইল:</strong> ${phone}<br>
    <strong>FF Name:</strong> ${u.ffname} (UID: ${u.uid})<br>
    <strong style="color:var(--gold)">অবস্থা:</strong> ${u.isBanned ? '<span style="color:red">BANNED</span>' : '<span style="color:var(--green)">ACTIVE</span>'}
  `;
  
  const banBtn = document.getElementById('umBanBtn');
  if (u.isBanned) {
    banBtn.innerHTML = '<i class="fa-solid fa-check"></i> ইউজারকে Unban করুন';
    banBtn.className = 'abtn abtn-green abtn-full';
  } else {
    banBtn.innerHTML = '<i class="fa-solid fa-ban"></i> ইউজারকে Ban করুন';
    banBtn.className = 'abtn abtn-red abtn-full';
  }
  
  document.getElementById('umNewPass').value = '';
  document.getElementById('userModalOverlay').style.display = 'block';
  document.getElementById('userActionModal').style.display = 'block';
}

function closeUserModal() {
  currentModalUserPhone = null;
  document.getElementById('userModalOverlay').style.display = 'none';
  document.getElementById('userActionModal').style.display = 'none';
}

function saveUserPassword() {
  if (!currentModalUserPhone) return;
  const newPass = document.getElementById('umNewPass').value.trim();
  if (newPass.length < 4) {
    toast('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!', 'error');
    return;
  }
  load();
  if (DB.users[currentModalUserPhone]) {
    DB.users[currentModalUserPhone].password = newPass;
    save();
    toast('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!', 'success');
    closeUserModal();
  }
}

function toggleUserBan() {
  if (!currentModalUserPhone) return;
  load();
  if (DB.users[currentModalUserPhone]) {
    const u = DB.users[currentModalUserPhone];
    u.isBanned = !u.isBanned;
    save();
    toast(u.isBanned ? 'ইউজারকে Ban করা হয়েছে!' : 'ইউজারকে Unban করা হয়েছে!', u.isBanned ? 'error' : 'success');
    renderUsers();
    closeUserModal();
  }
}

// ── DEPOSITS ────────────────────────────────────
function renderDeposits() {
  load();
  const pending = DB.deposits.filter(d => d.status === 'pending');
  const el = document.getElementById('depositList');
  if (!el) return;

  if (!pending.length) {
    el.innerHTML = '<div class="aempty"><i class="fa-solid fa-inbox"></i><span>কোনো Pending ডিপোজিট নেই</span></div>';
    return;
  }
  el.innerHTML = pending.map(d => `
    <div class="req-card" id="dep-${d.id}">
      <div class="req-top">
        <div>
          <div class="req-name">👤 ${d.name}</div>
          <div class="req-meta">UID: <span style="color:var(--gold)">${d.uid}</span> | FF Name: <span style="color:var(--secondary)">${d.ffname}</span></div>
        </div>
        <div>
          <div class="req-amount deposit">৳${d.amount}</div>
          <div class="req-method">${d.method}</div>
        </div>
      </div>
      <div class="req-details">
        <div>📱 Sender Phone: <strong>${d.phone}</strong></div>
        <div>🔑 TrxID: <strong style="color:var(--secondary)">${d.trx}</strong></div>
        <div>🕐 Time: <strong>${d.time}</strong></div>
      </div>
      <div class="req-actions">
        <button class="abtn abtn-green" onclick="approveDeposit('${d.id}')">
          <i class="fa-solid fa-check"></i> Approve
        </button>
        <button class="abtn abtn-red" onclick="rejectDeposit('${d.id}')" style="flex:0.5;">
          <i class="fa-solid fa-xmark"></i> Reject
        </button>
      </div>
    </div>`).join('');
}

function approveDeposit(id) {
  load();
  const dep = DB.deposits.find(d => d.id == id);
  if (!dep) return;
  dep.status = 'approved';
  
  const user = DB.users[dep.phone];
  if (user) {
    user.balance = (user.balance || 0) + dep.amount;
    addHistory(dep.phone, 'deposit', `💰 Deposit Approved (${dep.method.toUpperCase()})`, dep.amount, 'done');
    notify('ডিপোজিট Approved! 💰', `৳${dep.amount} আপনার Wallet এ যোগ হয়েছে।`);
  }
  
  save();
  toast('✅ ডিপোজিট Approve সফল হয়েছে!', 'success');
  renderDeposits();
}

function rejectDeposit(id) {
  load();
  const dep = DB.deposits.find(d => d.id == id);
  if (!dep) return;
  dep.status = 'rejected';
  
  // Set status in user history logs too
  const userHistory = DB.history[dep.phone] || [];
  const log = userHistory.find(h => h.type === 'deposit' && h.amount === dep.amount && h.status === 'pending');
  if (log) {
    log.status = 'rejected';
  }
  
  save();
  toast('ডিপোজিট রিকোয়েস্ট Reject করা হয়েছে!', 'error');
  renderDeposits();
}

// ── WITHDRAWALS ─────────────────────────────────
function renderWithdrawals() {
  load();
  const pending = DB.withdrawals.filter(w => w.status === 'pending');
  const el = document.getElementById('withdrawList');
  if (!el) return;

  if (!pending.length) {
    el.innerHTML = '<div class="aempty"><i class="fa-solid fa-inbox"></i><span>কোনো Pending উইথড্র নেই</span></div>';
    return;
  }
  
  const methodLabels = { bkash: '💗 bKash', nagad: '🔶 Nagad', rocket: '🚀 Rocket' };
  
  el.innerHTML = pending.map(w => `
    <div class="req-card" id="wit-${w.id}">
      <div class="req-top">
        <div>
          <div class="req-name">👤 ${w.name}</div>
          <div class="req-meta">UID: <span style="color:var(--gold)">${w.uid}</span> | FF Name: <span style="color:var(--secondary)">${w.ffname}</span></div>
        </div>
        <div>
          <div class="req-amount withdraw">৳${w.amount}</div>
          <div class="req-method">${methodLabels[w.method] || w.method}</div>
        </div>
      </div>
      <div class="req-details">
        <div>📱 Send To Account: <strong style="color:var(--green)">${w.acc}</strong></div>
        <div>📱 Registered Phone: <strong>${w.phone}</strong></div>
        <div>🕐 Time: <strong>${w.time}</strong></div>
      </div>
      <div class="req-actions">
        <button class="abtn abtn-green" onclick="approveWithdraw('${w.id}')">
          <i class="fa-solid fa-check"></i> Approve (Paid)
        </button>
        <button class="abtn abtn-red" onclick="rejectWithdraw('${w.id}')" style="flex:0.5;">
          <i class="fa-solid fa-xmark"></i> Reject (Refund)
        </button>
      </div>
    </div>`).join('');
}

function approveWithdraw(id) {
  load();
  const w = DB.withdrawals.find(x => x.id == id);
  if (!w) return;
  w.status = 'approved';
  
  // Update status in user history
  const userHistory = DB.history[w.phone] || [];
  const log = userHistory.find(h => h.type === 'withdraw' && h.amount === -w.amount && h.status === 'pending');
  if (log) {
    log.status = 'done';
  }
  
  addHistory(w.phone, 'withdraw', `✅ Winnings Cashed Out (${w.method.toUpperCase()})`, -w.amount, 'done');
  notify('উইথড্র Approved! ✅', `৳${w.amount} আপনার ${w.method} (${w.acc}) নম্বরে পাঠানো হয়েছে।`);
  save();
  
  toast('✅ উইথড্র Approved সফল হয়েছে!', 'success');
  renderWithdrawals();
}

function rejectWithdraw(id) {
  load();
  const w = DB.withdrawals.find(x => x.id == id);
  if (!w) return;
  w.status = 'rejected';
  
  // Refund money to user's earnBalance (Winnings)
  const user = DB.users[w.phone];
  if (user) {
    user.earnBalance = (user.earnBalance || 0) + w.amount;
    addHistory(w.phone, 'deposit', `❌ Withdraw Rejected (Refunded)`, w.amount, 'done');
    
    // Update status in user history for the original withdraw record
    const userHistory = DB.history[w.phone] || [];
    const log = userHistory.find(h => h.type === 'withdraw' && h.amount === -w.amount && h.status === 'pending');
    if (log) {
      log.status = 'rejected';
    }
  }
  
  save();
  toast('উইথড্র Reject করা হয়েছে ও টাকা রিফান্ড দেওয়া হয়েছে!', 'error');
  renderWithdrawals();
}

// ── RESULTS ─────────────────────────────────────
function lookupPlayer() {
  load();
  const q = document.getElementById('resUID').value.trim().toLowerCase();
  const el = document.getElementById('foundPlayer');
  if (!el) return;
  if (!q) { el.innerHTML = ''; return; }

  const user = Object.values(DB.users).find(u =>
    u.uid.toLowerCase() === q || u.ffname.toLowerCase() === q || u.phone === q
  );
  if (!user) {
    el.innerHTML = '<div class="found-box" style="color:var(--primary);border-color:var(--primary);background:rgba(255,0,85,0.05);">❌ Player পাওয়া যায়নি! সঠিক UID দিন।</div>';
    foundPlayerPhone = null;
    return;
  }
  
  foundPlayerPhone = user.phone;
  el.innerHTML = `
    <div class="found-box">
      ✅ Player Found: <strong style="color:var(--green);">${user.ffname}</strong> (UID: ${user.uid})<br>
      👤 Name: ${user.name} | 📱 Phone: ${user.phone}<br>
      💰 Balances — Dep: ৳${user.balance||0} | Win: ৳${user.earnBalance||0} | Kills: ${user.totalKills||0}
    </div>`;
    
  calcPrizePreview();
}

function calcPrizePreview() {
  const kills     = parseInt(document.getElementById('resKills').value) || 0;
  const placement = parseInt(document.getElementById('resPlacement').value) || 0;
  const tid       = currentResMatchId;
  const t = (DB.matches || []).find(x => String(x.id) === String(tid));
  if (!t) return;

  const killMoney = kills * (t.perKill || 0);
  const placeMoney = placement > 0 ? ((t.placement && t.placement[placement]) || 0) : 0;
  const total = killMoney + placeMoney;

  const el = document.getElementById('prizePreview');
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = `
    <div>💀 Kill Winnings: ${kills} × ৳${t.perKill || 0} = <strong class="pkill">৳${killMoney}</strong></div>
    ${placement > 0 ? `<div>🏆 Placement Bonus (Place #${placement}): <strong class="pplace">৳${placeMoney}</strong></div>` : ''}
    <div style="border-top:1px solid rgba(255,255,255,0.05);margin-top:6px;padding-top:6px;">
      💰 Net Prize Payout: <strong class="ptotal">৳${total}</strong>
    </div>`;
}

function submitResult() {
  if (!foundPlayerPhone) { toast('আগে Player সিলেক্ট করুন!', 'error'); return; }
  load();

  const kills     = parseInt(document.getElementById('resKills').value) || 0;
  const placement = parseInt(document.getElementById('resPlacement').value) || 0;
  const tid       = currentResMatchId;

  // Find match from DB.matches
  const t = (DB.matches || []).find(x => String(x.id) === String(tid));
  if (!t) { toast('ম্যাচ পাওয়া যায়নি!', 'error'); return; }

  const killMoney  = kills * (t.perKill || 0);
  const placeMoney = placement > 0 ? ((t.placement && t.placement[placement]) || 0) : 0;
  const total      = killMoney + placeMoney;

  const user = DB.users[foundPlayerPhone];
  if (!user) { toast('User পাওয়া যায়নি!', 'error'); return; }

  // Prevent duplicate prize distribution for the same match
  const alreadyRewarded = (DB.resultLog || []).find(r => String(r.uid) === String(user.uid) && String(r.tournament) === String(t.name));
  if (alreadyRewarded) {
    toast('এই প্লেয়ারকে এই ম্যাচে আগে থেকেই প্রাইজ দেওয়া হয়েছে!', 'error');
    return;
  }

  if (user.earnBalance === undefined) user.earnBalance = 0;
  user.earnBalance += total;
  user.totalPrize = (user.totalPrize || 0) + total;
  user.totalKills = (user.totalKills || 0) + kills;
  DB.users[foundPlayerPhone] = user;

  const log = {
    id: Date.now(),
    playerName: user.ffname,
    uid: user.uid,
    tournament: t.name,
    kills, placement, killMoney, placeMoney, total,
    time: new Date().toLocaleString('bn-BD')
  };

  if (!DB.resultLog) DB.resultLog = [];
  DB.resultLog.unshift(log);

  addHistory(foundPlayerPhone, 'prize',
    `🏆 Winnings: ${t.name} (${kills} Kills${placement > 0 ? ' | Place #' + placement : ''})`,
    total, 'done');

  save();

  notify('প্রাইজ পেয়েছেন! 🏆', `৳${total} আপনার Winnings Wallet এ যোগ হয়েছে। (${t.name})`);
  toast(`✅ ৳${total} ${user.ffname} এর Winnings Balance এ যোগ হয়েছে!`, 'success');

  // Clear Form Logic
  cancelResultSelect();
  document.getElementById('resKills').value = '';
  document.getElementById('resPlacement').value = '0';
  renderResultHistory();
}

// ── ROOM NOTIFY ─────────────────────────────────
function sendRoomNotify() {
  const rid  = document.getElementById('roomID').value.trim();
  const pass = document.getElementById('roomPass').value.trim();
  const tid  = currentNotifyMatchId;

  if (!rid || !pass) { toast('Room ID ও Password দিন!', 'error'); return; }
  if (!tid) { toast('ম্যাচ সিলেক্ট করুন!', 'error'); return; }

  load();
  const t = (DB.matches || []).find(x => String(x.id) === String(tid));

  if (!DB.roomCodes) DB.roomCodes = {};
  DB.roomCodes[tid] = { roomId: rid, password: pass, matchName: t ? t.name : '' };
  save();

  notify(`🔑 Room Code Published!`, `${t ? t.name : 'Match'} — Room ID: ${rid} | Pass: ${pass}`);
  toast(`✅ Room Code সফলভাবে পাবলিশ হয়েছে!`, 'success');

  document.getElementById('roomID').value = '';
  document.getElementById('roomPass').value = '';
}

function renderResultHistory() {
  load();
  const logs = DB.resultLog || [];
  const el = document.getElementById('resultHistory');
  if (!el) return;

  if (!logs.length) {
    el.innerHTML = '<div class="aempty"><i class="fa-solid fa-inbox"></i><span>কোনো ইতিহাস নেই</span></div>';
    return;
  }
  el.innerHTML = logs.slice(0, 15).map(r => `
    <div class="result-item">
      <div>
        <div class="result-player">⚔️ ${r.playerName} (${r.uid})</div>
        <div class="result-sub">${r.tournament} | Kills: ${r.kills} | Place: ${r.placement || '—'} | ${r.time}</div>
      </div>
      <div class="result-prize">+৳${r.total}</div>
    </div>`).join('');
}

// ── MANUAL BALANCE ADJUST ──────────────────────────
function manualBalance() {
  load();
  const q   = document.getElementById('manualUID').value.trim().toLowerCase();
  const amt = parseInt(document.getElementById('manualAmt').value);
  const note = document.getElementById('manualNote').value.trim() || 'Manual Adjustment';

  if (!q || isNaN(amt)) { toast('UID/মোবাইল ও Amount দিন!', 'error'); return; }

  const user = Object.values(DB.users).find(u =>
    u.uid.toLowerCase() === q || u.ffname.toLowerCase() === q || u.phone === q
  );
  if (!user) { toast('Player পাওয়া যায়নি!', 'error'); return; }

  // Deduct/add from user.balance (deposit balance)
  user.balance = Math.max(0, (user.balance || 0) + amt);
  DB.users[user.phone] = user;
  
  addHistory(user.phone, amt >= 0 ? 'deposit' : 'withdraw',
    `🔧 ${note}`, amt, 'done');
  save();

  toast(`✅ ${user.ffname} এর Balance ${amt >= 0 ? '+' : ''}${amt} করা হয়েছে! New Dep Bal: ৳${user.balance}`, 'success');
  document.getElementById('manualUID').value = '';
  document.getElementById('manualAmt').value = '';
  document.getElementById('manualNote').value = '';
  renderUsers();
}

// ── PER-MODE CUSTOM RULES ──────────────────────
function loadModeRulesForm() {
  load();
  const modes = DB.modes || [];
  const modeRules = DB.settings.modeRules || {};
  const container = document.getElementById('modeRulesContainer');
  if (!container) return;
  
  // Only show modes that are actual game modes (skip 'all')
  const gameModes = modes.filter(m => m.tag !== 'all');
  
  container.innerHTML = gameModes.map(m => {
    const currentRules = modeRules[m.tag] || '';
    return `
      <div style="margin-bottom:16px; padding:14px; background:rgba(255,255,255,0.02); border:1px solid rgba(0,240,255,0.1); border-radius:10px;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
          <img src="${m.image}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;border:1px solid var(--border);" onerror="this.style.display='none'">
          <div>
            <div style="font-weight:700;color:var(--text);font-size:0.95rem;">${m.name}</div>
            <div style="font-size:0.7rem;color:var(--muted);">ট্যাগ: ${m.tag} | এই মোডের সব ম্যাচে এই নিয়ম দেখাবে</div>
          </div>
        </div>
        <textarea id="rules_${m.tag}" placeholder="প্রতি লাইনে একটি করে নিয়ম লিখুন&#10;যেমন:&#10;১. এই ম্যাচে Entry Fee...&#10;২. প্রতিটি kill এর জন্য..." style="width:100%;min-height:100px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:8px;color:var(--text);padding:10px;font-size:0.85rem;font-family:inherit;resize:vertical;">${currentRules}</textarea>
        <div style="font-size:0.7rem;color:var(--muted);margin-top:4px;">প্রতি লাইনে একটি করে নিয়ম। ফাঁকা রাখলে ডিফল্ট নিয়ম দেখাবে।</div>
      </div>
    `;
  }).join('');
  
  // Add a default rules section
  const defaultRules = modeRules['default'] || '';
  container.innerHTML += `
    <div style="margin-bottom:8px; padding:14px; background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:10px;">
      <div style="font-weight:700;color:var(--text);font-size:0.95rem;margin-bottom:8px;">📋 ডিফল্ট নিয়ম (যে মোডের জন্য আলাদা নিয়ম সেট করা নেই)</div>
      <textarea id="rules_default" placeholder="ডিফল্ট নিয়ম লিখুন..." style="width:100%;min-height:80px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:8px;color:var(--text);padding:10px;font-size:0.85rem;font-family:inherit;resize:vertical;">${defaultRules}</textarea>
    </div>`;
}

function saveModeRules() {
  load();
  const modes = DB.modes || [];
  const gameModes = modes.filter(m => m.tag !== 'all');
  
  if (!DB.settings.modeRules) DB.settings.modeRules = {};
  
  // Save each mode's rules
  gameModes.forEach(m => {
    const el = document.getElementById('rules_' + m.tag);
    if (el) {
      DB.settings.modeRules[m.tag] = el.value;
    }
  });
  
  // Save default rules
  const defaultEl = document.getElementById('rules_default');
  if (defaultEl) {
    DB.settings.modeRules['default'] = defaultEl.value;
  }
  
  save();
  toast('✅ প্রতিটি মোডের জন্য নিয়ম সেভ করা হয়েছে!', 'success');
}

// ── APP SETTINGS & BANNERS ────────────────────────────────
let uploadedBannerImgBase64 = '';
let uploadedBgImgBase64 = '';

function handleBannerImageUpload(input) {
  const file = input.files[0];
  const nameEl = document.getElementById('bannerFileName');
  const preview = document.getElementById('bannerImgPreview');
  const previewImg = document.getElementById('bannerPreviewImg');
  
  if (file) {
    if (file.size > 2 * 1024 * 1024) { // 2MB limit for banners
      toast('২ মেগাবাইটের কম সাইজের ছবি আপলোড করুন!', 'error');
      input.value = '';
      return;
    }
    nameEl.textContent = file.name;
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedBannerImgBase64 = e.target.result;
      if (previewImg) previewImg.src = e.target.result;
      if (preview) preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    nameEl.textContent = 'কোনো ফাইল সিলেক্ট করা হয়নি';
    uploadedBannerImgBase64 = '';
    if (preview) preview.style.display = 'none';
  }
}

function loadSettingsToForm() {
  load();
  if(!DB.settings.banners) DB.settings.banners = [];
  
  document.getElementById('cfgLiveLink').value = DB.settings.liveLink || '';
  document.getElementById('cfgTutorialLink').value = DB.settings.tutorialLink || '';
  document.getElementById('cfgBkash').value = DB.settings.payNumbers.bkash || '';
  document.getElementById('cfgNagad').value = DB.settings.payNumbers.nagad || '';
  document.getElementById('cfgRocket').value = DB.settings.payNumbers.rocket || '';
  
  if(!DB.settings.limits) DB.settings.limits = {minDep: 50, maxDep: 5000, minWit: 100, maxWit: 5000};
  const cfgMinDep = document.getElementById('cfgMinDep');
  if(cfgMinDep) cfgMinDep.value = DB.settings.limits.minDep;
  const cfgMaxDep = document.getElementById('cfgMaxDep');
  if(cfgMaxDep) cfgMaxDep.value = DB.settings.limits.maxDep;
  const cfgMinWit = document.getElementById('cfgMinWit');
  if(cfgMinWit) cfgMinWit.value = DB.settings.limits.minWit;
  const cfgMaxWit = document.getElementById('cfgMaxWit');
  if(cfgMaxWit) cfgMaxWit.value = DB.settings.limits.maxWit;

  
  // Load background image preview
  const bgPreview = document.getElementById('bgImgPreview');
  const bgPreviewImg = document.getElementById('bgPreviewImg');
  const bgFileName = document.getElementById('bgFileName');
  if (DB.settings.bgImage) {
    if (bgPreviewImg) bgPreviewImg.src = DB.settings.bgImage;
    if (bgPreview) bgPreview.style.display = 'block';
    if (bgFileName) bgFileName.textContent = 'Current background image loaded';
  } else {
    if (bgPreview) bgPreview.style.display = 'none';
    if (bgFileName) bgFileName.textContent = 'কোনো ব্যাকগ্রাউন্ড ছবি সেট করা হয়নি';
  }
  
  renderBanners();
}

function renderBanners() {
  const el = document.getElementById('bannerList');
  if(!el) return;
  const banners = DB.settings.banners || [];
  if(banners.length === 0) {
    el.innerHTML = '<div class="aempty" style="padding:20px;"><i class="fa-solid fa-image"></i><span>কোনো ব্যানার নেই</span></div>';
    return;
  }
  
  el.innerHTML = banners.map((b, i) => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); padding:10px; border:1px solid rgba(0,240,255,0.1); border-radius:10px; margin-bottom:8px;">
      <div style="display:flex; align-items:center; gap:12px;">
        <img src="${b.img}" style="width:50px; height:30px; object-fit:cover; border-radius:4px; border:1px solid var(--border);">
        <div style="font-size:0.8rem; color:var(--muted); max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          Link: ${b.link || 'None'}
        </div>
      </div>
      <button class="abtn abtn-red" style="padding:6px 12px; font-size:0.8rem;" onclick="removeBanner(${i})"><i class="fa-solid fa-trash"></i></button>
    </div>
  `).join('');
}

function addBanner() {
  load();
  const img = document.getElementById('newBannerImg').value.trim();
  const link = document.getElementById('newBannerLink').value.trim();
  
  let finalImg = img;
  if (uploadedBannerImgBase64) {
    finalImg = uploadedBannerImgBase64;
  }
  
  if(!finalImg) { toast('ছবির URL দিন অথবা একটি ছবি আপলোড করুন!', 'error'); return; }
  
  if(!DB.settings.banners) DB.settings.banners = [];
  DB.settings.banners.push({ img: finalImg, link });
  save();
  toast('ব্যানার যুক্ত হয়েছে!', 'success');
  
  document.getElementById('newBannerImg').value = '';
  document.getElementById('newBannerLink').value = '';
  document.getElementById('bannerFile').value = '';
  document.getElementById('bannerFileName').textContent = 'কোনো ফাইল সিলেক্ট করা হয়নি';
  const preview = document.getElementById('bannerImgPreview');
  if (preview) preview.style.display = 'none';
  uploadedBannerImgBase64 = '';
  
  renderBanners();
}

function removeBanner(index) {
  load();
  if(DB.settings.banners && DB.settings.banners[index]) {
    DB.settings.banners.splice(index, 1);
    save();
    toast('ব্যানার মুছে ফেলা হয়েছে!', 'info');
    renderBanners();
  }
}

// ── WEBSITE BACKGROUND IMAGE ────────────────────
function handleBgImageUpload(input) {
  const file = input.files[0];
  const nameEl = document.getElementById('bgFileName');
  const preview = document.getElementById('bgImgPreview');
  const previewImg = document.getElementById('bgPreviewImg');
  if (file) {
    if (file.size > 3 * 1024 * 1024) {
      toast('3MB এর কম সাইজের ছবি দিন!', 'error');
      input.value = '';
      return;
    }
    nameEl.textContent = file.name;
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedBgImgBase64 = e.target.result;
      if (previewImg) previewImg.src = e.target.result;
      if (preview) preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    nameEl.textContent = 'No file selected';
    uploadedBgImgBase64 = '';
  }
}

function saveBgImage() {
  load();
  const urlInput = document.getElementById('cfgBgUrl');
  const url = urlInput ? urlInput.value.trim() : '';
  if (uploadedBgImgBase64) {
    DB.settings.bgImage = uploadedBgImgBase64;
  } else if (url) {
    DB.settings.bgImage = url;
  } else {
    DB.settings.bgImage = '';
  }
  save();
  toast('\uD83D\uDDBC\uFE0F \u09AC\u09CD\u09AF\u09BE\u0995\u0997\u09CD\u09B0\u09BE\u0989\u09A8\u09CD\u09A1 \u099B\u09AC\u09BF \u09B8\u09C7\u09AD \u09B9\u09AF\u09BC\u09C7\u099B\u09C7!', 'success');
  uploadedBgImgBase64 = '';
  if (urlInput) urlInput.value = '';
  document.getElementById('bgFile').value = '';
  document.getElementById('bgFileName').textContent = '\u0995\u09CB\u09A8\u09CB \u09AB\u09BE\u0987\u09B2 \u09B8\u09BF\u09B2\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09A8\u09BF';
  const preview = document.getElementById('bgImgPreview');
  const previewImg = document.getElementById('bgPreviewImg');
  if (DB.settings.bgImage) {
    if (previewImg) previewImg.src = DB.settings.bgImage;
    if (preview) preview.style.display = 'block';
  } else {
    if (preview) preview.style.display = 'none';
  }
}

function removeBgImage() {
  load();
  DB.settings.bgImage = '';
  save();
  uploadedBgImgBase64 = '';
  document.getElementById('bgFile').value = '';
  document.getElementById('bgFileName').textContent = '\u0995\u09CB\u09A8\u09CB \u09AB\u09BE\u0987\u09B2 \u09B8\u09BF\u09B2\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09A8\u09BF';
  const preview = document.getElementById('bgImgPreview');
  if (preview) preview.style.display = 'none';
  toast('\u09AC\u09CD\u09AF\u09BE\u0995\u0997\u09CD\u09B0\u09BE\u0989\u09A8\u09CD\u09A1 \u099B\u09AC\u09BF \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7!', 'info');
}

function saveSettings() {
  load();
  
  DB.settings.liveLink = document.getElementById('cfgLiveLink').value.trim();
  DB.settings.tutorialLink = document.getElementById('cfgTutorialLink').value.trim();
  
  DB.settings.payNumbers.bkash = document.getElementById('cfgBkash').value.trim();
  DB.settings.payNumbers.nagad = document.getElementById('cfgNagad').value.trim();
  DB.settings.payNumbers.rocket = document.getElementById('cfgRocket').value.trim();
  
  if(!DB.settings.limits) DB.settings.limits = {};
  const inMinDep = document.getElementById('cfgMinDep');
  if(inMinDep) DB.settings.limits.minDep = parseInt(inMinDep.value) || 50;
  const inMaxDep = document.getElementById('cfgMaxDep');
  if(inMaxDep) DB.settings.limits.maxDep = parseInt(inMaxDep.value) || 5000;
  const inMinWit = document.getElementById('cfgMinWit');
  if(inMinWit) DB.settings.limits.minWit = parseInt(inMinWit.value) || 100;
  const inMaxWit = document.getElementById('cfgMaxWit');
  if(inMaxWit) DB.settings.limits.maxWit = parseInt(inMaxWit.value) || 5000;

  
  save();
  toast('⚙️ সেটিংস সফলভাবে সেভ করা হয়েছে!', 'success');
}

// ── MATCH MANAGEMENT ────────────────────────────
function addMatch() {
  load();
  const name     = document.getElementById('mName').value.trim();
  const cat      = document.getElementById('mCategory').value;
  const mode     = document.getElementById('mMode').value;
  const map      = document.getElementById('mMap').value.trim() || 'Bermuda';
  const fee      = parseInt(document.getElementById('mFee').value) || 0;
  const prize    = parseInt(document.getElementById('mPrize').value) || 0;
  const perKill  = parseInt(document.getElementById('mPerKill').value) || 0;
  const slots    = parseInt(document.getElementById('mSlots').value) || 48;
  const status   = document.getElementById('mStatus').value;
  const time     = document.getElementById('mTime').value.trim() || '8:00 PM Today';
  const image    = document.getElementById('mImage').value.trim() || 'img/modes/mode-br.jpg';
  const p1 = parseInt(document.getElementById('mP1').value) || 0;
  const p2 = parseInt(document.getElementById('mP2').value) || 0;
  const p3 = parseInt(document.getElementById('mP3').value) || 0;
  const p4 = parseInt(document.getElementById('mP4').value) || 0;

  if (!name) { toast('ম্যাচের নাম দিন!', 'error'); return; }

  const newId = Date.now();
  const newMatch = {
    id: newId, name, category: cat, mode, map,
    entryFee: fee, prizePool: prize, perKill,
    placement: { 1: p1, 2: p2, 3: p3, 4: p4, 5: p4 },
    maxSlots: slots, filledSlots: 0,
    status, time, image
  };

  if (!DB.matches) DB.matches = [];
  DB.matches.push(newMatch);
  save();
  toast('ম্যাচ তৈরি হয়েছে! 🎮', 'success');

  // Clear form
  ['mName','mMap','mFee','mPrize','mPerKill','mSlots','mTime','mImage','mP1','mP2','mP3','mP4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  renderMatchList();
}

function renderMatchList() {
  load();
  const matches = DB.matches || [];
  const el = document.getElementById('allMatchesList');
  const cnt = document.getElementById('matchCount');
  if (cnt) cnt.textContent = matches.length + ' টি';
  if (!el) return;

  if (!matches.length) {
    el.innerHTML = '<div class="aempty"><i class="fa-solid fa-gamepad"></i><span>কোনো ম্যাচ নেই</span></div>';
    return;
  }

  const statusColor = { upcoming: 'var(--gold)', live: 'var(--green)', done: 'var(--muted)' };
  const statusLabel = { upcoming: 'SOON', live: 'LIVE', done: 'DONE' };

  el.innerHTML = matches.map(m => `
    <div class="req-card" style="margin-bottom:10px;">
      <div style="display:flex; gap:12px; align-items:center; margin-bottom:10px;">
        <img src="${m.image}" style="width:60px;height:45px;object-fit:cover;border-radius:8px;border:1px solid var(--border);" onerror="this.style.display='none'">
        <div style="flex:1;">
          <div style="font-weight:700;color:var(--text);font-size:0.95rem;">${m.name}</div>
          <div style="font-size:0.75rem;color:var(--muted);margin-top:2px;">
            <span style="color:${statusColor[m.status]};font-weight:700;">${statusLabel[m.status]}</span>
            · ${m.mode} · ${m.map} · Entry: ৳${m.entryFee} · Slots: ${m.filledSlots}/${m.maxSlots}
          </div>
        </div>
      </div>
      <div style="display:flex; gap:8px;">
        <div style="flex:1;">
          <label style="font-size:0.68rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;display:block;">Status</label>
          <select onchange="updateMatchStatus('${m.id}', this.value)" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:8px;color:var(--text);padding:8px 10px;font-size:0.8rem;cursor:pointer;">
            <option value="upcoming" ${m.status==='upcoming'?'selected':''}>🟡 Upcoming</option>
            <option value="live" ${m.status==='live'?'selected':''}>🔴 Live</option>
            <option value="done" ${m.status==='done'?'selected':''}>⚫ Done</option>
          </select>
        </div>
        <button class="abtn abtn-red" style="flex:0.5;padding:8px 6px;font-size:0.85rem;" onclick="deleteMatch('${m.id}')">
          <i class="fa-solid fa-trash-can"></i> মুছুন
        </button>
      </div>
    </div>
  `).join('');
}

function updateMatchStatus(id, newStatus) {
  load();
  const m = DB.matches.find(x => String(x.id) === String(id));
  if (m) { m.status = newStatus; save(); toast('ম্যাচ Status আপডেট হয়েছে!', 'success'); }
}

function deleteMatch(id) {
  if (!confirm('⚠️ এই ম্যাচটি মুছে ফেলবেন? এর সঙ্গে যুক্ত সকল প্লেয়ার ডাটা, রুম কোড ও রেজাল্টও মুছে যাবে!')) return;
  load();
  const match = DB.matches.find(x => String(x.id) === String(id));
  if (!match) return;
  
  const matchName = match.name;
  
  // Remove from matches list
  DB.matches = DB.matches.filter(x => String(x.id) !== String(id));
  
  // Clean up match players data
  if (DB.matchPlayers && DB.matchPlayers[id]) {
    delete DB.matchPlayers[id];
  }
  
  // Clean up room codes
  if (DB.roomCodes && DB.roomCodes[id]) {
    delete DB.roomCodes[id];
  }
  
  // Clean up joined users data
  if (DB.joined) {
    Object.keys(DB.joined).forEach(phone => {
      if (DB.joined[phone]) {
        DB.joined[phone] = DB.joined[phone].filter(jid => String(jid) !== String(id));
      }
    });
  }
  
  // Clean up result logs
  if (DB.resultLog) {
    DB.resultLog = DB.resultLog.filter(r => r.tournament !== matchName);
  }
  
  save();
  toast('🗑️ ম্যাচ ও সম্পর্কিত সব ডাটা মুছে ফেলা হয়েছে!', 'info');
  renderMatchList();
}

// ── MATCH PLAYER RESULTS ────────────────────────
let foundPlayerPhone = null;
let selectedResultMatchId = null;

function loadMatchPlayersForAdmin(matchId) {
  load();
  const tid = parseInt(matchId) || matchId;
  if (!tid) return;

  selectedResultMatchId = tid;

  const players = Object.values(DB.matchPlayers && DB.matchPlayers[tid] ? DB.matchPlayers[tid] : {});
  const el = document.getElementById('matchPlayersList');
  if (!el) return;

  if (!players.length) {
    el.innerHTML = '<div class="aempty"><i class="fa-solid fa-user-slash"></i><span>এই ম্যাচে কোনো প্লেয়ার জয়েন করেনি</span></div>';
    return;
  }

  el.innerHTML = players.map(p => {
    const user = DB.users[p.phone] || {};
    return `
    <div class="user-card" style="cursor:pointer;" onclick="selectPlayerForResult('${p.phone}')">
      <div class="user-avatar"><i class="fa-solid fa-user-astronaut"></i></div>
      <div class="user-info">
        <div class="user-name">${p.ffname || user.ffname || 'Unknown'}</div>
        <div class="user-sub"><span class="user-uid">UID: ${p.uid || user.uid || '—'}</span><br>📱 ${p.phone}</div>
      </div>
      <div class="user-stats">
        <div style="color:var(--secondary);font-size:0.8rem;font-weight:700;">ক্লিক করুন</div>
        <div class="user-misc">Prize দিতে →</div>
      </div>
    </div>`;
  }).join('');
}

function selectPlayerForResult(phone) {
  load();
  const user = DB.users[phone];
  if (!user) return;

  foundPlayerPhone = phone;
  const card = document.getElementById('giveResultCard');
  const nameEl = document.getElementById('resultPlayerName');
  const foundEl = document.getElementById('foundPlayer');

  if (nameEl) nameEl.textContent = user.ffname;
  if (foundEl) foundEl.innerHTML = `<div class="found-box">✅ <strong style="color:var(--green)">${user.ffname}</strong> (UID: ${user.uid}) | 📱 ${user.phone}<br>💰 Dep: ৳${user.balance||0} | Win: ৳${user.earnBalance||0} | Kills: ${user.totalKills||0}</div>`;
  if (card) card.style.display = 'block';
  if (document.getElementById('resKills')) document.getElementById('resKills').value = '';
  if (document.getElementById('resPlacement')) document.getElementById('resPlacement').value = '0';
  const pp = document.getElementById('prizePreview');
  if (pp) pp.style.display = 'none';
  card.scrollIntoView({ behavior: 'smooth' });
}

function cancelResultSelect() {
  foundPlayerPhone = null;
  const card = document.getElementById('giveResultCard');
  if (card) card.style.display = 'none';
}

// ── HELPERS ─────────────────────────────────────
function addHistory(phone, type, label, amount, status) {
  if (!DB.history[phone]) DB.history[phone] = [];
  DB.history[phone].unshift({ type, label, amount, status, time: new Date().toLocaleString('bn-BD') });
}

function notify(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icons/icon-192.png' });
  }
}

let lastPendingDep = -1;
let lastPendingWit = -1;

function checkNewRequests() {
  // We need to reload DB from localStorage to see if user app added something
  const d = localStorage.getItem('ffhub_db');
  if (d) {
    try {
      const tempDB = JSON.parse(d);
      const curDep = (tempDB.deposits || []).filter(x => x.status === 'pending').length;
      const curWit = (tempDB.withdrawals || []).filter(x => x.status === 'pending').length;
      
      // If we have more pending deposits than last time
      if (lastPendingDep !== -1 && curDep > lastPendingDep) {
        notify('New Deposit Request! 💰', 'একজন ইউজার নতুন ডিপোজিট রিকোয়েস্ট পাঠিয়েছে।');
        // Refresh admin UI if we are on deposit tab
        if(document.getElementById('tab-deposits').classList.contains('active')) {
          renderDeposits();
        }
      }
      // If we have more pending withdrawals than last time
      if (lastPendingWit !== -1 && curWit > lastPendingWit) {
        notify('New Withdraw Request! 🚀', 'একজন ইউজার নতুন উইথড্র রিকোয়েস্ট পাঠিয়েছে।');
        if(document.getElementById('tab-withdrawals').classList.contains('active')) {
          renderWithdrawals();
        }
      }
      
      lastPendingDep = curDep;
      lastPendingWit = curWit;
      
      // Also update badges
      updateBadges();
      
    } catch(e) {}
  }
}

// ── CUSTOM MODES MANAGEMENT ────────────────────
let uploadedModeImgBase64 = '';

function handleModeImageUpload(input) {
  const file = input.files[0];
  const nameEl = document.getElementById('modeFileName');
  const preview = document.getElementById('modeImgPreview');
  const previewImg = document.getElementById('modePreviewImg');
  
  if (file) {
    if (file.size > 1.5 * 1024 * 1024) { // 1.5MB limit
      toast('১.৫ মেগাবাইটের কম সাইজের ছবি আপলোড করুন!', 'error');
      input.value = '';
      return;
    }
    nameEl.textContent = file.name;
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedModeImgBase64 = e.target.result;
      if (previewImg) previewImg.src = e.target.result;
      if (preview) preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    nameEl.textContent = 'কোনো ফাইল সিলেক্ট করা হয়নি';
    uploadedModeImgBase64 = '';
    if (preview) preview.style.display = 'none';
  }
}

function populateModeSelects() {
  load();
  const mCategory = document.getElementById('mCategory');
  if (mCategory) {
    const modes = (DB.modes || []).filter(m => m.tag !== 'all');
    mCategory.innerHTML = modes.map(m => `<option value="${m.tag}">${m.name}</option>`).join('');
  }
}

function renderModes() {
  load();
  const modes = DB.modes || [];
  const el = document.getElementById('allModesList');
  const cnt = document.getElementById('modeCount');
  if (cnt) cnt.textContent = modes.length + ' টি';
  if (!el) return;

  if (!modes.length) {
    el.innerHTML = '<div class="aempty"><i class="fa-solid fa-layer-group"></i><span>কোনো মোড নেই</span></div>';
    return;
  }

  el.innerHTML = modes.map((m, index) => `
    <div class="req-card" style="margin-bottom:10px;">
      <div style="display:flex; gap:12px; align-items:center;">
        <img src="${m.image}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid var(--border);" onerror="this.src='img/modes/mode-all.jpg'">
        <div style="flex:1;">
          <div style="font-weight:700;color:var(--text);font-size:0.95rem;">${m.name}</div>
          <div style="font-size:0.75rem;color:var(--muted);margin-top:2px;">
            Tag: <span style="color:var(--secondary);font-weight:700;">${m.tag}</span>
          </div>
        </div>
        <div>
          <button class="abtn abtn-red" style="padding:8px 14px;font-size:0.85rem;" onclick="deleteCustomMode('${m.id}')">
            <i class="fa-solid fa-trash-can"></i> মুছুন
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function addCustomMode() {
  load();
  const name  = document.getElementById('modeName').value.trim();
  const tag   = document.getElementById('modeTag').value.trim().toLowerCase().replace(/\s+/g, '_');
  const image = document.getElementById('modeImage').value.trim();
  
  if (!name) { toast('মোডের নাম দিন!', 'error'); return; }
  if (!tag) { toast('ফিল্টার ট্যাগ দিন!', 'error'); return; }
  
  const exists = (DB.modes || []).some(m => m.tag === tag);
  if (exists) { toast('এই ট্যাগটি ইতিমধ্যেই ব্যবহৃত হচ্ছে!', 'error'); return; }
  
  let finalImg = 'img/modes/mode-all.jpg';
  if (uploadedModeImgBase64) {
    finalImg = uploadedModeImgBase64;
  } else if (image) {
    finalImg = image;
  }

  const newMode = {
    id: 'mode_' + Date.now(),
    name,
    tag,
    image: finalImg
  };

  if (!DB.modes) DB.modes = [];
  DB.modes.push(newMode);
  save();
  toast('নতুন গেম মোড যুক্ত হয়েছে! 🎮', 'success');

  document.getElementById('modeName').value = '';
  document.getElementById('modeTag').value = '';
  document.getElementById('modeImage').value = '';
  document.getElementById('modeFile').value = '';
  document.getElementById('modeFileName').textContent = 'কোনো ফাইল সিলেক্ট করা হয়নি';
  const preview = document.getElementById('modeImgPreview');
  if (preview) preview.style.display = 'none';
  uploadedModeImgBase64 = '';

  renderModes();
  populateModeSelects();
  updateBadges();
}

function deleteCustomMode(id) {
  const mode = (DB.modes || []).find(m => m.id === id);
  const name = mode ? mode.name : 'এই মোড';
  if (!confirm(`⚠️ "${name}" মুছে ফেলবেন? এটি গেম মোড তালিকা থেকে সরিয়ে ফেলা হবে!`)) return;
  load();
  DB.modes = (DB.modes || []).filter(m => m.id !== id);
  save();
  toast(`🗑️ "${name}" মুছে ফেলা হয়েছে!`, 'info');
  renderModes();
  populateModeSelects();
  updateBadges();
}

// ── BIND EVENT LISTENERS ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const tSel = document.getElementById('resTournament');
  const kInput = document.getElementById('resKills');
  const pSel = document.getElementById('resPlacement');
  
  if (tSel) tSel.addEventListener('change', calcPrizePreview);
  if (kInput) kInput.addEventListener('input', calcPrizePreview);
  if (pSel) pSel.addEventListener('change', calcPrizePreview);
  
  // Ask for notification permission for admin
  if (Notification.permission === 'default') {
    try {
      Notification.requestPermission();
    } catch(e) {}
  }
  
  populateModeSelects();
  renderUsers();
  
  // Start polling
  setInterval(checkNewRequests, 3000);
});

load();

// ── SERVER SYNC: Fetch latest data from db.json (async) ──
// The server (db.json) is the SINGLE SOURCE OF TRUTH for cross-browser consistency.
// Every browser always gets the SAME data from the server on page load.
(async function initFromServer() {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && typeof serverData === 'object' && Object.keys(serverData).length > 0) {
        // Always overwrite localStorage with server data
        localStorage.setItem('ffhub_db', JSON.stringify(serverData));
        // Reload everything with fresh server data
        load();
        updateBadges();
        // Re-render the active tab
        const activeTab = document.querySelector('.atab-pane.active');
        if (activeTab) {
          const tabId = activeTab.id.replace('tab-', '');
          if (tabId === 'users') renderUsers();
          else if (tabId === 'deposits') renderDeposits();
          else if (tabId === 'withdrawals') renderWithdrawals();
          else if (tabId === 'matches') { populateModeSelects(); renderMatchList(); }
          else if (tabId === 'results') { populateMatchSelects(); renderResultHistory(); }
          else if (tabId === 'notify') populateMatchSelects();
          else if (tabId === 'modes') renderModes();
          else if (tabId === 'settings') loadSettingsToForm();
        }
      }
    }
  } catch(e) {
    // Server not available — using localStorage only
  }
})();
