
import sys
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

with open('admin/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add User Modal before </body>
user_modal = """
<!-- ── USER ACTION MODAL ── -->
<div class="admin-overlay" id="userModalOverlay" style="z-index: 1000;" onclick="closeUserModal()"></div>
<div class="acard" id="userActionModal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index: 1001; width:90%; max-width:400px; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
  <div class="acard-header" style="display:flex; justify-content:space-between; margin-bottom:10px;">
    <span><i class="fa-solid fa-user-gear" style="color:var(--secondary)"></i> User Settings</span>
    <button onclick="closeUserModal()" style="background:none;border:none;color:var(--muted);cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
  </div>
  <div id="umInfo" style="margin-bottom:15px; font-size:0.9rem; color:var(--text); line-height:1.4;"></div>
  
  <div class="aform-group">
    <label class="aform-label">নতুন পাসওয়ার্ড (Change Password)</label>
    <input type="text" id="umNewPass" placeholder="নতুন পাসওয়ার্ড লিখুন">
  </div>
  <button class="abtn abtn-cyan abtn-full" onclick="saveUserPassword()" style="margin-bottom:15px;">
    <i class="fa-solid fa-key"></i> পাসওয়ার্ড আপডেট করুন
  </button>
  
  <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
    <button id="umBanBtn" class="abtn abtn-red abtn-full" onclick="toggleUserBan()">
      <i class="fa-solid fa-ban"></i> ইউজারকে Ban করুন
    </button>
  </div>
</div>
"""
if 'userActionModal' not in content:
    content = content.replace('</body>', user_modal + '\n</body>')

# 2. Add limits to Settings
settings_limits = """
        <div class="acard" style="margin-top:16px;">
          <div class="acard-header">
            <i class="fa-solid fa-scale-balanced" style="color:var(--gold)"></i> ডিপোজিট ও উইথড্র লিমিট
          </div>
          <div class="aform-row">
            <div class="aform-group">
              <label class="aform-label">সর্বনিম্ন ডিপোজিট (Min)</label>
              <input type="number" id="cfgMinDep" placeholder="50">
            </div>
            <div class="aform-group">
              <label class="aform-label">সর্বোচ্চ ডিপোজিট (Max)</label>
              <input type="number" id="cfgMaxDep" placeholder="5000">
            </div>
          </div>
          <div class="aform-row">
            <div class="aform-group">
              <label class="aform-label">সর্বনিম্ন উইথড্র (Min)</label>
              <input type="number" id="cfgMinWit" placeholder="100">
            </div>
            <div class="aform-group">
              <label class="aform-label">সর্বোচ্চ উইথড্র (Max)</label>
              <input type="number" id="cfgMaxWit" placeholder="5000">
            </div>
          </div>
        </div>
"""
if 'cfgMinDep' not in content:
    pay_settings_idx = content.find('<div class="acard" style="margin-top:16px;">\n          <div class="acard-header">\n            <i class="fa-solid fa-credit-card"')
    if pay_settings_idx != -1:
        content = content[:pay_settings_idx] + settings_limits + content[pay_settings_idx:]

with open('admin/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin/index.html")
