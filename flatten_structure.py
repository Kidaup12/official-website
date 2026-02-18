#!/usr/bin/env python3
"""
Refactor projects.html to flatten the structure for a 3-column Grid layout.
Removes .project-column wrappers and places all .project-node elements directly into .projects-grid.
"""

from bs4 import BeautifulSoup

path = '/home/evan/Documents/kidaflow/customer success/projects.html'
with open(path, 'r') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

# Find the grid container
grid = soup.find('div', class_='projects-grid')
if not grid:
    print("Error: .projects-grid not found")
    exit(1)

# Find all nodes, regardless of where they are currently nested
nodes = grid.find_all('div', class_='project-node')

# Clear the grid
grid.clear()

# Append nodes directly to grid
for node in nodes:
    grid.append(node)

# Add Pagination Controls Container at the bottom
pagination_div = soup.new_tag('div', attrs={'class': 'pagination-controls', 'id': 'paginationControls'})
# styling will be done in CSS, JS will populate buttons
grid.insert_after(pagination_div)

# Write updated HTML
with open(path, 'w') as f:
    f.write(str(soup.prettify()))

print(f"✅ Flattened {len(nodes)} project nodes into .projects-grid")
