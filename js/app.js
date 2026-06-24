// ═══════════════════════════════════════════════
//  FF HUB E-SPORTS — app.js
//  Futuristic Esports Tournament Dashboard Controller
// ═══════════════════════════════════════════════

// ── STATE & DATABASE ──────────────────────────────
let DB = { 
  users: {}, 
  deposits: [], 
  withdrawals: [], 
  joined: {}, 
  history: {}, 
  roomCodes: {},
  matchPlayers: {},
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

let me = null;
let pendingJoin = null;
let activePayMethod = 'bkash';
let currentFilter = 'all';

// Pagination variables
let currentPage = 1;
const rowsPerPage = 5;

// Chat simulator variables
let liveChatInterval = null;
const SIM_COMMENTS = [
  "OP game play bro! 🔥",
  "AWM headshot! Pagol level shot!",
  "Squad B will definitely win today. Go HHH!",
  "Areeh, hacker naki? Ki marle!",
  "Waiting for the next room match...",
  "Level 4 vest was destroyed immediately!",
  "Zone is closing! Run fast guys!",
  "Squad A is playing very strategic! 👍",
  "Kill secure korle na!",
  "Next Match kobe hobe admin?",
  "Rush game play please!",
  "GG! Ki match chilo eta!",
  "Joy bangla, OP headshot 💥",
  "My team joined squad battle! Wish us luck!",
  "Bkash cashin done, full tournament energy!"
];
const SIM_NAMES = [
  "Fahim_FF", "Rafi_Sniper", "Imran_Gaming", "Sajid_YT", "Nabil_Rush",
  "Anon_Player", "Joy_Headshot", "Sumon_Squad", "E-sports_Lover", "Sabbir_007",
  "Robiul_Gamer", "Azizul_F", "Hass_Boy"
];

// TOURNAMENT DATA
const TOURNAMENTS = [
  {
    id: 1,
    name: 'Survival Battle BR #1',
    map: 'Bermuda',
    mode: 'Solo',
    entryFee: 30,
    prizePool: 600,
    perKill: 10,
    placement: { 1: 300, 2: 150, 3: 50, 4: 20, 5: 10 },
    maxSlots: 48,
    filledSlots: 20,
    status: 'upcoming',
    time: '8:00 PM Today',
    image: 'https://i.pinimg.com/originals/09/25/d7/0925d70ddda13dfc7bb618b056111166.jpg'
  },
  {
    id: 2,
    name: 'CS 4 VS 4 Pro League #1',
    map: 'Purgatory',
    mode: 'Squad',
    entryFee: 100,
    prizePool: 2000,
    perKill: 20,
    placement: { 1: 1000, 2: 600, 3: 200, 4: 100, 5: 0 },
    maxSlots: 16,
    filledSlots: 12,
    status: 'live',
    time: 'LIVE NOW',
    image: 'https://i.pinimg.com/736x/8f/c9/2c/8fc92c2195f0fc98150ea13b192ea129.jpg'
  },
  {
    id: 3,
    name: 'Lone Wolf 1vs1 Showdown',
    map: 'Iron Cage',
    mode: 'Solo',
    entryFee: 20,
    prizePool: 400,
    perKill: 0,
    placement: { 1: 300, 2: 100, 3: 0, 4: 0, 5: 0 },
    maxSlots: 2,
    filledSlots: 2,
    status: 'live',
    time: 'LIVE NOW',
    image: 'https://i.pinimg.com/736x/21/df/b1/21dfb194d2105151b75bb27e7d6928e3.jpg'
  },
  {
    id: 4,
    name: 'Only Headshot Challenge #1',
    map: 'Kalahari',
    mode: 'Solo',
    entryFee: 50,
    prizePool: 1000,
    perKill: 25,
    placement: { 1: 500, 2: 300, 3: 100, 4: 50, 5: 20 },
    maxSlots: 24,
    filledSlots: 24,
    status: 'done',
    time: 'Completed',
    image: 'https://i.pinimg.com/736x/11/a6/f3/11a6f3b06db2388062de396959b8beec.jpg'
  },
  {
    id: 5,
    name: 'Squad Duo Rush',
    map: 'Alpine',
    mode: 'Duo',
    entryFee: 40,
    prizePool: 800,
    perKill: 15,
    placement: { 1: 400, 2: 250, 3: 100, 4: 50, 5: 0 },
    maxSlots: 24,
    filledSlots: 10,
    status: 'upcoming',
    time: '10:00 PM Today',
    image: 'https://i.pinimg.com/736x/8f/c9/2c/8fc92c2195f0fc98150ea13b192ea129.jpg'
  },
  {
    id: 6,
    name: 'Lone Wolf 1vs1 Midnight',
    map: 'Iron Cage',
    mode: 'Solo',
    entryFee: 50,
    prizePool: 100,
    perKill: 0,
    placement: { 1: 80, 2: 20, 3: 0, 4: 0, 5: 0 },
    maxSlots: 2,
    filledSlots: 0,
    status: 'upcoming',
    time: '11:59 PM Today',
    image: 'https://i.pinimg.com/736x/21/df/b1/21dfb194d2105151b75bb27e7d6928e3.jpg'
  },
  {
    id: 7,
    name: 'Only Headshot Masters #2',
    map: 'Bermuda Remastered',
    mode: 'Solo',
    entryFee: 20,
    prizePool: 500,
    perKill: 10,
    placement: { 1: 250, 2: 150, 3: 50, 4: 30, 5: 20 },
    maxSlots: 48,
    filledSlots: 48,
    status: 'done',
    time: 'Completed',
    image: 'https://i.pinimg.com/736x/11/a6/f3/11a6f3b06db2388062de396959b8beec.jpg'
  },
  {
    id: 8,
    name: 'BR Match Championship',
    map: 'NeXTerra',
    mode: 'Squad',
    entryFee: 150,
    prizePool: 5000,
    perKill: 30,
    placement: { 1: 3000, 2: 1000, 3: 500, 4: 300, 5: 200 },
    maxSlots: 12,
    filledSlots: 8,
    status: 'upcoming',
    time: 'Tomorrow, 08:00 PM',
    image: 'https://i.pinimg.com/originals/09/25/d7/0925d70ddda13dfc7bb618b056111166.jpg'
  }
];

// ── STORAGE ───────────────────────────────────────
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
      bgImage: '',
      payNumbers: {
        bkash: '01712-345678',
        nagad: '01812-345678',
        rocket: '01912-345678'
      }
    };
  }
  if (!DB.settings.payNumbers) {
    DB.settings.payNumbers = {
      bkash: '01712-345678',
      nagad: '01812-345678',
      rocket: '01912-345678'
    };
  }
  if (DB.settings.bgImage === undefined) DB.settings.bgImage = '';
  if (!DB.users) DB.users = {};
  if (!DB.deposits) DB.deposits = [];
  if (!DB.withdrawals) DB.withdrawals = [];
  if (!DB.joined) DB.joined = {};
  if (!DB.history) DB.history = {};
  if (!DB.roomCodes) DB.roomCodes = {};
  
  // Load default TOURNAMENTS only on the very first visit (never overwrite admin's changes)
  if (!DB.matches) {
    DB.matches = JSON.parse(JSON.stringify(TOURNAMENTS));
  }
  // If matches was wiped clean by admin, keep it empty — don't restore defaults
  if (!Array.isArray(DB.matches)) {
    DB.matches = [];
  }
  
  if(!DB.settings.banners || DB.settings.banners.length === 0) {
    DB.settings.banners = [
      { img: 'img/modes/mode-br.jpg', link: 'https://t.me/yourtelegram' },
      { img: 'img/modes/mode-cs.jpg', link: 'https://wa.me/8801712345678' }
    ];
  }
  
  // Load default modes only on first visit (never overwrite admin's changes)
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

// ═══════════════════════════════════════════════
//  BANNER CAROUSEL — Auto-Slide, Touch Drag, Dots
// ═══════════════════════════════════════════════
let bannerInterval = null;
let bannerAutoPlayTimer = null;
let currentBannerIndex = 0;
const BANNER_INTERVAL_MS = 4000;
const BANNER_PROGRESS_STEP = 50; // update progress bar every 50ms

