
import sys
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

with open('admin/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Results Action View Button
res_target = '''            <button class="abtn abtn-red abtn-full" onclick="cancelResultSelect()" style="margin-top:8px;">
              <i class="fa-solid fa-xmark"></i> বাতিল করুন
            </button>
          </div>'''

res_new = '''            <button class="abtn abtn-red abtn-full" onclick="cancelResultSelect()" style="margin-top:8px;">
              <i class="fa-solid fa-xmark"></i> বাতিল করুন
            </button>
          </div>
          
          <div style="margin-top:20px; border-top:1px dashed rgba(255,255,255,0.2); padding-top:20px;">
            <button class="abtn abtn-cyan abtn-full" onclick="markMatchCompletedRes()" style="background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);">
              <i class="fa-solid fa-flag-checkered"></i> All Prize Give Done (Complete Match)
            </button>
            <div style="font-size:0.75rem; color:var(--muted); text-align:center; margin-top:8px;">
              এই বাটনে ক্লিক করলে ম্যাচটি পুরাতন (Old) হয়ে যাবে এবং আর এই লিস্টে আসবে না।
            </div>
          </div>'''

if 'markMatchCompletedRes' not in content:
    content = content.replace(res_target, res_new)

# 2. Notify Action View Button
notify_target = '''            <button class="abtn abtn-cyan abtn-full" onclick="sendRoomNotify()">

              <i class="fa-solid fa-bell"></i> Room Code পাবলিশ করুন

            </button>

          </div>'''

notify_new = '''            <button class="abtn abtn-cyan abtn-full" onclick="sendRoomNotify()">

              <i class="fa-solid fa-bell"></i> Room Code পাবলিশ করুন

            </button>

          </div>
          
          <div style="margin-top:20px; border-top:1px dashed rgba(255,255,255,0.2); padding-top:20px;">
            <button class="abtn abtn-cyan abtn-full" onclick="markMatchCompletedNotify()" style="background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);">
              <i class="fa-solid fa-flag-checkered"></i> All Prize Give Done (Complete Match)
            </button>
            <div style="font-size:0.75rem; color:var(--muted); text-align:center; margin-top:8px;">
              এই বাটনে ক্লিক করলে ম্যাচটি পুরাতন (Old) হয়ে যাবে এবং আর এই লিস্টে আসবে না।
            </div>
          </div>'''

if 'markMatchCompletedNotify' not in content:
    content = content.replace(notify_target, notify_new)

with open('admin/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin/index.html")

with open('admin/js/admin.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Add logic if not present
js_logic = '''
// ── COMPLETE MATCH ────────────────────────────────
function markMatchCompletedRes() {
  if (!currentResMatchId) return;
  if (!confirm('আপনি কি নিশ্চিত যে এই ম্যাচের সব পুরস্কার দেওয়া শেষ? এরপর এই ম্যাচটি আর এখানে দেখা যাবে না!')) return;
  
  load();
  const m = DB.matches.find(x => x.id === currentResMatchId);
  if (m) {
    m.status = 'done';
    save();
    toast('ম্যাচটি সফলভাবে কমপ্লিট করা হয়েছে!', 'success');
    backToResMatchList();
    loadResultMatchCards();
  }
}

function markMatchCompletedNotify() {
  if (!currentNotifyMatchId) return;
  if (!confirm('আপনি কি নিশ্চিত যে এই ম্যাচের সব কাজ শেষ? এরপর এই ম্যাচটি আর এখানে দেখা যাবে না!')) return;
  
  load();
  const m = DB.matches.find(x => x.id === currentNotifyMatchId);
  if (m) {
    m.status = 'done';
    save();
    toast('ম্যাচটি সফলভাবে কমপ্লিট করা হয়েছে!', 'success');
    backToNotifyMatchList();
    loadNotifyMatchCards();
  }
}
'''
if 'markMatchCompletedRes' not in js_content:
    js_content = js_content.replace('// ── RESULT ACTION FUNCTIONS ──────────────────────────', js_logic + '\n// ── RESULT ACTION FUNCTIONS ──────────────────────────')

# Filter out done matches
old_res_filter = "const matches = (DB.matches || []).filter(m => filter === '' || m.category === filter);"
new_filter = "const matches = (DB.matches || []).filter(m => (filter === '' || m.category === filter) && m.status !== 'done');"
js_content = js_content.replace(old_res_filter, new_filter)

with open('admin/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
print("Updated admin/js/admin.js")
