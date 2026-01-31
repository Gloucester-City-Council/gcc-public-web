/**
 * Fees and Charges Page JavaScript
 * Handles accordion functionality and search/filtering
 * Accessible and keyboard-friendly
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initAccordions();
        initSearch();
        initCategorySelect();
    }

    /**
     * Initialize accordion functionality
     * Handles expand/collapse with keyboard support
     */
    function initAccordions() {
        const triggers = document.querySelectorAll('.accordion-trigger');

        triggers.forEach(trigger => {
            trigger.addEventListener('click', handleAccordionClick);
            trigger.addEventListener('keydown', handleAccordionKeydown);
        });
    }

    function handleAccordionClick(event) {
        const trigger = event.currentTarget;
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        const contentId = trigger.getAttribute('aria-controls');
        const content = document.getElementById(contentId);

        if (!content) return;

        // Toggle the accordion
        trigger.setAttribute('aria-expanded', !isExpanded);
        content.hidden = isExpanded;

        // Announce state change to screen readers
        const categoryName = trigger.querySelector('.category-title-text').textContent;
        announceToScreenReader(isExpanded ?
            `${categoryName} collapsed` :
            `${categoryName} expanded`);
    }

    function handleAccordionKeydown(event) {
        const trigger = event.currentTarget;

        // Handle Enter and Space keys
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            trigger.click();
        }
    }

    /**
     * Initialize search functionality
     * Filters categories and tables based on search input
     */
    function initSearch() {
        const searchInput = document.getElementById('fees-search');
        const resultsCount = document.getElementById('search-results-count');

        if (!searchInput) return;

        let debounceTimer;

        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                performSearch(this.value.trim().toLowerCase(), resultsCount);
            }, 200);
        });

        // Clear search on Escape
        searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                this.value = '';
                performSearch('', resultsCount);
                this.blur();
            }
        });
    }

    function performSearch(query, resultsCount) {
        const categories = document.querySelectorAll('.fees-category');
        let totalMatches = 0;
        let visibleCategories = 0;

        if (!query) {
            // Reset: show all categories, collapse them
            categories.forEach(category => {
                category.hidden = false;
                category.classList.remove('search-highlight');

                // Reset row highlights
                const rows = category.querySelectorAll('tbody tr');
                rows.forEach(row => row.classList.remove('search-match'));
            });

            if (resultsCount) {
                resultsCount.textContent = '';
            }
            return;
        }

        categories.forEach(category => {
            const categoryText = category.textContent.toLowerCase();
            const tables = category.querySelectorAll('.fees-table');
            let categoryHasMatch = false;
            let categoryMatchCount = 0;

            // Check each table row
            tables.forEach(table => {
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const rowText = row.textContent.toLowerCase();
                    if (rowText.includes(query)) {
                        row.classList.add('search-match');
                        categoryHasMatch = true;
                        categoryMatchCount++;
                    } else {
                        row.classList.remove('search-match');
                    }
                });
            });

            // Also check service group titles and other text
            const groupTitles = category.querySelectorAll('.service-group-title');
            groupTitles.forEach(title => {
                if (title.textContent.toLowerCase().includes(query)) {
                    categoryHasMatch = true;
                }
            });

            // Check category title
            const categoryTitle = category.querySelector('.category-title-text');
            if (categoryTitle && categoryTitle.textContent.toLowerCase().includes(query)) {
                categoryHasMatch = true;
            }

            // Show/hide category based on matches
            category.hidden = !categoryHasMatch;

            if (categoryHasMatch) {
                visibleCategories++;
                totalMatches += categoryMatchCount;

                // Expand the accordion
                const trigger = category.querySelector('.accordion-trigger');
                const contentId = trigger?.getAttribute('aria-controls');
                const content = contentId ? document.getElementById(contentId) : null;

                if (trigger && content) {
                    trigger.setAttribute('aria-expanded', 'true');
                    content.hidden = false;
                }
            }
        });

        // Update results count for screen readers
        if (resultsCount) {
            if (visibleCategories === 0) {
                resultsCount.textContent = `No results found for "${query}"`;
            } else {
                resultsCount.textContent = `Found ${totalMatches} matching fee${totalMatches !== 1 ? 's' : ''} in ${visibleCategories} categor${visibleCategories !== 1 ? 'ies' : 'y'}`;
            }
        }
    }

    /**
     * Initialize category dropdown select
     */
    function initCategorySelect() {
        const select = document.getElementById('category-select');
        if (!select) return;

        select.addEventListener('change', function() {
            const targetId = this.value;
            if (!targetId) return;

            const targetSection = document.getElementById(targetId);
            if (!targetSection) return;

            // Expand the target accordion
            const trigger = targetSection.querySelector('.accordion-trigger');
            const contentId = trigger?.getAttribute('aria-controls');
            const content = contentId ? document.getElementById(contentId) : null;

            if (trigger && content) {
                trigger.setAttribute('aria-expanded', 'true');
                content.hidden = false;
            }

            // Smooth scroll to section
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Set focus to the trigger for keyboard users
            if (trigger) {
                setTimeout(() => {
                    trigger.focus();
                }, 500);
            }

            // Reset select to placeholder
            this.value = '';
        });
    }

    /**
     * Announce message to screen readers using live region
     */
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Add CSS for search match highlighting
     */
    function addSearchStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .fees-table tbody tr.search-match {
                background-color: #fef3c7 !important;
                border-left: 3px solid #f59e0b;
            }
            .fees-table tbody tr.search-match:hover {
                background-color: #fde68a !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Add search highlight styles
    addSearchStyles();

})();