function renderAppBanners() {
  const el = document.getElementById('heroSlider');
  if (!el) return;
  
  clearInterval(bannerInterval);
  clearInterval(bannerAutoPlayTimer);
  
  const banners = DB.settings.banners || [];
  
  if (!banners.length) {
    el.innerHTML = '';
    return;
  }

  el.innerHTML = `
    <div class="banner-carousel" id="bannerCarousel">
      <div class="banner-track" id="bannerTrack">
        ${banners.map((b, i) => `
          <a href="${b.link || '#'}" 
             target="${b.link ? '_blank' : '_self'}" 
             class="banner-slide" 
             style="background-image: url('${b.img}')" 
             draggable="false">
          </a>
        `).join('')}
      </div>
      ${banners.length > 1 ? `
        <div class="banner-dots" id="bannerDots">
          ${banners.map((_, i) => `
            <button class="banner-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>
          `).join('')}
        </div>
        <div class="banner-progress" id="bannerProgress"></div>
      ` : ''}
    </div>
  `;

  currentBannerIndex = 0;
  updateBannerSlide(false);
  
  if (banners.length > 1) {
    startBannerAutoPlay();
    initBannerSwipe();
    initBannerDotClicks();
  }
}

function updateBannerSlide(animate) {
  const track = document.getElementById('bannerTrack');
  if (!track) return;

  track.style.transition = animate
    ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    : 'none';
  
  track.style.transform = `translateX(-${currentBannerIndex * 100}%)`;
  
  // Update dots
  document.querySelectorAll('.banner-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentBannerIndex);
  });
}

function startBannerAutoPlay() {
  clearInterval(bannerInterval);
  clearInterval(bannerAutoPlayTimer);
  
  const banners = DB.settings.banners || [];
  if (banners.length <= 1) return;
  
  // Progress bar animation
  let progress = 0;
  const progressBar = document.getElementById('bannerProgress');
  if (progressBar) {
    progressBar.style.width = '0%';
    bannerAutoPlayTimer = setInterval(() => {
      progress += (BANNER_PROGRESS_STEP / BANNER_INTERVAL_MS) * 100;
      if (progressBar) progressBar.style.width = Math.min(progress, 100) + '%';
    }, BANNER_PROGRESS_STEP);
  }
  
  // Slide interval
  bannerInterval = setInterval(() => {
    const banners = DB.settings.banners || [];
    if (banners.length <= 1) return;
    currentBannerIndex = (currentBannerIndex + 1) % banners.length;
    updateBannerSlide(true);
    
    // Reset progress bar
    progress = 0;
    if (progressBar) progressBar.style.width = '0%';
  }, BANNER_INTERVAL_MS);
}

function stopBannerAutoPlay() {
  clearInterval(bannerInterval);
  clearInterval(bannerAutoPlayTimer);
  bannerInterval = null;
  bannerAutoPlayTimer = null;
}

function resumeBannerAutoPlay() {
  if (!bannerInterval) {
    startBannerAutoPlay();
  }
}

// ── TOUCH / MOUSE DRAG SUPPORT ────────────────────
const bannerDragState = {
  startX: 0,
  currentX: 0,
  isDragging: false,
  dragStarted: false
};

function initBannerSwipe() {
  const carousel = document.getElementById('bannerCarousel');
  const track = document.getElementById('bannerTrack');
  if (!carousel || !track) return;
  
  // Remove old document listeners if they exist (prevents leaks on re-render)
  if (window._bannerSwipeCleanup) {
    window._bannerSwipeCleanup();
  }
  
  // ── Touch Events ──
  const touchStartHandler = (e) => onBannerTouchStart(e);
  const touchMoveHandler = (e) => onBannerTouchMove(e);
  const touchEndHandler = () => onBannerTouchEnd();
  
  carousel.addEventListener('touchstart', touchStartHandler, { passive: true });
  carousel.addEventListener('touchmove', touchMoveHandler, { passive: true });
  carousel.addEventListener('touchend', touchEndHandler, { passive: true });
  
  // ── Mouse Events ──
  const mouseDownHandler = (e) => onBannerMouseDown(e);
  const mouseMoveHandler = (e) => onBannerMouseMove(e);
  const mouseUpHandler = () => onBannerMouseUp();
  
  carousel.addEventListener('mousedown', mouseDownHandler);
  document.addEventListener('mousemove', mouseMoveHandler);
  document.addEventListener('mouseup', mouseUpHandler);
  
  // Store cleanup function
  window._bannerSwipeCleanup = () => {
    carousel.removeEventListener('touchstart', touchStartHandler);
    carousel.removeEventListener('touchmove', touchMoveHandler);
    carousel.removeEventListener('touchend', touchEndHandler);
    carousel.removeEventListener('mousedown', mouseDownHandler);
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };
}

function getDragDelta(carousel) {
  return bannerDragState.currentX - bannerDragState.startX;
}

function getDragPercent(carousel) {
  return (getDragDelta(carousel) / carousel.offsetWidth) * 100;
}

function onBannerTouchStart(e) {
  bannerDragState.startX = e.touches[0].clientX;
  bannerDragState.currentX = e.touches[0].clientX;
  bannerDragState.isDragging = true;
  
  stopBannerAutoPlay();
  
  const track = document.getElementById('bannerTrack');
  if (track) {
    track.style.transition = 'none';
    track.classList.add('dragging');
  }
}

function onBannerTouchMove(e) {
  if (!bannerDragState.isDragging) return;
  bannerDragState.currentX = e.touches[0].clientX;
  
  const carousel = document.getElementById('bannerCarousel');
  const track = document.getElementById('bannerTrack');
  if (!carousel || !track) return;
  
  const pct = getDragPercent(carousel);
  const offset = -currentBannerIndex * 100 + pct;
  track.style.transform = `translateX(${offset}%)`;
}

function onBannerTouchEnd() {
  if (!bannerDragState.isDragging) return;
  bannerDragState.isDragging = false;
  
  const carousel = document.getElementById('bannerCarousel');
  const track = document.getElementById('bannerTrack');
  if (!carousel || !track) return;
  
  track.classList.remove('dragging');
  
  const banners = DB.settings.banners || [];
  const delta = getDragDelta(carousel);
  const threshold = carousel.offsetWidth * 0.15; // 15% threshold
  
  if (Math.abs(delta) > threshold) {
    if (delta < 0 && currentBannerIndex < banners.length - 1) {
      currentBannerIndex++;
    } else if (delta > 0 && currentBannerIndex > 0) {
      currentBannerIndex--;
    }
  }
  
  updateBannerSlide(true);
  resumeBannerAutoPlay();
}

function onBannerMouseDown(e) {
  bannerDragState.startX = e.clientX;
  bannerDragState.currentX = e.clientX;
  bannerDragState.isDragging = true;
  bannerDragState.dragStarted = false; // track if actual drag movement occurred
  
  const track = document.getElementById('bannerTrack');
  if (track) {
    track.style.transition = 'none';
  }
}

function onBannerMouseMove(e) {
  if (!bannerDragState.isDragging) return;
  
  const dx = e.clientX - bannerDragState.startX;
  
  // Only activate drag visuals after moving past 5px threshold
  if (!bannerDragState.dragStarted) {
    if (Math.abs(dx) < 5) return; // too small — still could be a click
    bannerDragState.dragStarted = true;
    
    stopBannerAutoPlay();
    
    const track = document.getElementById('bannerTrack');
    if (track) track.classList.add('dragging');
  }
  
  bannerDragState.currentX = e.clientX;
  
  const carousel = document.getElementById('bannerCarousel');
  const track = document.getElementById('bannerTrack');
  if (!carousel || !track) return;
  
  const pct = getDragPercent(carousel);
  const offset = -currentBannerIndex * 100 + pct;
  track.style.transform = `translateX(${offset}%)`;
}

function onBannerMouseUp() {
  if (!bannerDragState.isDragging) return;
  bannerDragState.isDragging = false;
  
  // If it was just a click with no actual drag, don't touch autoplay
  if (!bannerDragState.dragStarted) {
    const track = document.getElementById('bannerTrack');
    if (track) track.classList.remove('dragging');
    // Snap back to current slide and resume normal autoplay
    updateBannerSlide(true);
    return;
  }
  
  const carousel = document.getElementById('bannerCarousel');
  const track = document.getElementById('bannerTrack');
  if (!carousel || !track) return;
  
  track.classList.remove('dragging');
  
  const banners = DB.settings.banners || [];
  const delta = getDragDelta(carousel);
  const threshold = carousel.offsetWidth * 0.15;
  
  if (Math.abs(delta) > threshold) {
    if (delta < 0 && currentBannerIndex < banners.length - 1) {
      currentBannerIndex++;
    } else if (delta > 0 && currentBannerIndex > 0) {
      currentBannerIndex--;
    }
  }
  
  updateBannerSlide(true);
  resumeBannerAutoPlay();
}

