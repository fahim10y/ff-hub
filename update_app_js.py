
import sys
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. doLogin ban check
login_check = """
  const u = DB.users[phone];
  if (!u) {
    toast('এই নম্বরে কোনো অ্যাকাউন্ট নেই!');
    return;
  }
  if (u.isBanned) {
    toast('আপনার অ্যাকাউন্ট ব্যান করা হয়েছে! অ্যাডমিনের সাথে যোগাযোগ করুন।');
    return;
  }
  if (u.password !== pass) {
    toast('ভুল পাসওয়ার্ড!');
"""
content = content.replace("""
  const u = DB.users[phone];
  if (!u) {
    toast('এই নম্বরে কোনো অ্যাকাউন্ট নেই!');
    return;
  }
  if (u.password !== pass) {
    toast('ভুল পাসওয়ার্ড!');
""", login_check)

# 2. init() ban check
init_check = """
  if (saved) {
    me = JSON.parse(saved);
    if (DB.users[me.phone] && DB.users[me.phone].isBanned) {
      alert('আপনার অ্যাকাউন্ট ব্যান করা হয়েছে!');
      localStorage.removeItem('ffhub_me');
      me = null;
    } else {
      updateWallet();
      goMenu('Home', document.getElementById('menu-home'));
    }
  } else {
"""
content = content.replace("""
  if (saved) {
    me = JSON.parse(saved);
    updateWallet();
    goMenu('Home', document.getElementById('menu-home'));
  } else {
""", init_check)

# 3. deposit limit
old_dep = """if (amount < 20) {
    toast('কমপক্ষে ২০ টাকা পাঠাতে হবে');"""
new_dep = """
  const limits = DB.settings.limits || {minDep: 50, maxDep: 5000, minWit: 100, maxWit: 5000};
  if (amount < limits.minDep || amount > limits.maxDep) {
    toast(`ডিপোজিটের পরিমাণ ${limits.minDep} থেকে ${limits.maxDep} টাকার মধ্যে হতে হবে`);"""
content = content.replace(old_dep, new_dep)

# 4. withdraw limit
old_wit = """if (amount < 50) {
    toast('কমপক্ষে ৫০ টাকা উইথড্র করতে হবে');"""
new_wit = """
  const limits = DB.settings.limits || {minDep: 50, maxDep: 5000, minWit: 100, maxWit: 5000};
  if (amount < limits.minWit || amount > limits.maxWit) {
    toast(`উইথড্রর পরিমাণ ${limits.minWit} থেকে ${limits.maxWit} টাকার মধ্যে হতে হবে`);"""
content = content.replace(old_wit, new_wit)

# 5. In-app Notification Fix
app_notif_func = """
// ── IN-APP NOTIFICATION ───────────────────────────
function showAppNotification(title, body) {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '20px';
  div.style.left = '50%';
  div.style.transform = 'translateX(-50%)';
  div.style.background = 'linear-gradient(135deg, var(--secondary), var(--primary))';
  div.style.color = '#fff';
  div.style.padding = '15px 20px';
  div.style.borderRadius = '12px';
  div.style.zIndex = '999999';
  div.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
  div.style.width = '90%';
  div.style.maxWidth = '400px';
  div.style.textAlign = 'center';
  div.innerHTML = `
    <h3 style="margin:0 0 5px; font-size:1.1rem; text-transform:uppercase;"><i class="fa-solid fa-bell fa-shake"></i> ${title}</h3>
    <p style="margin:0; font-size:1rem; white-space:pre-wrap;">${body}</p>
    <button onclick="this.parentElement.remove()" style="margin-top:10px; background:rgba(0,0,0,0.3); border:none; color:#fff; padding:5px 15px; border-radius:6px; cursor:pointer;">বন্ধ করুন</button>
  `;
  document.body.appendChild(div);
  
  // Try to play sound
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(()=>{});
  } catch(e) {}
}

function checkRoomCodes() {
"""
content = content.replace('function checkRoomCodes() {', app_notif_func)

old_room_notify = "new Notification('FF HUB E-SPORTS 🔥', { body: `ম্যাচের রুম কোড দেওয়া হয়েছে!\\nRoom ID: ${rc.roomID}\\nPass: ${rc.roomPass}`, icon: '/icons/icon-192.png' });"
new_room_notify = "showAppNotification('রুম কোড অ্যালার্ট!', `রুম আইডি: ${rc.roomID}\\nপাসওয়ার্ড: ${rc.roomPass}`);"
content = content.replace(old_room_notify, new_room_notify)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated js/app.js")
