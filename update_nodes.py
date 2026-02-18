#!/usr/bin/env python3
"""
Update projects.html with organized positions and SVG icons
"""

import re

# Read the HTML file
with open('/home/evan/Documents/kidaflow/customer success/projects.html', 'r') as f:
    html = f.read()

# Define new organized positions (4x5 grid)
positions = {
    'ai-booking': 'top: 5.0%; left: 5.0%',
    'customer-booking': 'top: 5.0%; left: 27.7%',
    'replace-calendly': 'top: 5.0%; left: 50.3%',
    'ai-voice-plumbing': 'top: 5.0%; left: 73.0%',
    'voice-receptionist': 'top: 23.0%; left: 5.0%',
    'akwaaba': 'top: 23.0%; left: 27.7%',
    'viral-content': 'top: 23.0%; left: 50.3%',
    'proposals': 'top: 23.0%; left: 73.0%',
    'ghl-automations': 'top: 41.0%; left: 5.0%',
    'cold-email': 'top: 41.0%; left: 27.7%',
    '21k-emails': 'top: 41.0%; left: 50.3%',
    'ocr-legal': 'top: 41.0%; left: 73.0%',
    'coaching-assistant': 'top: 59.0%; left: 5.0%',
    'whatsapp-support': 'top: 59.0%; left: 27.7%',
    'lovable-proposals': 'top: 59.0%; left: 50.3%',
    'slack-inventory': 'top: 59.0%; left: 73.0%',
    'sales-hiring': 'top: 77.0%; left: 5.0%',
    'ai-bookkeeping': 'top: 77.0%; left: 27.7%',
}

# SVG icons for each category
svg_icons = {
    'calendar': '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    'phone': '<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    'message': '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    'file': '<svg viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>',
    'settings': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/></svg>',
    'mail': '<svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    'document': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    'box': '<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    'users': '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'dollar': '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    'target': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    'mobile': '<svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    'graduation': '<svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
}

# Icon mapping for each project
icon_map = {
    'ai-booking': 'calendar',
    'customer-booking': 'calendar',
    'replace-calendly': 'message',
    'ai-voice-plumbing': 'phone',
    'voice-receptionist': 'phone',
    'akwaaba': 'mobile',
    'viral-content': 'target',
    'proposals': 'file',
    'ghl-automations': 'settings',
    'cold-email': 'mail',
    '21k-emails': 'mail',
    'ocr-legal': 'document',
    'coaching-assistant': 'graduation',
    'whatsapp-support': 'message',
    'lovable-proposals': 'document',
    'slack-inventory': 'box',
    'sales-hiring': 'users',
    'ai-bookkeeping': 'dollar',
}

# Update positions
for project_id, position in positions.items():
    # Find and replace the style attribute for this project
    pattern = rf'(data-project="{project_id}"[^>]*style=")[^"]*(")'
    replacement = rf'\1{position}\2'
    html = re.sub(pattern, replacement, html)

# Replace emoji icons with SVG icons
for project_id, icon_type in icon_map.items():
    svg = svg_icons[icon_type]
    # Find emoji icon divs and replace with SVG
    # Pattern: <div class="node-icon">EMOJI</div> where the div is within the project node
    pattern = rf'(data-project="{project_id}".*?<div class="node-icon">)[^<]+(</div>)'
    replacement = rf'\1{svg}\2'
    html = re.sub(pattern, replacement, html, flags=re.DOTALL)

# Write updated HTML
with open('/home/evan/Documents/kidaflow/customer success/projects.html', 'w') as f:
    f.write(html)

print("✅ Updated all node positions and replaced emojis with SVG icons!")
print("📍 Nodes now organized in 4x5 grid")
print("🎨 Minimalist black & white SVG icons applied")