// ── DOT CLICK NAVIGATION ──────────────────────────
function initBannerDotClicks() {
  document.querySelectorAll('.banner-dot').forEach(dot => {
    dot.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      if (isNaN(index) || index === currentBannerIndex) return;
      
      const banners = DB.settings.banners || [];
      if (index < 0 || index >= banners.length) return;
      
      currentBannerIndex = index;
      updateBannerSlide(true);
      
      // Reset auto-play timer
      stopBannerAutoPlay();
      startBannerAutoPlay();
    });
  });
}

// ── TOAST ─────────────────────────────────────────
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'show ' + type;
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.className = ''; }, 3000);
}

// ── SIDEBAR DRAWER TOGGLE ─────────────────────────
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sb && overlay) {
    sb.classList.toggle('open');
    overlay.classList.toggle('active');
  }
}

// ── MODALS ────────────────────────────────────────
function showModal(id) { 
  const el = document.getElementById(id);
  if (el) el.classList.add('open'); 
}
function closeModal(id) { 
  const el = document.getElementById(id);
  if (el) el.classList.remove('open'); 
}

// ── NAVIGATION ROUTING ────────────────────────────
function goMenu(name, el) {
  // Hide all sections
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  
  // Show target section
  const target = document.getElementById('sec' + name);
  if (target) target.classList.add('active');
  
  // Remove active from all navigation links
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.bottom-nav a').forEach(a => a.classList.remove('active'));
  
  // Set active class on corresponding sidebar link
  const sideLink = document.getElementById('menu-' + name.toLowerCase());
  if (sideLink) sideLink.classList.add('active');
  
  // Set active class on corresponding bottom navigation link
  const bottomLink = document.getElementById('nav-' + name.toLowerCase());
  if (bottomLink) bottomLink.classList.add('active');
  
  // Close sidebar overlay if open (mobile view helper)
  const sb = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sb && sb.classList.contains('open')) {
    sb.classList.remove('open');
    overlay.classList.remove('active');
  }
  
  // Trigger section specific renders
  if (name === 'Home') { currentFilter = 'all'; renderModeGrid(); renderTournaments(); }
  if (name === 'Live') initLiveStream();
  if (name === 'Account') { currentPage = 1; renderProfile(); }
  if (name === 'MyMatch') renderMyMatches();
  if (name === 'AddMoney') openAddMoney();
  if (name === 'Withdraw') openWithdraw();
  if (name === 'WithdrawList') renderWithdrawList();
  
  return false;
}

// ── REGISTER / LOGIN ──────────────────────────────
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tabLogin').style.borderBottomColor = 'transparent';
  document.getElementById('tabLogin').style.color = 'var(--muted)';
  document.getElementById('tabReg').style.borderBottomColor = 'transparent';
  document.getElementById('tabReg').style.color = 'var(--muted)';
  
  document.getElementById('formLogin').style.display = 'none';
  document.getElementById('formReg').style.display = 'none';

  if (tab === 'login') {
    document.getElementById('tabLogin').classList.add('active');
    document.getElementById('tabLogin').style.borderBottomColor = 'var(--secondary)';
    document.getElementById('tabLogin').style.color = 'var(--secondary)';
    document.getElementById('formLogin').style.display = 'block';
  } else {
    document.getElementById('tabReg').classList.add('active');
    document.getElementById('tabReg').style.borderBottomColor = 'var(--secondary)';
    document.getElementById('tabReg').style.color = 'var(--secondary)';
    document.getElementById('formReg').style.display = 'block';
  }
}

function doLogin() {
  const phone = v('loginPhone').trim();
  const pass = v('loginPass').trim();

  if (!phone || !pass) {
    toast('মোবাইল নম্বর ও পাসওয়ার্ড দিন!', 'error'); return;
  }
  
  load();
  if (!DB.users[phone]) {
    toast('এই নম্বরে কোনো একাউন্ট নেই! আগে রেজিস্ট্রেশন করুন।', 'error'); return;
  }
  if (DB.users[phone].pass !== pass) {
    toast('পাসওয়ার্ড ভুল!', 'error'); return;
  }

  me = DB.users[phone];
  // Fill support PIN and date if missing
  if (!me.supportPin) me.supportPin = Math.floor(100000 + Math.random() * 900000).toString();
  if (!me.joinedDate) me.joinedDate = 'Joined: ' + new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  if (me.earnBalance === undefined) me.earnBalance = 0;
  
  DB.users[phone] = me;
  saveSession(phone); // ✅ Session save করা হলো
  save();
  toast('স্বাগতম, ' + me.name + '! ✅', 'success');
  afterLogin();
}

function doRegister() {
  const name   = v('regName').trim();
  const phone  = v('regPhone').trim();
  const uid    = v('regFFUid').trim();
  const ffname = v('regFFName').trim();
  const pass   = v('regPass').trim();

  if (!name || !phone || !uid || !ffname || !pass) {
    toast('সব তথ্য পূরণ করুন!', 'error'); return;
  }
  if (!/^01[3-9]\d{8}$/.test(phone)) {
    toast('সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)', 'error'); return;
  }
  if (pass.length < 4) {
    toast('পাসওয়ার্ড কমপক্ষে ৪ সংখ্যার হতে হবে!', 'error'); return;
  }

  load();
  if (DB.users[phone]) {
    toast('এই নম্বরটি ইতিমধ্যে ব্যবহৃত হয়েছে! লগইন করুন।', 'error'); 
    switchAuthTab('login');
    return;
  }

  // Create new account
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  const joined = 'Joined: ' + new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  me = { 
    name, phone, uid, ffname, pass, 
    balance: 0, 
    earnBalance: 0, 
    totalPrize: 0, 
    totalKills: 0, 
    totalMatches: 0,
    supportPin: pin,
    joinedDate: joined
  };
  
  DB.users[phone] = me;
  if (!DB.history[phone]) DB.history[phone] = [];
  saveSession(phone); // ✅ Session save করা হলো
  save();
  toast('একাউন্ট তৈরি হয়েছে! 🎉', 'success');
  askNotification();
  afterLogin();
}

function applyBgImage() {
  const bgUrl = DB.settings && DB.settings.bgImage ? DB.settings.bgImage : '';
  const body = document.body;
  if (bgUrl) {
    body.style.backgroundImage = `url('${bgUrl}')`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center center';
    body.style.backgroundRepeat = 'no-repeat';
    body.style.backgroundAttachment = 'fixed';
    body.classList.add('has-custom-bg');
  } else {
    body.style.backgroundImage = '';
    body.style.backgroundSize = '';
    body.style.backgroundPosition = '';
    body.style.backgroundRepeat = '';
    body.style.backgroundAttachment = '';
    body.classList.remove('has-custom-bg');
  }
}

function afterLogin() {
  load();
  me = DB.users[me.phone];
  
  // Show app features
  document.getElementById('walletBtn').style.display = 'flex';
  document.getElementById('bottomNav').style.display = 'flex';
  document.getElementById('sidebarProfile').style.display = 'flex';
  
  // Set details
  document.getElementById('sbName').textContent = me.name;
  document.getElementById('sbEmail').textContent = me.phone;
  
  applyBgImage();
  renderAppBanners();
  goMenu('Home');
  updateWallet();
}

function doLogout() {
  clearSession(); // ✅ Session clear করা হলো
  me = null;
  document.getElementById('walletBtn').style.display = 'none';
  document.getElementById('bottomNav').style.display = 'none';
  document.getElementById('sidebarProfile').style.display = 'none';
  
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById('secAuth').classList.add('active');
  
  // Remove all active states on sidebar/bottom-nav
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.bottom-nav a').forEach(a => a.classList.remove('active'));
  
  // Clear chat simulators
  clearInterval(liveChatInterval);
  
  toast('লগআউট হয়েছে', 'info');
}

function v(id) { 
  const el = document.getElementById(id);
  return el ? el.value : ''; 
}

// ── WALLET UPDATES ────────────────────────────────
function updateWallet() {
  if (!me) return;
  load();
  me = DB.users[me.phone];
  
  const bal = me.balance || 0;
  const earn = me.earnBalance || 0;

  // Header display
  set('walletDisplay', '৳ ' + bal);
  
  // Home statistics
  set('statWallet', '৳ ' + bal);
  set('statPrize', '৳ ' + earn);
  
  // Account section balances
  set('p2Wallet', '৳ ' + bal);
  set('p2Prize', '৳ ' + earn);
  set('p2SupportPin', me.supportPin || '------');
  
  // Withdraw balances
  set('withBalDisplay', '৳ ' + earn);
  set('transBalDisplay', '৳ ' + earn);
}

