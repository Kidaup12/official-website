#!/usr/bin/env python3
"""
Refactor projects.html to use a Columnar Layout (4 columns) instead of absolute positioning.
This enables natural responsiveness and native push-down effects.
"""

from bs4 import BeautifulSoup
import re

# Read current HTML
path = '/home/evan/Documents/kidaflow/customer success/projects.html'
with open(path, 'r') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

# Get all project nodes
nodes = soup.find_all('div', class_='project-node')

# Project ID map to keep track of order if needed, but we can just use the current order
# We will distribute them into 4 columns: 0, 1, 2, 3, 0, 1...
columns = [[], [], [], []]

for i, node in enumerate(nodes):
    # Remove absolute positioning styles
    if 'style' in node.attrs:
        del node['style']
    
    # Remove data-row/col if present (no longer needed for JS)
    if 'data-row' in node.attrs: del node.attrs['data-row']
    if 'data-col' in node.attrs: del node.attrs['data-col']

    # Add margin-bottom for spacing
    node['class'] = node.get('class', []) + ['mb-6'] # We will define this utility or just use CSS gap

    # Distribute to columns
    col_index = i % 4
    columns[col_index].append(node)

# Create new structure
# <div class="projects-grid">
#   <div class="project-column">...nodes...</div>
#   <div class="project-column">...nodes...</div>
#   ...
# </div>

grid_div = soup.new_tag('div', attrs={'class': 'projects-grid'})

for col_nodes in columns:
    col_div = soup.new_tag('div', attrs={'class': 'project-column'})
    for node in col_nodes:
        col_div.append(node)
    grid_div.append(col_div)

# Replace the old workflow-canvas content
canvas = soup.find(id='workflowCanvas')
if canvas:
    canvas.clear()
    canvas.append(grid_div)
    # Remove height constraints from canvas/section since it's now fluid
    # We will handle this in CSS, but HTML structure is key here.

# Fix Navbar padding/container if needed? 
# The user mentioned navbar looks terrible. Usually this is due to fixed width containers in CSS.
# We will address navbar CSS separately.

# Write updated HTML
with open(path, 'w') as f:
    f.write(str(soup.prettify()))

print("✅ Refactored HTML to use 4-column Flexbox layout!")
print("📍 Nodes distributed into 4 vertical columns")
print("📍 Removed absolute positioning")
