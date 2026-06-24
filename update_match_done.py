
import sys
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

with open('admin/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add the button below giveResultCard
# We find: 
#             <i class="fa-solid fa-xmark"></i> বাতিল করুন
#           </button>
#         </div>
target = '          </button>\n          </div>'
new_button = '''          </button>
          </div>
          
          <div style="margin-top:20px; border-top:1px dashed rgba(255,255,255,0.2); padding-top:20px;">
            <button class="abtn abtn-cyan abtn-full" onclick="markMatchCompleted()" style="background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);">
              <i class="fa-solid fa-flag-checkered"></i> All Prize Give Done (Complete Match)
            </button>
            <div style="font-size:0.75rem; color:var(--muted); text-align:center; margin-top:8px;">
              এই বাটনে ক্লিক করলে ম্যাচটি পুরাতন (Old) হয়ে যাবে এবং আর এই লিস্টে আসবে না।
            </div>
          </div>'''
if 'markMatchCompleted' not in content:
    content = content.replace(target, new_button)

with open('admin/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin/index.html")

with open('admin/js/admin.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Update loadResultMatchCards filter
old_filter = "const matches = (DB.matches || []).filter(m => filter === '' || m.category === filter);"
new_filter = "const matches = (DB.matches || []).filter(m => (filter === '' || m.category === filter) && m.status !== 'done');"
js_content = js_content.replace(old_filter, new_filter)

# Add markMatchCompleted function
done_func = '''
// ── COMPLETE MATCH ────────────────────────────────
function markMatchCompleted() {
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
'''
if 'function markMatchCompleted()' not in js_content:
    js_content = js_content.replace('// ── RESULT ACTION FUNCTIONS ──────────────────────────', done_func + '\n// ── RESULT ACTION FUNCTIONS ──────────────────────────')

with open('admin/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
print("Updated admin/js/admin.js")
