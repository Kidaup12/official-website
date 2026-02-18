#!/usr/bin/env python3
"""
Update projects.html with TIGHTER grid positions and data attributes for push-down effect
"""

import re

# Read the HTML file
path = '/home/evan/Documents/kidaflow/customer success/projects.html'
with open(path, 'r') as f:
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

# Combined list for sequential filling
all_projects = featured_projects + regular_projects

# Grid configuration
# Reduced V_SPACING from 18% to 12% for tighter layout
INITIAL_TOP = 5.0
V_SPACING = 12.0 
H_SPACING = 22.7
INITIAL_LEFT = 5.0
COLS = 4

new_positions = {}

# Assign positions in 4-column grid
for i, project in enumerate(all_projects):
    row = i // COLS
    col = i % COLS
    
    top = INITIAL_TOP + (row * V_SPACING)
    left = INITIAL_LEFT + (col * H_SPACING)
    
    # Store position string AND data attributes
    # We append data-row and data-col to the existing attributes
    new_positions[project] = {
        'style': f'top: {top:.1f}%; left: {left:.1f}%',
        'row': row,
        'col': col
    }

# Update HTML
for project_id, data in new_positions.items():
    # 1. Update Style
    pattern_style = rf'(data-project="{project_id}"[^>]*style=")[^"]*(")'
    replacement_style = rf'\1{data["style"]}\2'
    html = re.sub(pattern_style, replacement_style, html)
    
    # 2. Add/Update data-row and data-col
    # First, separate the tag opening to inject attributes if they don't exist
    # Or just replace the whole tag logic? Regex is tricky.
    # Safe approach: Append attributes after class="..." if they don't exist, or replace if they do
    
    # Simplest way: The regex locates the div start. We can inject attributes before the style tag maybe?
    # Let's clean up old data-row/col if they exist (unlikely)
    
    # We will construct a replacement for the specific part: `data-project="xyz" style="...`
    # We want: `data-project="xyz" data-row="X" data-col="Y" style="..."`
    
    # Pattern to match the data-project bit and potential surrounding attributes until style
    # Note: earlier script put style right after data-project or similar. 
    # Let's just create a robust regex for the project node div opening
    
    # Matches: <div class="..." data-project="ID" style="...">
    # We want to insert `data-row` and `data-col`
    
    # Find the tag start
    tag_pattern = rf'(<div[^>]*data-project="{project_id}"[^>]*)>'
    
    match = re.search(tag_pattern, html)
    if match:
        tag_content = match.group(1)
        # Check if already has data-row
        if 'data-row=' in tag_content:
            # Replace existing
            tag_content = re.sub(r'data-row="\d+"', f'data-row="{data["row"]}"', tag_content)
            tag_content = re.sub(r'data-col="\d+"', f'data-col="{data["col"]}"', tag_content)
        else:
            # Add new attributes before style
            if 'style=' in tag_content:
                tag_content = tag_content.replace('style=', f'data-row="{data["row"]}" data-col="{data["col"]}" style=')
            else:
                 # Just append if no style (unlikely)
                tag_content += f' data-row="{data["row"]}" data-col="{data["col"]}"'
        
        # Replace in HTML
        html = html.replace(match.group(1), tag_content)

# Write updated HTML
with open(path, 'w') as f:
    f.write(html)

print("✅ Updated grid with TIGHT spacing (12%) and push-down attributes!")
print(f"📍 Processed {len(all_projects)} projects")
print("📍 Added data-row and data-col for JS interaction")
