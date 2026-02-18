#!/usr/bin/env python3
"""
Reorganize nodes: Featured projects in first 2 rows, regular projects below
"""

import re

# Read the HTML file
with open('/home/evan/Documents/kidaflow/customer success/projects.html', 'r') as f:
    html = f.read()

# Featured projects (7 total)
featured_projects = [
    'customer-booking', 'akwaaba', 'ai-voice-plumbing', 'voice-receptionist',
    'cold-email', '21k-emails', 'ocr-legal'
]

# Regular projects (11 total)
regular_projects = [
    'ai-booking', 'replace-calendly', 'viral-content', 'proposals',
    'ghl-automations', 'coaching-assistant', 'whatsapp-support',
    'lovable-proposals', 'slack-inventory', 'sales-hiring', 'ai-bookkeeping'
]

# New positions: Featured in rows 1-2, Regular in rows 3-5
new_positions = {}

# Row 1: Featured (4 projects)
for i, project in enumerate(featured_projects[:4]):
    left = 5.0 + i * 22.7
    new_positions[project] = f'top: 5.0%; left: {left:.1f}%'

# Row 2: Featured (3 projects)
for i, project in enumerate(featured_projects[4:7]):
    left = 5.0 + i * 22.7
    new_positions[project] = f'top: 23.0%; left: {left:.1f}%'

# Row 3: Regular (4 projects)
for i, project in enumerate(regular_projects[:4]):
    left = 5.0 + i * 22.7
    new_positions[project] = f'top: 41.0%; left: {left:.1f}%'

# Row 4: Regular (4 projects)
for i, project in enumerate(regular_projects[4:8]):
    left = 5.0 + i * 22.7
    new_positions[project] = f'top: 59.0%; left: {left:.1f}%'

# Row 5: Regular (3 projects)
for i, project in enumerate(regular_projects[8:11]):
    left = 5.0 + i * 22.7
    new_positions[project] = f'top: 77.0%; left: {left:.1f}%'

# Update positions
for project_id, position in new_positions.items():
    pattern = rf'(data-project="{project_id}"[^>]*style=")[^"]*(")'
    replacement = rf'\1{position}\2'
    html = re.sub(pattern, replacement, html)

# Write updated HTML
with open('/home/evan/Documents/kidaflow/customer success/projects.html', 'w') as f:
    f.write(html)

print("✅ Reorganized! Featured projects now in first 2 rows")
print("📍 Row 1-2: 7 Featured projects")
print("📍 Row 3-5: 11 Regular projects")
