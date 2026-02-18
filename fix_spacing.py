#!/usr/bin/env python3
"""
Convert percentage TOP positions to pixels to preserve layout while reducing container height.
Target Layout preserved from: 2400px height * percentages.
"""

import re

path = '/home/evan/Documents/kidaflow/customer success/projects.html'
with open(path, 'r') as f:
    html = f.read()

# Current base height we effectively designed for
DESIGN_HEIGHT = 2400

# Regex to find style="..." containing top: X%
# We only want to replace the 'top' part.
# Example: style="top: 53.0%; left: 5.0%"

def replace_top(match):
    # match.group(0) is the whole style string e.g. 'style="top: 53.0%; left: 5.0%"'
    content = match.group(1) # content inside quotes
    
    # Find top: ... %
    def percent_to_px(m):
        pct = float(m.group(1))
        px = int((pct / 100.0) * DESIGN_HEIGHT)
        return f"top: {px}px"
    
    new_content = re.sub(r'top:\s*([\d.]+)%', percent_to_px, content)
    return f'style="{new_content}"'

# Matches style="... top: X% ..."
# Be careful not to match other styles if possible, but our generating script was consistent.
pattern = r'style="([^"]*top:\s*[\d.]+%[^"]*)"'

html_new = re.sub(pattern, replace_top, html)

with open(path, 'w') as f:
    f.write(html_new)

print(f"✅ Converted percentage 'top' positions to pixels based on {DESIGN_HEIGHT}px design height.")
print("📍 Preserves visual layout exactly but allows container height reduction.")
