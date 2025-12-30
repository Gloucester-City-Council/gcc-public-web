/**
 * Gloucester City Council - Main JavaScript
 * Mobile menu and accessibility enhancements includes feedback
 */

(function() {
    'use strict';
    
    /**
     * Mobile Menu Toggle
     */
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navList = document.querySelector('.nav-list');
        
        if (!menuToggle || !navList) return;
        
        // Toggle menu on button click
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = navList.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', isOpen);
            
            // Update button text
            menuToggle.textContent = isOpen ? 'Close' : 'Menu';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.main-nav')) {
                closeMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navList.classList.contains('is-open')) {
                closeMenu();
                menuToggle.focus();
            }
        });
        
        // Close menu when clicking nav links
        const navLinks = navList.querySelectorAll('a');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });
        
        function closeMenu() {
            navList.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.textContent = 'Menu';
        }
    }
    
    /**
     * Smooth Scroll for Anchor Links
     */
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') return;
                
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    
                    // Scroll to target
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Focus target for accessibility
                    target.focus();
                    
                    // Update URL without jumping
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }
                }
            });
        });
    }

    /**
     * Add feedback functions
     */
    function initFeedbackWidget() {
        const panel = document.querySelector('.feedback-panel');
        if (!panel) return;

        const buttons = panel.querySelectorAll('.feedback-btn');
        const form = panel.querySelector('#feedback-form');
        const thanks = panel.querySelector('#feedback-thanks');
        const prompt = panel.querySelector('#feedback-prompt');
        const commentsField = panel.querySelector('#feedback-comments');
        const emailField = panel.querySelector('#feedback-email');

        form.hidden = true;
        thanks.hidden = true;

        if (!buttons.length || !form || !thanks || !prompt || !commentsField || !emailField) {
            return;
        }

        let selectedRating = null;
        let selectedUI = null;
        let feedbackSelect = null;

        // Create dropdown element (will be inserted dynamically)
        function createFeedbackDropdown(rating) {
            // Remove existing dropdown if present
            const existingSelect = form.querySelector('#feedback-category');
            if (existingSelect) {
                existingSelect.parentElement.remove();
            }

            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '1rem';

            const label = document.createElement('label');
            label.setAttribute('for', 'feedback-category');
            label.textContent = 'What best describes your feedback?';
            label.style.display = 'block';
            label.style.marginBottom = '0.5rem';
            label.style.fontWeight = '600';

            const select = document.createElement('select');
            select.id = 'feedback-category';
            select.name = 'feedback-category';
            select.required = true;
            select.style.width = '100%';
            select.style.padding = '0.75rem';
            select.style.borderRadius = '4px';
            select.style.border = '2px solid #d1d5db';
            select.style.fontSize = '1rem';
            select.style.marginBottom = '0.5rem';

            // Default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Please select --';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            // Different options based on rating
            const positiveOptions = [
                'Easy to use',
                'Found what I needed',
                'Clear and helpful information',
                'Good page layout',
                'Quick and efficient',
                'Other'
            ];

            const negativeOptions = [
                'Hard to find information',
                'Confusing layout or navigation',
                'Information is missing or unclear',
                'Broken link or technical error',
                'Page loads too slowly',
                'Other'
            ];

            const options = rating === 'positive' ? positiveOptions : negativeOptions;

            options.forEach(function(optionText) {
                const option = document.createElement('option');
                option.value = optionText;
                option.textContent = optionText;
                select.appendChild(option);
            });

            wrapper.appendChild(label);
            wrapper.appendChild(select);

            // Insert before the prompt paragraph
            form.insertBefore(wrapper, prompt);

            return select;
        }

        buttons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                selectedRating = btn.getAttribute('data-rating');
                selectedUI = selectedRating === 'positive' ? 'thumbs_up' : 'thumbs_down';

                // Create and insert dropdown
                feedbackSelect = createFeedbackDropdown(selectedRating);

                if (selectedRating === 'positive') {
                    prompt.textContent = 'Additional comments (optional)';
                } else {
                    prompt.textContent = 'Additional details (optional)';
                }

                // Update label for comments field to clarify it's now optional/additional
                const commentsLabel = form.querySelector('label[for="feedback-comments"]');
                if (commentsLabel) {
                    commentsLabel.textContent = 'Additional comments (optional)';
                }

                form.hidden = false;
                feedbackSelect.focus();
            });
        });

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!selectedRating) {
                console.warn('Feedback submitted without a rating - ignoring.');
                return;
            }

            const category = feedbackSelect ? feedbackSelect.value : '';
            const comments = commentsField.value.trim();
            const email = emailField.value.trim() || null;

            // Combine selection and comment in format: "Selection - comment"
            let combinedFeedback = category;
            if (comments) {
                combinedFeedback = category + ' - ' + comments;
            }

            const feedbackPayload = {
                pageUrl: window.location.href,
                serviceId: document.body.dataset.serviceId || 'unknown',
                rating: selectedRating,
                uiChoice: selectedUI,
                comments: combinedFeedback,
                email: email,
                journeyStage: 'after_attempt',
                userAgent: navigator.userAgent,
                referrer: document.referrer || null,
                source: 'static-site-v1',
                createdAt: new Date().toISOString()
            };

            console.log('Feedback event:', feedbackPayload);

            try {
                const response = await fetch('https://gcc-api-pilot.azurewebsites.net/api/submitFeedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-token': 'oije8u23984uoriwfjowei2398470'
                    },
                    body: JSON.stringify(feedbackPayload)
                });

                if (!response.ok) {
                    throw new Error('Failed to submit feedback');
                }

                const result = await response.json();
                console.log('Feedback submitted successfully:', result);

                form.hidden = true;
                thanks.hidden = false;

                // Clean up
                if (feedbackSelect && feedbackSelect.parentElement) {
                    feedbackSelect.parentElement.remove();
                }
                commentsField.value = '';
                emailField.value = '';
                selectedRating = null;
                selectedUI = null;
                feedbackSelect = null;

            } catch (error) {
                console.error('Error submitting feedback:', error);
                form.hidden = true;
                thanks.hidden = false;
            }
        });
    }
    
    /**
     * External Link Warning (Optional)
     */
    function markExternalLinks() {
        const links = document.querySelectorAll('a[href^="http"]');
        
        links.forEach(function(link) {
            const hostname = link.hostname;
            
            if (hostname && hostname !== window.location.hostname) {
                link.setAttribute('rel', 'external noopener');
                link.setAttribute('target', '_blank');
                
                const srText = document.createElement('span');
                srText.className = 'sr-only';
                srText.textContent = ' (opens in new window)';
                link.appendChild(srText);
            }
        });
    }
    
    /**
     * Add screen reader only class to CSS if not present
     */
    function addScreenReaderStyles() {
        if (document.querySelector('.sr-only')) return;
        
        const style = document.createElement('style');
        style.textContent = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border-width: 0;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Initialize all functions when DOM is ready
     */
    function init() {
        initMobileMenu();
        initSmoothScroll();
        initFeedbackWidget();
        
        console.log('Gloucester City Council - Site initialized');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
