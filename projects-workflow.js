
document.addEventListener('DOMContentLoaded', () => {

    /* ===== Pagination & Search Logic ===== */
    const itemsPerPage = 12;
    let currentPage = 1;
    let allNodes = Array.from(document.querySelectorAll('.project-node'));
    // Store original parent to clone from if needed, or just re-append. 
    // Since we are moving them, we need to be careful not to lose them.
    // Let's detach them from DOM initially to hold in memory.
    allNodes.forEach(node => node.remove());

    let filteredNodes = allNodes; // Initially all nodes

    const projectsGrid = document.getElementById('projectsGrid');
    const paginationControls = document.getElementById('paginationControls');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageIndicator = document.getElementById('pageIndicator');
    const searchInput = document.getElementById('projectSearch');

    // Function to update the view based on state
    function updateView() {
        const isSearching = searchInput && searchInput.value.trim().length > 0;

        // 1. Determine which nodes should be visible
        const nodesToShow = isSearching ? filteredNodes : filteredNodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        // 2. Clear Grid
        projectsGrid.innerHTML = '';

        // 3. Render Nodes (CSS Grid handles layout)
        nodesToShow.forEach((node, index) => {
            node.style.display = 'block';
            node.classList.remove('fade-in', 'fade-in-visible');
            node.style.opacity = ''; // Reset

            // Add fade-in-up class for scroll animation
            if (!node.classList.contains('fade-in-up')) {
                node.classList.add('fade-in-up');
            }

            projectsGrid.appendChild(node);

            // Staggered Animation
            setTimeout(() => {
                node.classList.add('fade-in');
            }, index * 30);
        });

        // Fade in the grid after columns are set up (prevents horizontal flash)
        requestAnimationFrame(() => {
            projectsGrid.style.opacity = '1';
        });

        // 5. Update Pagination Controls
        if (paginationControls) {
            if (isSearching) {
                paginationControls.style.display = 'none';
            } else {
                const totalMatching = filteredNodes.length;

                if (totalMatching <= itemsPerPage) {
                    paginationControls.style.display = 'none';
                } else {
                    paginationControls.style.display = 'flex';
                    const totalPages = Math.ceil(totalMatching / itemsPerPage);
                    if (pageIndicator) pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;

                    if (prevBtn) prevBtn.disabled = currentPage === 1;
                    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
                }
            }
        }

        // Re-observe nodes for scroll animation
        setupScrollAnimations();
    }

    // Window Resize Handler to re-distribute columns
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateView, 200);
    });

    // Pagination Click Handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateView();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredNodes.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                updateView();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    /* ===== Search Functionality ===== */
    function filterProjects(query) {
        query = query.toLowerCase();

        if (!query) {
            filteredNodes = allNodes;
        } else {
            filteredNodes = allNodes.filter(node => {
                const title = node.querySelector('.node-title')?.textContent.toLowerCase() || '';
                const subtitle = node.querySelector('.node-subtitle')?.textContent.toLowerCase() || '';
                const description = node.querySelector('.node-description')?.textContent.toLowerCase() || '';
                const tags = Array.from(node.querySelectorAll('.tag')).map(t => t.textContent.toLowerCase());

                return title.includes(query) ||
                    subtitle.includes(query) ||
                    description.includes(query) ||
                    tags.some(tag => tag.includes(query));
            });
        }

        currentPage = 1;
        updateView();
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query === '') {
                // Reset to all nodes
                filteredNodes = allNodes;
                allNodes.forEach(node => node.classList.remove('dimmed'));
            } else {
                // Filter nodes
                filteredNodes = allNodes.filter(node => {
                    const title = node.querySelector('.node-title')?.textContent.toLowerCase() || '';
                    const description = node.querySelector('.node-description')?.textContent.toLowerCase() || '';
                    const tags = Array.from(node.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase()).join(' ');
                    return title.includes(query) || description.includes(query) || tags.includes(query);
                });

                // Dim non-matching nodes
                allNodes.forEach(node => {
                    if (!filteredNodes.includes(node)) {
                        node.classList.add('dimmed');
                    } else {
                        node.classList.remove('dimmed');
                    }
                });
            }

            currentPage = 1; // Reset to first page
            updateView();
        });
    }

    /* ===== Node Expand Logic (Optional) ===== */
    // If user wants expand logic back, we can add it here.
    // For now, just handling layout.

    // ===== Scroll-based Fade-in Animation =====
    function setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add slight stagger effect for grid items
                    setTimeout(() => {
                        entry.target.classList.add('fade-in-visible');
                    }, index * 50);

                    // Unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all elements with fade-in-up class
        const fadeElements = document.querySelectorAll('.fade-in-up');
        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Initial Render
    updateView();

    console.log('Projects page initialized with scroll animations! 🚀');
});
