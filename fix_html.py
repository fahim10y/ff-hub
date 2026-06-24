
import sys
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

with open('admin/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix 1: Remove duplicate comment (line index 287 in 0-based after last save might have changed)
# Find and remove the extra duplicate comment
found_first = False
to_remove = None
for i, l in enumerate(lines):
    if '<!-- View 3: Prize Form for Selected Match -->' in l:
        if found_first:
            to_remove = i
            break
        found_first = True

if to_remove is not None:
    lines.pop(to_remove)
    print(f"Removed duplicate comment at line {to_remove+1}")

# Now reload line numbers
for i, l in enumerate(lines):
    if 'id="notifyActionView"' in l:
        nav_start = i
        break

# The structure from L355 (0-indexed: nav_start):
# nav_start+0: <div id="notifyActionView" style="display:none;">
# nav_start+1: <button ...>
# nav_start+2:   <i ...> text
# nav_start+3: </button>
# nav_start+4: (blank)
# nav_start+5: <div class="acard">          <- opens acard (GOOD)
# nav_start+6: <div class="acard-header">...</div>  <- header (missing closing tag for acard-header? Let me check)
# nav_start+7: <div class="aform-row">      <- this is OUTSIDE the acard wrongly
# ...
# nav_start+15: </div>  <- this closes acard (at wrong level)
# nav_start+16: </div> <!-- End of notifyActionView -->

# The fix: replace lines nav_start through nav_start+16 with correct structure
old_section_start = nav_start
old_section_end = nav_start + 22  # up to and including End of notifyActionView

print(f"Replacing lines {old_section_start+1} to {old_section_end+1}")
for i in range(old_section_start, min(old_section_end, len(lines))):
    print(f"  L{i+1}: {lines[i].rstrip()[:80]}")

new_section = [
    '        <div id="notifyActionView" style="display:none;">\r\n',
    '          <button class="abtn" onclick="backToNotifyMatchList()" style="margin-bottom:12px; background:rgba(255,255,255,0.05); color:var(--text); border:1px solid rgba(255,255,255,0.1);">\r\n',
    '            <i class="fa-solid fa-arrow-left"></i> \u0985\u09a8\u09cd\u09af \u09ae\u09cd\u09af\u09be\u099a \u09b8\u09bf\u09b2\u09c7\u0995\u09cd\u099f \u0995\u09b0\u09c1\u09a8\r\n',
    '          </button>\r\n',
    '\r\n',
    '          <div class="acard">\r\n',
    '            <div class="acard-header"><i class="fa-solid fa-key" style="color:var(--secondary)"></i> <span id="notifySelectedMatchTitle">\u09ae\u09cd\u09af\u09be\u099a</span> \u2014 \u09b0\u09c1\u09ae \u0986\u0987\u09a1\u09bf \u0993 \u09aa\u09be\u09b8\u0993\u09df\u09be\u09b0\u09cd\u09a1</div>\r\n',
    '            <div class="aform-row">\r\n',
    '              <div class="aform-group">\r\n',
    '                <label class="aform-label">Match Room ID</label>\r\n',
    '                <input type="text" id="roomID" placeholder="Room ID \u099f\u09be\u0987\u09aa \u0995\u09b0\u09c1\u09a8">\r\n',
    '              </div>\r\n',
    '              <div class="aform-group">\r\n',
    '                <label class="aform-label">Room Password</label>\r\n',
    '                <input type="text" id="roomPass" placeholder="Password \u099f\u09be\u0987\u09aa \u0995\u09b0\u09c1\u09a8">\r\n',
    '              </div>\r\n',
    '            </div>\r\n',
    '            <button class="abtn abtn-cyan abtn-full" onclick="sendRoomNotify()">\r\n',
    '              <i class="fa-solid fa-bell"></i> Room Code \u09aa\u09be\u09ac\u09b2\u09bf\u09b6 \u0995\u09b0\u09c1\u09a8\r\n',
    '            </button>\r\n',
    '          </div>\r\n',
    '        </div> <!-- End of notifyActionView -->\r\n',
]

# Find where End of notifyActionView is
end_line = None
for i in range(old_section_start, old_section_start + 30):
    if i < len(lines) and 'End of notifyActionView' in lines[i]:
        end_line = i
        break

if end_line is not None:
    print(f"\nReplacing lines {old_section_start+1} to {end_line+2}")
    lines[old_section_start:end_line+1] = new_section
    print("Notify section fixed!")

with open('admin/index.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"\nFINAL total lines: {len(lines)}")
print("\nVerify notify section:")
for i, l in enumerate(lines):
    if 'notifyActionView' in l or 'roomID' in l or 'roomPass' in l:
        print(f"L{i+1}: {l.rstrip()[:100]}")
