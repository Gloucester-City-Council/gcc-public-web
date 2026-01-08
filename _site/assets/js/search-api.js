/**
 * Search API integration
 */

(function() {
    'use strict';

    const config = window.GCC_CONFIG || {};
    const apiBaseUrl = config.API_BASE_URL || '';
    const apiToken = config.API_TOKEN || '';
    const searchEndpoint = `${apiBaseUrl}/api/search/search`;
    const defaultLimit = 10;

    const form = document.querySelector('.search-form');
    const input = document.querySelector('#search-input');
    const resultsContainer = document.querySelector('#search-results');

    if (!form || !input || !resultsContainer) {
        return;
    }

    let debounceTimer = null;
    let lastRequestId = 0;

    function clearResults() {
        resultsContainer.innerHTML = '';
        resultsContainer.hidden = true;
        input.setAttribute('aria-expanded', 'false');
    }

    function showLoading() {
        resultsContainer.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'search-results__loading';
        wrapper.textContent = 'Searching...';
        resultsContainer.appendChild(wrapper);
        resultsContainer.hidden = false;
        input.setAttribute('aria-expanded', 'true');
    }

    function showMessage(message, className) {
        resultsContainer.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = className;
        wrapper.textContent = message;
        resultsContainer.appendChild(wrapper);
        resultsContainer.hidden = false;
        input.setAttribute('aria-expanded', 'true');
    }

    function renderResults(results) {
        if (!Array.isArray(results) || results.length === 0) {
            showMessage('No results found.', 'search-results__message');
            return;
        }

        const list = document.createElement('ul');
        list.className = 'search-results__list';

        results.forEach(function(result) {
            const title = result.title || result.name || 'Untitled result';
            const url = result.url || result.link || '#';
            const snippet = result.snippet || result.description || '';

            const item = document.createElement('li');
            item.className = 'search-results__item';

            const link = document.createElement('a');
            link.href = url;
            link.textContent = title;

            const snippetEl = document.createElement('p');
            snippetEl.className = 'search-results__snippet';
            snippetEl.textContent = snippet;

            item.appendChild(link);
            if (snippet) {
                item.appendChild(snippetEl);
            }

            list.appendChild(item);
        });

        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(list);
        resultsContainer.hidden = false;
        input.setAttribute('aria-expanded', 'true');
    }

    async function fetchResults(query) {
        const trimmedQuery = query.trim();

        if (trimmedQuery.length < 2) {
            clearResults();
            return;
        }

        const currentRequestId = ++lastRequestId;

        showLoading();

        const params = new URLSearchParams({
            q: trimmedQuery,
            limit: String(defaultLimit)
        });

        if (form.dataset.reload) {
            params.set('reload', form.dataset.reload);
        }

        const url = `${searchEndpoint}?${params.toString()}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'x-api-token': apiToken
                }
            });

            if (!response.ok) {
                throw new Error('Search request failed');
            }

            const data = await response.json();
            const results = Array.isArray(data)
                ? data
                : (data && (data.results || data.items || []));

            if (currentRequestId !== lastRequestId) {
                return;
            }

            renderResults(results || []);
        } catch (error) {
            if (currentRequestId !== lastRequestId) {
                return;
            }
            showMessage('We could not load search results. Please try again.', 'search-results__error');
        }
    }

    function handleInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
            fetchResults(input.value);
        }, 300);
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        fetchResults(input.value);
    });

    input.addEventListener('input', handleInput);

    // Keyboard navigation: Arrow down from input goes to first result
    input.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' && !resultsContainer.hidden) {
            e.preventDefault();
            const firstLink = resultsContainer.querySelector('a');
            if (firstLink) firstLink.focus();
        }
    });

    // Navigate within results
    resultsContainer.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const links = Array.from(resultsContainer.querySelectorAll('a'));
            const currentIndex = links.indexOf(document.activeElement);

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (currentIndex === 0) {
                    input.focus();
                } else if (currentIndex > 0) {
                    links[currentIndex - 1].focus();
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (currentIndex < links.length - 1) {
                    links[currentIndex + 1].focus();
                }
            }
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !resultsContainer.hidden) {
            clearResults();
            input.focus();
        }
    });

    // Close on click outside
    document.addEventListener('click', function(e) {
        const searchWrapper = form.closest('.search-wrapper');
        if (searchWrapper && !searchWrapper.contains(e.target)) {
            clearResults();
        }
    });

    clearResults();
})();