let matchStatusFilter = 'ongoing';

function openMatchList(category) {
  currentFilter = category;
  
  let title = 'All Matches';
  if (category === '1vs1') title = '1 vs 1 Battle';
  if (category === 'headshot') title = 'Only Headshot';
  if (category === 'squad') title = 'Squad / Duo';
  const titleEl = document.getElementById('matchListTitle');
  if (titleEl) titleEl.textContent = title;
  
  filterListTab('ongoing');
  goMenu('MatchList');
}

function filterListTab(tab) {
  matchStatusFilter = tab;
  
  const tabOngoing = document.getElementById('mlTabOngoing');
  const tabResults = document.getElementById('mlTabResults');
  
  if (tabOngoing && tabResults) {
    tabOngoing.classList.remove('active');
    tabOngoing.style.borderBottomColor = 'transparent';
    tabOngoing.style.color = 'var(--muted)';
    
    tabResults.classList.remove('active');
    tabResults.style.borderBottomColor = 'transparent';
    tabResults.style.color = 'var(--muted)';
    
    if (tab === 'ongoing') {
      tabOngoing.classList.add('active');
      tabOngoing.style.borderBottomColor = 'var(--secondary)';
      tabOngoing.style.color = 'var(--text)';
    } else {
      tabResults.classList.add('active');
      tabResults.style.borderBottomColor = 'var(--secondary)';
      tabResults.style.color = 'var(--text)';
    }
  }
  
  renderTournaments();
}

// ── MODE GRID (dynamic from DB.modes) ─────────────
function renderModeGrid() {
  load();
  const modes = DB.modes || [];
  const el = document.getElementById('modeGrid');
  if (!el) return;

  el.innerHTML = modes.map(m => {
    const isActive = currentFilter === m.tag;
    return `
      <div class="mode-box ${isActive ? 'active' : ''}" onclick="openMatchList('${m.tag}')"
        style="position: relative; border-radius: 14px; overflow: hidden;
        border: 2px solid ${isActive ? 'var(--secondary)' : 'rgba(255,255,255,0.1)'};
        cursor: pointer; aspect-ratio: 1;
        background: linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.05)), url('${m.image}') center/cover;
        transition: border-color 0.3s, transform 0.2s;">
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; text-align: center;">
          <div style="color:#fff; font-weight:900; font-size:1.1rem; text-shadow:0 2px 10px #000;
            letter-spacing:1px; text-transform:uppercase;">${m.name}</div>
        </div>
      </div>`;
  }).join('');
}

