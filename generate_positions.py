#!/usr/bin/env python3
"""
Generate organized grid positions for 18 project nodes
Ensures no overlap and proper spacing
"""

# Canvas dimensions
CANVAS_WIDTH = 100  # percentage
CANVAS_HEIGHT = 100  # percentage
PADDING = 5  # percentage from edges

# Node dimensions
NODE_WIDTH = 22  # percentage (340px / ~1500px canvas)
NODE_HEIGHT_COLLAPSED = 12  # percentage
NODE_HEIGHT_EXPANDED = 35  # percentage when hover expanded

# Grid configuration
COLS = 4
ROWS = 5  # 18 nodes / 4 cols = 4.5, round up to 5

# Calculate spacing
H_SPACING = (CANVAS_WIDTH - 2 * PADDING - COLS * NODE_WIDTH) / (COLS - 1)
V_SPACING = 18  # Fixed vertical spacing

# Generate positions
positions = []
node_index = 0

for row in range(ROWS):
    for col in range(COLS):
        if node_index >= 18:
            break
        
        left = PADDING + col * (NODE_WIDTH + H_SPACING)
        top = PADDING + row * V_SPACING
        
        positions.append({
            'index': node_index,
            'left': f"{left:.1f}%",
            'top': f"{top:.1f}%"
        })
        
        node_index += 1

# Print positions for each project
projects = [
    'ai-booking', 'customer-booking', 'replace-calendly', 'ai-voice-plumbing',
    'voice-receptionist', 'akwaaba', 'viral-content', 'proposals',
    'ghl-automations', 'cold-email', '21k-emails', 'ocr-legal',
    'coaching-assistant', 'whatsapp-support', 'lovable-proposals',
    'slack-inventory', 'sales-hiring', 'ai-bookkeeping'
]

print("<!-- Organized Grid Layout -->")
for i, project in enumerate(projects):
    if i < len(positions):
        pos = positions[i]
        print(f'<!-- {project}: left: {pos["left"]}, top: {pos["top"]} -->')
