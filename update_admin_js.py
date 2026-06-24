
import sys
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

with open('admin/js/admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update renderUsers
old_user_card = '<div class="user-card">'
new_user_card = '<div class="user-card" style="cursor:pointer;" onclick="openUserModal(\'${u.phone}\')">'
content = content.replace(old_user_card, new_user_card)

old_search_card = '<div class="user-card" style="border-color: var(--secondary);">'
new_search_card = '<div class="user-card" style="border-color: var(--secondary); cursor:pointer;" onclick="openUserModal(\'${u.phone}\')">'
content = content.replace(old_search_card, new_search_card)

# 2. Add Modal Functions at the end of USERS section (around line 390)
modal_functions = """
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
"""
content = content.replace('// ── DEPOSITS ────────────────────────────────────', modal_functions + '\n// ── DEPOSITS ────────────────────────────────────')

# 3. Update Settings Loading
load_settings_old = "document.getElementById('cfgRocket').value = DB.settings.payNumbers.rocket || '';"
load_settings_new = """document.getElementById('cfgRocket').value = DB.settings.payNumbers.rocket || '';
  
  if(!DB.settings.limits) DB.settings.limits = {minDep: 50, maxDep: 5000, minWit: 100, maxWit: 5000};
  const cfgMinDep = document.getElementById('cfgMinDep');
  if(cfgMinDep) cfgMinDep.value = DB.settings.limits.minDep;
  const cfgMaxDep = document.getElementById('cfgMaxDep');
  if(cfgMaxDep) cfgMaxDep.value = DB.settings.limits.maxDep;
  const cfgMinWit = document.getElementById('cfgMinWit');
  if(cfgMinWit) cfgMinWit.value = DB.settings.limits.minWit;
  const cfgMaxWit = document.getElementById('cfgMaxWit');
  if(cfgMaxWit) cfgMaxWit.value = DB.settings.limits.maxWit;
"""
content = content.replace(load_settings_old, load_settings_new)

# 4. Update Settings Saving
save_settings_old = "DB.settings.payNumbers.rocket = document.getElementById('cfgRocket').value.trim();"
save_settings_new = """DB.settings.payNumbers.rocket = document.getElementById('cfgRocket').value.trim();
  
  if(!DB.settings.limits) DB.settings.limits = {};
  const inMinDep = document.getElementById('cfgMinDep');
  if(inMinDep) DB.settings.limits.minDep = parseInt(inMinDep.value) || 50;
  const inMaxDep = document.getElementById('cfgMaxDep');
  if(inMaxDep) DB.settings.limits.maxDep = parseInt(inMaxDep.value) || 5000;
  const inMinWit = document.getElementById('cfgMinWit');
  if(inMinWit) DB.settings.limits.minWit = parseInt(inMinWit.value) || 100;
  const inMaxWit = document.getElementById('cfgMaxWit');
  if(inMaxWit) DB.settings.limits.maxWit = parseInt(inMaxWit.value) || 5000;
"""
content = content.replace(save_settings_old, save_settings_new)

with open('admin/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin.js")
