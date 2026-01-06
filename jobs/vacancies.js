/**
 * Gloucester City Council - Jobs Vacancies Page
 * Handles API fetching, filtering, sorting, and rendering of job listings
 */

(function() {
    'use strict';

    // State management
    let allJobs = [];
    let filteredJobs = [];
    let availableFilters = {
        locations: [],
        contract_types: []
    };

    // DOM elements
    const elements = {
        loadingState: document.getElementById('loading-state'),
        errorState: document.getElementById('error-state'),
        errorMessage: document.getElementById('error-message'),
        noResultsState: document.getElementById('no-results-state'),
        resultsHeader: document.getElementById('results-header'),
        resultsCount: document.getElementById('results-count'),
        jobsList: document.getElementById('jobs-list'),

        // Filters
        searchFilter: document.getElementById('search-filter'),
        locationFilter: document.getElementById('location-filter'),
        contractFilter: document.getElementById('contract-filter'),
        salaryFilter: document.getElementById('salary-filter'),
        showClosedCheckbox: document.getElementById('show-closed'),
        sortFilter: document.getElementById('sort-filter'),

        // Buttons
        applyFiltersBtn: document.getElementById('apply-filters'),
        clearFiltersBtn: document.getElementById('clear-filters')
    };

    /**
     * Fetch jobs from the API
     */
    async function fetchJobs() {
        try {
            showLoading(true);
            hideError();

            // Construct API URL using config
            const apiUrl = `${GCC_CONFIG.JOBS_API_BASE_URL}${GCC_CONFIG.ENDPOINTS.JOBS}`;
            const params = new URLSearchParams({
                council: 'all',  // Show all jobs (county, city, social work, fire, etc.)
                include_closed: 'false'
            });

            const response = await fetch(`${apiUrl}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${GCC_CONFIG.JOBS_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch jobs');
            }

            // Store jobs and filter options
            allJobs = data.jobs || [];
            availableFilters = data.available_filters || { locations: [], contract_types: [] };

            // Populate filter dropdowns
            populateFilterDropdowns();

            // Initial render
            applyFiltersAndRender();

            showLoading(false);

        } catch (error) {
            console.error('Error fetching jobs:', error);
            showError(error.message);
            showLoading(false);
        }
    }

    /**
     * Populate filter dropdowns with available options
     */
    function populateFilterDropdowns() {
        // Populate locations
        if (availableFilters.locations && availableFilters.locations.length > 0) {
            elements.locationFilter.innerHTML = '<option value="">All locations</option>';
            availableFilters.locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                elements.locationFilter.appendChild(option);
            });
        }

        // Populate contract types
        if (availableFilters.contract_types && availableFilters.contract_types.length > 0) {
            elements.contractFilter.innerHTML = '<option value="">All contract types</option>';
            availableFilters.contract_types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                elements.contractFilter.appendChild(option);
            });
        }
    }

    /**
     * Apply filters and render jobs
     */
    function applyFiltersAndRender() {
        // Get filter values
        const searchTerm = elements.searchFilter.value.toLowerCase().trim();
        const selectedLocation = elements.locationFilter.value;
        const selectedContract = elements.contractFilter.value;
        const minSalary = parseInt(elements.salaryFilter.value) || 0;
        const showClosed = elements.showClosedCheckbox.checked;

        // Filter jobs
        filteredJobs = allJobs.filter(job => {
            // Search filter
            if (searchTerm && !job.title.toLowerCase().includes(searchTerm)) {
                return false;
            }

            // Location filter
            if (selectedLocation && job.location !== selectedLocation) {
                return false;
            }

            // Contract type filter
            if (selectedContract && job.contract_type !== selectedContract) {
                return false;
            }

            // Salary filter
            if (minSalary > 0 && (!job.salary_min || job.salary_min < minSalary)) {
                return false;
            }

            // Closed jobs filter
            if (!showClosed && job.is_closed) {
                return false;
            }

            return true;
        });

        // Sort jobs
        sortJobs();

        // Render
        renderJobs();
    }

    /**
     * Sort jobs based on selected sort option
     */
    function sortJobs() {
        const sortBy = elements.sortFilter.value;

        filteredJobs.sort((a, b) => {
            switch (sortBy) {
                case 'closing-soon':
                    // Closed jobs last, then by days until close
                    if (a.is_closed && !b.is_closed) return 1;
                    if (!a.is_closed && b.is_closed) return -1;
                    return (a.days_until_close || 999) - (b.days_until_close || 999);

                case 'closing-latest':
                    // Closed jobs last, then by days until close (reverse)
                    if (a.is_closed && !b.is_closed) return 1;
                    if (!a.is_closed && b.is_closed) return -1;
                    return (b.days_until_close || 999) - (a.days_until_close || 999);

                case 'salary-high':
                    return (b.salary_max || b.salary_min || 0) - (a.salary_max || a.salary_min || 0);

                case 'salary-low':
                    return (a.salary_min || a.salary_max || 0) - (b.salary_min || b.salary_max || 0);

                case 'title-az':
                    return a.title.localeCompare(b.title);

                case 'title-za':
                    return b.title.localeCompare(a.title);

                default:
                    return 0;
            }
        });
    }

    /**
     * Render jobs list
     */
    function renderJobs() {
        // Update results count
        const count = filteredJobs.length;
        elements.resultsCount.innerHTML = `<strong>${count}</strong> job${count !== 1 ? 's' : ''} found`;
        elements.resultsHeader.style.display = 'flex';

        // Clear existing jobs
        elements.jobsList.innerHTML = '';

        // Show/hide no results state
        if (count === 0) {
            elements.noResultsState.style.display = 'block';
            elements.jobsList.style.display = 'none';
        } else {
            elements.noResultsState.style.display = 'none';
            elements.jobsList.style.display = 'flex';

            // Render each job
            filteredJobs.forEach(job => {
                const jobCard = createJobCard(job);
                elements.jobsList.appendChild(jobCard);
            });
        }

        // Announce to screen readers
        const announcement = count === 0
            ? 'No jobs found. Try adjusting your filters.'
            : `${count} job${count !== 1 ? 's' : ''} found.`;
        elements.resultsCount.setAttribute('aria-label', announcement);
    }

    /**
     * Get council badge HTML
     */
    function getCouncilBadge(councilType) {
        const badges = {
            'city': { text: 'City Council', color: '#3b82f6' },
            'county': { text: 'County Council', color: '#059669' },
            'adults_social': { text: 'Adult Social Work', color: '#8b5cf6' },
            'childrens_social': { text: "Children's Social Work", color: '#ec4899' },
            'fire': { text: 'Fire & Rescue', color: '#ef4444' }
        };

        const badge = badges[councilType] || { text: councilType, color: '#64748b' };

        return `<span style="display: inline-block; background: ${badge.color}; color: white; padding: 0.375rem 0.75rem; border-radius: 999px; font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.75rem;">${badge.text}</span>`;
    }

    /**
     * Create job card element
     */
    function createJobCard(job) {
        const card = document.createElement('article');
        card.className = 'job-card';
        card.setAttribute('role', 'listitem');

        // Format salary
        let salaryText = 'Salary not specified';
        if (job.salary) {
            salaryText = job.salary;
        } else if (job.salary_min && job.salary_max) {
            salaryText = `£${job.salary_min.toLocaleString()} - £${job.salary_max.toLocaleString()}`;
        } else if (job.salary_min) {
            salaryText = `From £${job.salary_min.toLocaleString()}`;
        } else if (job.salary_max) {
            salaryText = `Up to £${job.salary_max.toLocaleString()}`;
        }

        // Format closing date
        let closingDateHTML = '';
        if (job.is_closed) {
            closingDateHTML = '<span class="job-closed">Position closed</span>';
        } else if (job.closing_date) {
            const urgentClass = job.is_closing_soon ? ' urgent' : '';
            const daysText = job.days_until_close !== undefined
                ? ` (${job.days_until_close} day${job.days_until_close !== 1 ? 's' : ''} left)`
                : '';
            closingDateHTML = `<span class="job-closing${urgentClass}">⏰ Closes: ${job.closing_date}${daysText}</span>`;
        }

        card.innerHTML = `
            <div class="job-header">
                ${getCouncilBadge(job.council)}
                <h3 class="job-title">
                    <a href="${job.url || '#'}" target="_blank" rel="noopener">
                        ${escapeHtml(job.title)}
                    </a>
                </h3>
            </div>

            <div class="job-meta">
                ${job.location ? `
                    <div class="job-meta-item">
                        <span class="job-meta-icon" aria-hidden="true">📍</span>
                        <span>${escapeHtml(job.location)}</span>
                    </div>
                ` : ''}

                ${job.contract_type ? `
                    <div class="job-meta-item">
                        <span class="job-meta-icon" aria-hidden="true">📄</span>
                        <span>${escapeHtml(job.contract_type)}</span>
                    </div>
                ` : ''}

                <div class="job-meta-item job-salary">
                    <span class="job-meta-icon" aria-hidden="true">💰</span>
                    <span>${salaryText}</span>
                </div>
            </div>

            ${closingDateHTML ? `<div style="margin-bottom: 1rem;">${closingDateHTML}</div>` : ''}

            <div class="job-actions">
                <a href="${job.url || '#'}"
                   class="btn-apply"
                   target="_blank"
                   rel="noopener"
                   ${job.is_closed ? 'style="opacity: 0.6; pointer-events: none;"' : ''}>
                    ${job.is_closed ? 'Position Closed' : 'View details & apply'}
                    ${!job.is_closed ? '<span aria-hidden="true">→</span>' : ''}
                </a>
            </div>
        `;

        return card;
    }

    /**
     * Clear all filters
     */
    function clearFilters() {
        elements.searchFilter.value = '';
        elements.locationFilter.value = '';
        elements.contractFilter.value = '';
        elements.salaryFilter.value = '';
        elements.showClosedCheckbox.checked = false;
        elements.sortFilter.value = 'closing-soon';

        applyFiltersAndRender();
    }

    /**
     * Show/hide loading state
     */
    function showLoading(show) {
        elements.loadingState.style.display = show ? 'block' : 'none';
        if (!show) {
            elements.resultsHeader.style.display = 'flex';
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        elements.errorMessage.textContent = message || 'An error occurred while loading jobs.';
        elements.errorState.style.display = 'block';
        elements.resultsHeader.style.display = 'none';
        elements.jobsList.style.display = 'none';
        elements.noResultsState.style.display = 'none';
    }

    /**
     * Hide error message
     */
    function hideError() {
        elements.errorState.style.display = 'none';
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Event listeners
     */
    function initEventListeners() {
        // Apply filters button
        elements.applyFiltersBtn.addEventListener('click', applyFiltersAndRender);

        // Clear filters button
        elements.clearFiltersBtn.addEventListener('click', clearFilters);

        // Sort change
        elements.sortFilter.addEventListener('change', applyFiltersAndRender);

        // Show closed checkbox
        elements.showClosedCheckbox.addEventListener('change', applyFiltersAndRender);

        // Enter key on search/filters
        elements.searchFilter.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyFiltersAndRender();
            }
        });

        elements.salaryFilter.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyFiltersAndRender();
            }
        });

        // Auto-apply on dropdown change
        elements.locationFilter.addEventListener('change', applyFiltersAndRender);
        elements.contractFilter.addEventListener('change', applyFiltersAndRender);
    }

    /**
     * Initialize the page
     */
    function init() {
        initEventListeners();
        fetchJobs();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