function renderTournaments() {
  load();
  const joined = DB.joined[me.phone] || [];
  const el = document.getElementById('tournamentList');
  if (!el) return;

  const filtered = (DB.matches || []).filter(t => {
    // Mode filter — use category field (set by admin) or mode field
    if (currentFilter !== 'all') {
      // Check if match category matches the selected mode tag
      if (t.category && t.category !== currentFilter) return false;
      // Fallback for legacy matches without category
      if (!t.category) {
        if (currentFilter === '1vs1' && !(t.mode === 'Solo' && (t.name.toLowerCase().includes('1vs1') || t.name.toLowerCase().includes('1v1')))) return false;
        if (currentFilter === 'headshot' && !t.name.toLowerCase().includes('headshot')) return false;
        if (currentFilter === 'squad' && !(t.mode === 'Squad' || t.mode === 'Duo')) return false;
        if (currentFilter === 'survival' && !(t.name.toLowerCase().includes('br') || t.name.toLowerCase().includes('battle'))) return false;
      }
    }
    
    // Status filter
    if (matchStatusFilter === 'ongoing') {
      if (t.status === 'done') return false;
    } else if (matchStatusFilter === 'results') {
      if (t.status !== 'done') return false;
    }
    
    return true;
  });

  if (!filtered.length) {
    el.innerHTML = '<div class="empty" style="padding: 40px 20px;"><i class="fa-solid fa-gamepad" style="font-size: 3rem; color: var(--muted); opacity: 0.5; margin-bottom: 10px; display: block;"></i> <div style="font-size: 1.1rem; color: var(--muted); font-weight: 700;">কোন ম্যাচ পাওয়া যায়নি</div></div>';
    return;
  }

  el.innerHTML = filtered.map(t => {
    const isJoined = joined.includes(t.id);
    const isFull   = t.filledSlots >= t.maxSlots;
    const pct = Math.min(100, Math.floor((t.filledSlots / t.maxSlots) * 100));
    const modeClass = t.mode === 'Squad' ? 'mode-squad' : t.mode === 'Duo' ? 'mode-duo' : 'mode-solo';
    const isLive = t.status === 'live';

    const statusOrb = isLive
      ? `<div class="mc-status-orb orb-live"><div class="mc-orb"></div> LIVE</div>`
      : t.status === 'done'
      ? `<div class="mc-status-orb orb-done"><div class="mc-orb"></div> ENDED</div>`
      : `<div class="mc-status-orb orb-upcoming"><div class="mc-orb"></div> SOON</div>`;

    let joinBtn = '';
    if (isJoined) {
      joinBtn = `<button class="mc-btn-join joined" disabled>✅ জয়েন হয়েছে</button>`;
    } else if (isFull) {
      joinBtn = `<button class="mc-btn-join full" disabled>সিট পূর্ণ</button>`;
    } else {
      joinBtn = `<button class="mc-btn-join" onclick="event.stopPropagation(); openJoin(${t.id})">⚔ Join · ৳${t.entryFee}</button>`;
    }

    return `
    <div class="match-card-v2 ${isLive ? 'is-live' : ''}" onclick="openMatchDetail(${t.id})">
      <div class="mc-banner" style="background: linear-gradient(135deg, rgba(13,14,33,0.9), rgba(13,14,33,0.4)), url('${t.image || 'img/modes/mode-all.png'}') center/cover;">
        <div class="mc-scan"></div>
        <div class="mc-map-watermark">${t.map}</div>
        <div class="mc-mode-tag ${modeClass}">${t.mode}</div>
        ${statusOrb}
        <div class="mc-entry-tag">ENTRY: ৳${t.entryFee}</div>
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Free_Fire_logo.svg/320px-Free_Fire_logo.svg.png" style="height:18px; object-fit:contain; filter: drop-shadow(0 0 5px rgba(255,183,0,0.5));" alt="FF">
            <div class="mc-title">${t.name}</div>
          </div>
          <div class="mc-map-sub">🗺 ${t.map} &nbsp;·&nbsp; 🕐 ${t.time}</div>
        </div>
      </div>
      <div class="mc-body">
        <div class="mc-prize-strip">
          <div>
            <div class="mc-prize-label">Total Prize Pool</div>
            <div class="mc-prize-val">৳${t.prizePool}</div>
          </div>
          <div class="mc-kill-badge">
            <div class="kval">৳${t.perKill}</div>
            <div class="klbl">Per Kill</div>
          </div>
        </div>

        <div class="mc-stats-row">
          <div class="mc-stat">
            <span class="s-val">🥇 ৳${t.placement[1]}</span>
            <span class="s-lbl">1st Place</span>
          </div>
          <div class="mc-stat">
            <span class="s-val">🥈 ৳${t.placement[2]}</span>
            <span class="s-lbl">2nd Place</span>
          </div>
          <div class="mc-stat">
            <span class="s-val">🥉 ৳${t.placement[3]}</span>
            <span class="s-lbl">3rd Place</span>
          </div>
        </div>

        <div class="mc-slot-row">
          <div class="mc-slot-header">
            <span>Players Joined</span>
            <strong>${t.filledSlots}/${t.maxSlots} slots · ${pct}% full</strong>
          </div>
          <div class="mc-slot-track">
            <div class="mc-slot-fill" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="mc-action-row">
          ${joinBtn}
          <button class="mc-btn-detail" onclick="event.stopPropagation(); openMatchDetail(${t.id})" title="Match Rules & Players">
            <i class="fa-solid fa-circle-info"></i>
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── MATCH DETAIL MODAL ────────────────────────────
function openMatchDetail(tid) {
  load();
  const t = (DB.matches || []).find(x => x.id === tid);
  if (!t) return;

  const joined = (DB.joined[me.phone] || []).includes(tid);
  const players = (DB.matchPlayers && DB.matchPlayers[tid]) || [];

  // Header
  document.getElementById('mdsTitle').textContent = t.name;
  document.getElementById('mdsMeta').innerHTML = `
    <span class="mds-tag">🗺 ${t.map}</span>
    <span class="mds-tag">👥 ${t.mode}</span>
    <span class="mds-tag">🕐 ${t.time}</span>
    <span class="mds-tag" style="color:var(--gold);border-color:rgba(255,183,0,0.3);">🏆 ৳${t.prizePool}</span>`;

  // ── Use per-mode custom rules from Settings (if set), or fall back to auto-generated rules ──
  const modeRules = DB.settings && DB.settings.modeRules ? DB.settings.modeRules : {};
  // Try category first, then mode field, then 'default'
  const rulesKey = t.category || t.mode || 'default';
  let customRulesText = modeRules[rulesKey] || modeRules['default'] || '';
  
  let rulesHtml = '';
  if (customRulesText.trim()) {
    // Custom rules from admin settings — split by newlines for bullet display
    const ruleLines = customRulesText.replace(/\r/g, '').split('\n').filter(line => line.trim());
    rulesHtml = ruleLines.map((r, i) => `
      <div class="rule-item">
        <div class="rule-num">${i+1}</div>
        <div class="rule-text">${r}</div>
      </div>
    `).join('');
  } else {
    // Fallback to auto-generated default rules
    const defaultRules = [
      `এই ম্যাচে Entry Fee হলো <strong style="color:var(--secondary)">৳${t.entryFee}</strong>। জয়েন করার আগে পর্যাপ্ত ডিপোজিট ব্যালেন্স নিশ্চিত করুন।`,
      `প্রতিটি kill এর জন্য <strong style="color:var(--green)">৳${t.perKill}</strong> উইনিং ব্যালেন্সে যোগ হবে।`,
      `ম্যাচের নির্ধারিত সময়ের <strong>১০ মিনিট আগে</strong> Room ID ও Password "My Match" পেজে দেওয়া হবে।`,
      `Room এ প্রবেশের সময় অবশ্যই আপনার <strong>রেজিস্টার করা Free Fire Name</strong> ব্যবহার করতে হবে।`,
      `হ্যাকিং, চিটিং বা নিয়ম ভঙ্গ করলে তাৎক্ষণিকভাবে <strong style="color:var(--primary)">ID ব্লক</strong> ও ব্যালেন্স বাজেয়াপ্ত হবে।`,
      `Result প্রকাশের ২৪ ঘণ্টার মধ্যে prize <strong>Winnings Balance</strong> এ যোগ করা হবে।`,
      `ম্যাচ শুরু হওয়ার পরে কোনো কারণেই <strong>Entry Fee ফেরত</strong> দেওয়া হবে না।`,
      `যেকোনো অভিযোগের জন্য Support PIN সহ <strong>Telegram/WhatsApp</strong> এ যোগাযোগ করুন।`
    ];
    rulesHtml = defaultRules.map((r, i) => `
      <div class="rule-item">
        <div class="rule-num">${i+1}</div>
        <div class="rule-text">${r}</div>
      </div>`).join('');
  }

  let roomCodeSection = '';
  if (joined) {
    const rc = DB.roomCodes && DB.roomCodes[t.id];
    if (rc) {
      roomCodeSection = `
        <div style="margin-top:16px;padding:14px;background:rgba(0,240,255,0.04);border:2px solid var(--secondary);border-radius:12px;box-shadow:0 0 20px rgba(0,240,255,0.15);">
          <div style="color:var(--secondary);font-weight:800;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;font-size:0.85rem;">
            <i class="fa-solid fa-key"></i> 🔑 ROOM DETAILS — Your Match Room
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.3);padding:10px 14px;border-radius:8px;">
              <span style="color:var(--muted);font-size:0.85rem;">🆔 Room ID</span>
              <span style="color:#fff;font-weight:700;font-size:1.1rem;letter-spacing:2px;font-family:monospace;">${rc.roomId}</span>
              <button class="copy-btn" style="padding:4px 10px;font-size:0.7rem;" onclick="navigator.clipboard.writeText('${rc.roomId}').then(()=>toast('Room ID Copied!','success'))">Copy</button>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.3);padding:10px 14px;border-radius:8px;">
              <span style="color:var(--muted);font-size:0.85rem;">🔒 Password</span>
              <span style="color:var(--green);font-weight:700;font-size:1.1rem;letter-spacing:2px;font-family:monospace;">${rc.password}</span>
              <button class="copy-btn" style="padding:4px 10px;font-size:0.7rem;" onclick="navigator.clipboard.writeText('${rc.password}').then(()=>toast('Password Copied!','success'))">Copy</button>
            </div>
          </div>
        </div>`;
    } else {
      roomCodeSection = `
        <div style="margin-top:16px;padding:12px;background:rgba(255,255,255,0.02);border:1px dashed var(--border);border-radius:8px;font-size:0.85rem;color:var(--muted);text-align:center;">
          ⏳ রুম আইডি এবং পাসওয়ার্ড ম্যাচের ১০ মিনিট আগে "My Match" পেজে পাবলিশ করা হবে।
        </div>`;
    }
  }

  document.getElementById('mdsRulesContent').innerHTML = `
    <div style="margin-bottom:14px;">
      ${rulesHtml}
    </div>
    <div style="margin-top:16px;">
      <div style="font-size:0.75rem;color:var(--muted);font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;">🏆 Prize Distribution</div>
      <div class="prize-breakdown-grid">
        ${[1,2,3,4,5].map(p => `
          <div class="prize-row">
            <span class="prize-place">${p === 1 ? '🥇' : p === 2 ? '🥈' : p === 3 ? '🥉' : '🎖'} #${p} Place</span>
            <span class="prize-amount">৳${t.placement[p]}</span>
          </div>`).join('')}
        <div class="prize-row" style="border-color:rgba(0,255,136,0.15); background:rgba(0,255,136,0.04);">
          <span class="prize-place">💀 Per Kill</span>
          <span class="prize-amount" style="color:var(--green);">৳${t.perKill}</span>
        </div>
      </div>
    </div>
    ${roomCodeSection}`;

  // Players tab content
  const total = t.maxSlots;
  if (!joined) {
    document.getElementById('mdsPlayersContent').innerHTML = `
      <div style="text-align:center;padding:30px 20px;">
        <i class="fa-solid fa-lock" style="font-size:2.5rem;color:var(--muted);opacity:0.4;margin-bottom:14px;display:block;"></i>
        <div style="font-weight:700;color:var(--muted);margin-bottom:6px;">Players list দেখতে Join করুন</div>
        <div style="font-size:0.82rem;color:rgba(255,255,255,0.3);">এই ম্যাচে Join করলে সকল players এর FF Name দেখতে পাবেন।</div>
      </div>`;
  } else if (!players.length) {
    document.getElementById('mdsPlayersContent').innerHTML = `
      <div style="text-align:center;padding:30px 20px;color:var(--muted);">এখনো কোনো player join করেননি।</div>`;
  } else {
    document.getElementById('mdsPlayersContent').innerHTML = `
      <div style="margin-bottom:6px;font-size:0.72rem;color:var(--muted);font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
        ${players.length} / ${total} Players Joined
      </div>
      ${players.map((p, i) => {
        const isMe2 = p.phone === me.phone;
        return `
          <div class="player-item">
            <div class="player-num ${isMe2 ? 'is-me' : ''}">${i+1}</div>
            <div class="player-name">
              ${p.ffname}
              ${isMe2 ? '<span class="you-tag">YOU</span>' : ''}
            </div>
          </div>`;
      }).join('')}
      <div class="slot-remaining-bar">
        <i class="fa-solid fa-users" style="margin-right:6px;"></i>
        ${total - players.length} slot${total - players.length !== 1 ? 's' : ''} remaining — Invite friends!
      </div>`;
  }

  // Reset to rules tab and open
  switchMdsTab('rules');
  document.getElementById('matchDetailModal').classList.add('open');
}

function closeMatchDetail(e) {
  if (e && e.target !== document.getElementById('matchDetailModal')) return;
  document.getElementById('matchDetailModal').classList.remove('open');
}

function switchMdsTab(tab) {
  document.querySelectorAll('.mds-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.mds-pane').forEach(p => p.classList.remove('active'));
  if (tab === 'rules') {
    document.getElementById('mdsTabRules').classList.add('active');
    document.getElementById('mdsPaneRules').classList.add('active');
  } else {
    document.getElementById('mdsTabPlayers').classList.add('active');
    document.getElementById('mdsPanePlayers').classList.add('active');
  }
}

// ── TOURNAMENT JOIN CONFIRM ───────────────────────
function openJoin(tid) {
  const t = (DB.matches || []).find(x => x.id === tid);
  if (!t) return;
  pendingJoin = t;
  
  const el = document.getElementById('joinInfo');
  if (el) {
    el.innerHTML = `
      <div style="font-size:0.95rem;line-height:2;">
        <div style="color:#fff;font-weight:700;font-size:1.1rem;margin-bottom:4px;">⚔️ ${t.name}</div>
        <div>🗺️ Map: <strong>${t.map}</strong> &nbsp;|&nbsp; 👥 Mode: <strong>${t.mode}</strong></div>
        <div style="margin-top:6px;border-top:1px solid rgba(255,255,255,0.05);padding-top:6px;">
          💵 Entry Fee: <span style="color:var(--secondary);font-weight:700;">৳${t.entryFee}</span> (ডিপোজিট ব্যালেন্স থেকে কাটা হবে)
        </div>
        <div>🏆 Total Prize Pool: <span style="color:var(--gold);font-weight:700;">৳${t.prizePool}</span></div>
      </div>`;
  }
  showModal('joinModal');
}

function confirmJoin() {
  if (!pendingJoin) return;
  load(); me = DB.users[me.phone];
  const t = pendingJoin;

  if (me.balance < t.entryFee) {
    toast('পর্যাপ্ত ডিপোজিট ব্যালেন্স নেই! আগে টাকা অ্যাড করুন। ❌', 'error');
    closeModal('joinModal');
    goMenu('AddMoney');
    return;
  }

  me.balance -= t.entryFee;
  me.totalMatches = (me.totalMatches || 0) + 1;
  DB.users[me.phone] = me;
  
  if (!DB.joined[me.phone]) DB.joined[me.phone] = [];
  DB.joined[me.phone].push(t.id);

  // Save FF Name to match players list
  if (!DB.matchPlayers) DB.matchPlayers = {};
  if (!DB.matchPlayers[t.id]) DB.matchPlayers[t.id] = [];
  const alreadyIn = DB.matchPlayers[t.id].some(p => p.phone === me.phone);
  if (!alreadyIn) {
    DB.matchPlayers[t.id].push({ ffname: me.ffname, phone: me.phone });
  }

  addHistory(me.phone, 'join', `🎮 Joined Match #${t.id} (${t.name})`, -t.entryFee, 'done');
  save();

  toast('টুর্নামেন্টে জয়েন সফল হয়েছে! রুম আইডি নোটিফিকেশনে পাবেন 🎮', 'success');
  closeModal('joinModal');
  updateWallet();
  renderTournaments();
}

