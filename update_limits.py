
import sys
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Update submitDeposit limit
old_dep = "if (!amount || amount < 50) { \n    toast('কমপক্ষে ৳৫০ যোগ করতে হবে!', 'error'); return; \n  }"
new_dep = """const limits = DB.settings.limits || {minDep: 50, maxDep: 5000, minWit: 100, maxWit: 5000};
  if (!amount || amount < limits.minDep || amount > limits.maxDep) { 
    toast(`ডিপোজিটের পরিমাণ ৳${limits.minDep} থেকে ৳${limits.maxDep} এর মধ্যে হতে হবে!`, 'error'); return; 
  }"""
if old_dep in content:
    content = content.replace(old_dep, new_dep)

# Update submitWithdraw limit
old_wit = "if (!amount || amount < 100) { \n    toast('উইথড্র করার নূন্যতম পরিমাণ ৳১০০!', 'error'); return; \n  }"
new_wit = """const limits = DB.settings.limits || {minDep: 50, maxDep: 5000, minWit: 100, maxWit: 5000};
  if (!amount || amount < limits.minWit || amount > limits.maxWit) { 
    toast(`উইথড্রর পরিমাণ ৳${limits.minWit} থেকে ৳${limits.maxWit} এর মধ্যে হতে হবে!`, 'error'); return; 
  }"""
if old_wit in content:
    content = content.replace(old_wit, new_wit)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Limits updated in app.js!")
