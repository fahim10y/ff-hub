
import sys
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

with open('admin/css/admin.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Find where the good CSS ends (after the last proper closing brace before junk)
# The good CSS ends at line 733 after "}"
# Find the position of the last clean "}" before the garbled text

# The clean file ends with:
# .ss-val { font-size: 1rem; }\n}\n
# Then comes the garbled UTF-16 text starting with .\x00a\x00d\x00m\x00i\x00n...

# Find the garbled section and cut it
garbled_marker = '.\x00a\x00d\x00m\x00i\x00n'
if garbled_marker in content:
    cut_pos = content.index(garbled_marker)
    clean_content = content[:cut_pos].rstrip()
    print(f"Found garbled text at position {cut_pos}")
else:
    # Find the last proper CSS block end
    # Try to find the end of the small phones media query
    marker = '.ss-val { font-size: 1rem; }\n}'
    if marker in content:
        cut_pos = content.index(marker) + len(marker)
        clean_content = content[:cut_pos]
        print(f"Cut at marker position {cut_pos}")
    else:
        print("Could not find cut point, checking last lines...")
        lines = content.split('\n')
        for i, l in enumerate(lines[-10:], start=len(lines)-10):
            print(f"L{i+1}: {repr(l[:80])}")
        clean_content = content

# Now append the correct mode grid CSS
new_css = """

/* ── ADMIN MODE GRID (Results & Notify tabs) ── */
.admin-mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 120px);
  gap: 10px;
  margin-bottom: 15px;
}
.admin-mode-box {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,0.15);
  cursor: pointer;
  width: 120px;
  height: 100px;
  transition: all 0.2s;
  background-size: cover !important;
  background-position: center !important;
}
.admin-mode-box:hover {
  border-color: var(--secondary);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,240,255,0.2);
}
.admin-mode-box.active {
  border-color: var(--secondary);
  box-shadow: 0 0 16px rgba(0,240,255,0.4);
  transform: scale(0.96);
}
.admin-mode-box .amb-title {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 5px 6px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.5px;
  background: linear-gradient(to top, rgba(0,0,0,0.92), transparent);
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}

@media (max-width: 768px) {
  .admin-mode-grid {
    grid-template-columns: repeat(auto-fill, 100px);
  }
  .admin-mode-box {
    width: 100px;
    height: 84px;
  }
}
"""

final_content = clean_content + new_css

with open('admin/css/admin.css', 'w', encoding='utf-8') as f:
    f.write(final_content)

print("CSS fixed successfully!")
print(f"Final file length: {len(final_content)} chars")