// ── SHOW PLAYERS IN A MATCH ───────────────────────
function showPlayers(tid) {
  load();
  const t = (DB.matches || []).find(x => x.id === tid);
  if (!t) return;
  const players = (DB.matchPlayers && DB.matchPlayers[tid]) || [];
  const total = t.maxSlots;

  let listHtml = '';
  if (!players.length) {
    listHtml = '<div style="color:var(--muted);text-align:center;padding:16px 0;">এখনো কেউ join করেনি</div>';
  } else {
    listHtml = players.map((p, i) => {
      const isMe = me && p.phone === me.phone;
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
          <div style="width:28px;height:28px;border-radius:50%;background:${isMe ? 'var(--primary)' : 'var(--secondary)'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;color:#000;flex-shrink:0;">${i+1}</div>
          <div style="font-weight:700;color:${isMe ? 'var(--primary)' : '#fff'};font-size:0.9rem;">${p.ffname}${isMe ? ' <span style="font-size:0.7rem;color:var(--muted);">(You)</span>' : ''}</div>
        </div>`;
    }).join('');
  }

  // Show in a simple modal-like overlay using toast area replacement
  const existing = document.getElementById('playersPanel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'playersPanel';
  panel.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:var(--card);border-top:2px solid var(--secondary);border-radius:20px 20px 0 0;padding:20px 18px 30px;box-shadow:0 -10px 40px rgba(0,240,255,0.15);max-height:70vh;overflow-y:auto;';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <div style="font-weight:800;font-size:1rem;color:var(--secondary);">👥 ${t.name} — Players (${players.length}/${total})</div>
      <button onclick="document.getElementById('playersPanel').remove()" style="background:rgba(255,255,255,0.07);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:1.1rem;">✕</button>
    </div>
    ${listHtml}
    <div style="margin-top:14px;text-align:center;font-size:0.8rem;color:var(--muted);">Empty slots: ${total - players.length} remaining</div>
  `;
  document.body.appendChild(panel);
}

// ── MY MATCHES VIEW ───────────────────────────────
function renderMyMatches() {
  load();
  const joinedIds = DB.joined[me.phone] || [];
  const el = document.getElementById('myMatchesList');
  if (!el) return;

  if (!joinedIds.length) {
    el.innerHTML = '<div class="empty"><i class="fa-solid fa-trophy"></i> আপনি কোন ম্যাচে অংশগ্রহণ করেননি এখনো</div>';
    return;
  }

  const userMatches = (DB.matches || []).filter(t => joinedIds.includes(t.id));

  el.innerHTML = userMatches.map(t => {
    const isLive = t.status === 'live';
    const isDone = t.status === 'done';
    
    let statusBadge = `<span class="t-badge badge-upcoming">⏳ আসছে</span>`;
    if (isLive) statusBadge = `<span class="t-badge badge-live">🔴 LIVE</span>`;
    if (isDone) statusBadge = `<span class="t-badge badge-done">✓ শেষ</span>`;
    
    const roomCode = DB.roomCodes && DB.roomCodes[t.id];
    
    // Players list for My Match
    const matchPlayersList = (DB.matchPlayers && DB.matchPlayers[t.id]) || [];
    let playersHtml = '';
    if (matchPlayersList.length > 0) {
      playersHtml = `
        <div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">
          <div style="font-weight:700;color:var(--secondary);font-size:0.82rem;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">👥 Joined Players (${matchPlayersList.length}/${t.maxSlots})</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${matchPlayersList.map((p, i) => {
              const isMe2 = me && p.phone === me.phone;
              return `<span style="background:${isMe2 ? 'rgba(255,0,85,0.15)' : 'rgba(0,240,255,0.08)'};border:1px solid ${isMe2 ? 'var(--primary)' : 'rgba(0,240,255,0.25)'};padding:3px 10px;border-radius:20px;font-size:0.78rem;color:${isMe2 ? 'var(--primary)' : 'var(--secondary)'};font-weight:600;">${i+1}. ${p.ffname}${isMe2 ? ' ★' : ''}</span>`;
            }).join('')}
          </div>
        </div>`;
    }

    let roomCodeHtml = `
      <div style="margin-top:10px;padding:12px;background:rgba(255,255,255,0.02);border:1px dashed var(--border);border-radius:8px;font-size:0.85rem;color:var(--muted);text-align:center;">
        রুম আইডি এবং পাসওয়ার্ড ম্যাচের ১০ মিনিট আগে এখানে শো হবে।
      </div>`;
      
    if (roomCode) {
      roomCodeHtml = `
        <div style="margin-top:10px;padding:12px;background:rgba(0,240,255,0.04);border:1px solid var(--secondary);border-radius:8px;font-size:0.88rem;box-shadow:0 0 10px rgba(0,240,255,0.15);">
          <div style="color:var(--secondary);font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;"><i class="fa-solid fa-key"></i> ROOM DETAILS:</div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;align-items:center;">
            <span>Room ID: <strong style="color:#fff;">${roomCode.roomId}</strong></span>
            <button class="copy-btn" style="padding:2px 8px;font-size:0.7rem;" onclick="navigator.clipboard.writeText('${roomCode.roomId}').then(()=>toast('Room ID Copied!','success'))">Copy</button>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span>Password: <strong style="color:#fff;">${roomCode.password}</strong></span>
            <button class="copy-btn" style="padding:2px 8px;font-size:0.7rem;" onclick="navigator.clipboard.writeText('${roomCode.password}').then(()=>toast('Password Copied!','success'))">Copy</button>
          </div>
        </div>`;
    }
    
    return `
    <div class="t-card" style="margin-bottom:12px;">
      <div class="t-banner">
        <div class="t-name">⚔️ ${t.name}</div>
        ${statusBadge}
      </div>
      <div class="t-body" style="padding:12px 14px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.82rem;color:var(--muted);margin-bottom:8px;">
          <div>🗺️ Map: <span style="color:#fff">${t.map}</span></div>
          <div>👥 Mode: <span style="color:#fff">${t.mode}</span></div>
          <div>🕐 সময়: <span style="color:#fff">${t.time}</span></div>
          <div>🏆 প্রাইজ পুল: <span style="color:var(--gold)">৳${t.prizePool}</span></div>
        </div>
        ${playersHtml}
        ${roomCodeHtml}
      </div>
    </div>`;
  }).join('');
}

// ── ADD MONEY (DEPOSIT) ───────────────────────────
function openAddMoney() {
  // Set the tutorial video if available
  const container = document.getElementById('tutorialVideoContainer');
  const tutorialLink = DB.settings.tutorialLink;
  if (container) {
    if (tutorialLink && tutorialLink.trim() !== '') {
      container.innerHTML = `<iframe src="${tutorialLink}" allowfullscreen></iframe>`;
    } else {
      container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:0.85rem;">
          No tutorial video available.
        </div>`;
    }
  }
  
  selectPayMethod(activePayMethod, document.querySelector(`.pay-btn.${activePayMethod}`));
}

function selectPayMethod(m, el) {
  activePayMethod = m;
  document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('selected'));
  if (el) el.classList.add('selected');
  
  const num = DB.settings.payNumbers[m] || '01700-000000';
  const labels = { bkash: 'bKash Personal:', nagad: 'Nagad Personal:', rocket: 'Rocket Personal:' };
  
  set('payLabel', labels[m] || 'Payment Number:');
  set('payNumber', num);
}

function copyNumber() {
  const activeNum = DB.settings.payNumbers[activePayMethod];
  navigator.clipboard.writeText(activeNum)
    .then(() => toast('পেমেন্ট নম্বর কপি হয়েছে! 📋', 'success'))
    .catch(() => toast(activeNum, 'info'));
}

function submitDeposit() {
  const amount = parseInt(v('depAmount'));
  const trx    = v('depTrx').trim();

  if (!amount || amount < 50) { 
    toast('কমপক্ষে ৳৫০ যোগ করতে হবে!', 'error'); return; 
  }
  if (!trx) { 
    toast('Transaction ID (TrxID) দিতে হবে!', 'error'); return; 
  }

  load();
  const req = {
    id: Date.now(), phone: me.phone, name: me.name, uid: me.uid,
    ffname: me.ffname, amount, method: activePayMethod, trx, status: 'pending',
    time: new Date().toLocaleString('bn-BD')
  };
  DB.deposits.push(req);

  addHistory(me.phone, 'deposit', `💰 Deposit Pending (${activePayMethod.toUpperCase()})`, amount, 'pending');
  save();

  toast('টাকা অ্যাড করার রিকোয়েস্ট পাঠানো হয়েছে! অ্যাডমিন Approve করলেই যোগ হবে ✅', 'success');
  document.getElementById('depAmount').value = '';
  document.getElementById('depTrx').value = '';
  goMenu('Account');
}

// ── WITHDRAW ──────────────────────────────────────
function openWithdraw() {
  if (!me) return;
  load(); me = DB.users[me.phone];
  
  const earn = me.earnBalance || 0;
  set('withBalDisplay', '৳ ' + earn);
  set('transBalDisplay', '৳ ' + earn);
}

function submitWithdraw() {
  const amount = parseInt(v('withAmt'));
  const method = document.getElementById('withMethod').value;
  const acc    = v('withAcc').trim();

  if (!amount || amount < 100) { 
    toast('উইথড্র করার নূন্যতম পরিমাণ ৳১০০!', 'error'); return; 
  }
  if (!acc) { 
    toast('পেমেন্ট রিসিভ নম্বর দিতে হবে!', 'error'); return; 
  }

  load(); me = DB.users[me.phone];
  const earn = me.earnBalance || 0;
  
  if (amount > earn) { 
    toast('পর্যাপ্ত উইনিং ব্যালেন্স নেই!', 'error'); return; 
  }

  me.earnBalance = earn - amount;
  DB.users[me.phone] = me;

  const req = {
    id: Date.now(), phone: me.phone, name: me.name, uid: me.uid,
    ffname: me.ffname, amount, method, acc, status: 'pending',
    time: new Date().toLocaleString('bn-BD')
  };
  DB.withdrawals.push(req);
  addHistory(me.phone, 'withdraw', `💸 Withdraw Request (${method.toUpperCase()})`, -amount, 'pending');
  save();

  toast('উইথড্র রিকোয়েস্ট পাঠানো হয়েছে! ১২ ঘণ্টার মধ্যে পেমেন্ট পাবেন ✅', 'success');
  document.getElementById('withAmt').value = '';
  document.getElementById('withAcc').value = '';
  
  updateWallet();
  goMenu('WithdrawList');
}

// ── TRANSFER WINNINGS TO WALLET ───────────────────
function submitTransfer() {
  const amount = parseInt(v('transAmt'));

  if (!amount || amount < 10) { 
    toast('কমপক্ষে ৳১০ ট্রান্সফার করতে হবে!', 'error'); return; 
  }

  load(); me = DB.users[me.phone];
  const earn = me.earnBalance || 0;

  if (amount > earn) { 
    toast('পর্যাপ্ত উইনিং ব্যালেন্স নেই!', 'error'); return; 
  }

  me.earnBalance = earn - amount;
  me.balance = (me.balance || 0) + amount;
  DB.users[me.phone] = me;

  addHistory(me.phone, 'join', `🔄 Transferred to Deposit`, amount, 'done'); // join/exchange label
  save();

  toast('৳' + amount + ' সফলভাবে ডিপোজিট ব্যালেন্সে রূপান্তর করা হয়েছে! ✅', 'success');
  document.getElementById('transAmt').value = '';
  updateWallet();
  if (document.getElementById('secAccount').classList.contains('active')) renderProfile();
}

// ── WITHDRAW LIST HISTORY ─────────────────────────
function renderWithdrawList() {
  load();
  const withdrawals = DB.withdrawals.filter(w => w.phone === me.phone) || [];
  const el = document.getElementById('withdrawRequestsList');
  if (!el) return;

  if (!withdrawals.length) {
    el.innerHTML = '<div class="empty"><i class="fa-solid fa-receipt"></i> কোন উইথড্র ইতিহাস নেই</div>';
    return;
  }
  
  const methodLabels = { bkash: '💗 bKash', nagad: '🔶 Nagad', rocket: '🚀 Rocket' };
  el.innerHTML = withdrawals.slice().reverse().map(w => `
    <div class="hist-item">
      <div class="hist-left">
        <div class="hist-icon withdraw"><i class="fa-solid fa-money-bill-transfer"></i></div>
        <div class="hist-details">
          <div class="hist-label">${methodLabels[w.method] || w.method.toUpperCase()} Out: ${w.acc}</div>
          <div class="hist-time">${w.time}</div>
        </div>
      </div>
      <div class="hist-right">
        <div class="hist-amount minus">-৳${w.amount}</div>
        <span class="status-badge ${w.status === 'pending' ? 'pending' : w.status === 'approved' ? 'approved' : 'rejected'}">
          ${w.status === 'pending' ? 'Pending' : w.status === 'approved' ? '✓ Completed' : '✕ Rejected'}
        </span>
      </div>
    </div>`).join('');
}

// ── LIVE MATCH STREAMING & CHAT SIMULATOR ──────────
function initLiveStream() {
  const streamContainer = document.getElementById('liveStreamContainer');
  if (!streamContainer) return;
  
  const videoLink = DB.settings.liveLink;
  
  if (videoLink && videoLink.trim() !== '') {
    streamContainer.innerHTML = `<iframe src="${videoLink}" allowfullscreen></iframe>`;
  } else {
    streamContainer.innerHTML = `
      <div class="live-placeholder">
        <i class="fa-solid fa-circle-exclamation"></i>
        <div style="font-size:1.1rem;font-weight:700;margin-bottom:6px;">No Live Stream Available</div>
        <div style="font-size:0.85rem;color:var(--muted)">Admin has not started any live match stream yet. Please check back later!</div>
      </div>`;
  }
  
  // Start simulated chat
  clearInterval(liveChatInterval);
  const chatMessages = document.getElementById('liveChatMessages');
  if (chatMessages) {
    chatMessages.innerHTML = `<div class="chat-msg"><span class="chat-author mod">System Bot:</span> স্বাগতম! এখানে লাইভ ম্যাচের মন্তব্য করুন।</div>`;
  }
  
  liveChatInterval = setInterval(() => {
    if (!document.getElementById('secLive').classList.contains('active')) {
      clearInterval(liveChatInterval);
      return;
    }
    const randomName = SIM_NAMES[Math.floor(Math.random() * SIM_NAMES.length)];
    const randomComment = SIM_COMMENTS[Math.floor(Math.random() * SIM_COMMENTS.length)];
    appendChatMsg(randomName, randomComment);
  }, 3500);
}

function appendChatMsg(author, text, isMe = false) {
  const chatMessages = document.getElementById('liveChatMessages');
  if (!chatMessages) return;
  
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg';
  msgDiv.innerHTML = `<span class="chat-author ${isMe ? 'mod' : ''}">${author}:</span> ${text}`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Keep last 30 messages in DOM
  while (chatMessages.children.length > 30) {
    chatMessages.removeChild(chatMessages.firstChild);
  }
}

function sendChat() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  if (!me) return;
  
  appendChatMsg(me.ffname || me.name, text, true);
  input.value = '';
}

// ── MY ACCOUNT / PROFILE ──────────────────────────
function renderProfile() {
  if (!me) return;
  load(); me = DB.users[me.phone];
  
  // Support check for earnBalance & supportPin
  if (me.earnBalance === undefined) me.earnBalance = 0;
  if (!me.supportPin) me.supportPin = Math.floor(100000 + Math.random() * 900000).toString();
  if (!me.joinedDate) me.joinedDate = 'Joined: ' + new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  
  set('pName',     me.name);
  set('pUid',      'UID: ' + me.uid);
  set('pFFName',   'FF Name: ' + me.ffname);
  set('pJoinedDate', me.joinedDate);
  set('p2Wallet',  '৳ ' + me.balance);
  set('p2Prize',   '৳ ' + (me.earnBalance || 0));
  set('p2Kills',   me.totalKills  || 0);
  set('p2SupportPin', me.supportPin);
  
  // Sidebar info updates
  set('sbName', me.name);
  set('sbEmail', me.phone);
  
  // Transaction Table with Pagination
  const hist = DB.history[me.phone] || [];
  const totalPages = Math.ceil(hist.length / rowsPerPage) || 1;
  
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  
  const el = document.getElementById('historyList');
  if (!el) return;

  if (!hist.length) {
    el.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:30px;"><i class="fa-solid fa-inbox" style="font-size:2rem;margin-bottom:8px;display:block;opacity:0.4;"></i>কোন লেনদেনের ইতিহাস নেই</td></tr>';
    set('pageIndicator', 'Page 1 of 1');
    document.getElementById('btnPrevPage').disabled = true;
    document.getElementById('btnNextPage').disabled = true;
    return;
  }
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedItems = hist.slice(startIndex, startIndex + rowsPerPage);
  
  const labelIcons = {
    deposit: '<i class="fa-solid fa-circle-down" style="color:var(--green)"></i>',
    withdraw: '<i class="fa-solid fa-circle-up" style="color:var(--primary)"></i>',
    prize: '<i class="fa-solid fa-trophy" style="color:var(--gold)"></i>',
    join: '<i class="fa-solid fa-gamepad" style="color:var(--blue)"></i>'
  };
  
  el.innerHTML = paginatedItems.map(h => {
    const sign = h.amount >= 0 ? '+' : '';
    const amtClass = h.amount >= 0 ? 'plus' : 'minus';
    
    let badgeHtml = '';
    if (h.status === 'pending') {
      badgeHtml = '<span class="status-badge pending">Pending</span>';
    } else if (h.status === 'rejected') {
      badgeHtml = '<span class="status-badge rejected">Rejected</span>';
    } else {
      badgeHtml = '<span class="status-badge approved">Done</span>';
    }
    
    return `
      <tr>
        <td style="font-size:0.75rem;color:var(--muted);">${h.time.split(' ')[0]}</td>
        <td>
          <div style="font-weight:700;display:flex;align-items:center;gap:6px;">
            ${labelIcons[h.type] || ''} ${h.label}
          </div>
        </td>
        <td><strong class="hist-amount ${amtClass}">${sign}৳${Math.abs(h.amount)}</strong></td>
        <td>${badgeHtml}</td>
      </tr>`;
  }).join('');
  
  set('pageIndicator', `Page ${currentPage} of ${totalPages}`);
  document.getElementById('btnPrevPage').disabled = (currentPage === 1);
  document.getElementById('btnNextPage').disabled = (currentPage === totalPages);
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderProfile();
  }
}

function nextPage() {
  const hist = DB.history[me.phone] || [];
  const totalPages = Math.ceil(hist.length / rowsPerPage) || 1;
  if (currentPage < totalPages) {
    currentPage++;
    renderProfile();
  }
}

// ── REFER & EARN ──────────────────────────────────
function renderReferPage() {
  if (!me) return;
  const phoneDigits = me.phone.slice(-4);
  const pinDigits = (me.supportPin || '00').slice(-2);
  const code = `FFHUB-${phoneDigits}${pinDigits}`.toUpperCase();
  set('myReferCode', code);
}

function copyReferCode() {
  const code = document.getElementById('myReferCode').textContent;
  navigator.clipboard.writeText(code)
    .then(() => toast('রেফারেল কোড কপি হয়েছে! 📋', 'success'))
    .catch(() => toast(code, 'info'));
}

// ── HISTORY HELPER ─────────────────────────────────
function addHistory(phone, type, label, amount, status) {
  if (!DB.history[phone]) DB.history[phone] = [];
  DB.history[phone].unshift({
    type, label, amount, status,
    time: new Date().toLocaleString('bn-BD')
  });
}

// ── NOTIFICATIONS PWA ──────────────────────────────
function askNotification() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(p => {
      if (p === 'granted') {
        new Notification('FF HUB E-SPORTS 🔥', {
          body: 'আপনি ম্যাচের রুম কোড এলার্ট নোটিফিকেশনে পাবেন!',
          icon: '/icons/icon-192.png'
        });
      }
    });
  }
}

// ── SET HELPER ────────────────────────────────────
function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── SESSION SAVE / RESTORE ────────────────────────
// Save session when logging in
function saveSession(phone) {
  localStorage.setItem('ffhub_session', phone);
}

// Clear session on logout
function clearSession() {
  localStorage.removeItem('ffhub_session');
}

// ── INITIALIZATION ────────────────────────────────

// First, load whatever we have in localStorage
load();
applyBgImage();

// ── SERVER SYNC: Fetch latest data from db.json (async) ──
// The server (db.json) is the SINGLE SOURCE OF TRUTH for cross-browser consistency.
// Every browser always gets the SAME data from the server on page load.
// localStorage is just a fast cache — it always gets overwritten by server data.
(async function initFromServer() {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && typeof serverData === 'object' && Object.keys(serverData).length > 0) {
        // ── ALWAYS overwrite localStorage with server data ──
        // This ensures Chrome, Firefox, Edge — every browser — shows identical data
        localStorage.setItem('ffhub_db', JSON.stringify(serverData));
        
        // Reload everything with fresh server data
        load();
        applyBgImage();
        renderAppBanners();
        
        // Try auto-login with the freshly synced data
        const savedPhone = localStorage.getItem('ffhub_session');
        if (savedPhone && DB.users && DB.users[savedPhone]) {
          me = DB.users[savedPhone];
          if (!me.supportPin) me.supportPin = Math.floor(100000 + Math.random() * 900000).toString();
          if (!me.joinedDate) me.joinedDate = 'Joined: ' + new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
          if (me.earnBalance === undefined) me.earnBalance = 0;
          DB.users[savedPhone] = me;
          save();
          afterLogin();
        }
      }
    }
  } catch(e) {
    // Server not available — using localStorage only (normal for file:// or dev)
  }
})();

// ── AUTO-LOGIN: Restore session on page load ──────
(function autoLogin() {
  const savedPhone = localStorage.getItem('ffhub_session');
  if (savedPhone && DB.users[savedPhone]) {
    me = DB.users[savedPhone];
    // Fill missing fields safely
    if (!me.supportPin) me.supportPin = Math.floor(100000 + Math.random() * 900000).toString();
    if (!me.joinedDate) me.joinedDate = 'Joined: ' + new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    if (me.earnBalance === undefined) me.earnBalance = 0;
    DB.users[savedPhone] = me;
    save();
    afterLogin();
  }
})();
