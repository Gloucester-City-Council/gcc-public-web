/**
 * Gloucester City Council - Taxi Licensing Website
 * Shared JavaScript utilities
 */

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const menuButton = document.querySelector('.mobile-menu-button');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', isOpen);
      menuButton.textContent = isOpen ? '✕ Close' : '☰ Menu';
    });
  }
}

// ============================================
// TABS
// ============================================
function initTabs() {
  const tabLists = document.querySelectorAll('[role="tablist"]');

  tabLists.forEach(tabList => {
    const tabs = tabList.querySelectorAll('[role="tab"]');
    const panels = document.querySelectorAll('[role="tabpanel"]');

    // Set initial state from URL hash
    const hash = window.location.hash.slice(1);
    let activeTab = null;

    tabs.forEach(tab => {
      if (hash && tab.getAttribute('data-tab') === hash) {
        activeTab = tab;
      }
    });

    // If no hash match, use first tab
    if (!activeTab && tabs.length > 0) {
      activeTab = tabs[0];
    }

    if (activeTab) {
      activateTab(activeTab, tabs, panels);
    }

    // Tab click handlers
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab(tab, tabs, panels);

        // Update URL hash
        const tabId = tab.getAttribute('data-tab');
        window.location.hash = tabId;
      });

      // Keyboard navigation
      tab.addEventListener('keydown', (e) => {
        let newTab = null;

        if (e.key === 'ArrowRight') {
          newTab = tab.nextElementSibling || tabs[0];
        } else if (e.key === 'ArrowLeft') {
          newTab = tab.previousElementSibling || tabs[tabs.length - 1];
        } else if (e.key === 'Home') {
          newTab = tabs[0];
        } else if (e.key === 'End') {
          newTab = tabs[tabs.length - 1];
        }

        if (newTab) {
          e.preventDefault();
          newTab.focus();
          activateTab(newTab, tabs, panels);
        }
      });
    });
  });
}

function activateTab(activeTab, allTabs, allPanels) {
  const targetPanel = activeTab.getAttribute('data-tab');

  // Update tabs
  allTabs.forEach(tab => {
    const isActive = tab === activeTab;
    tab.setAttribute('aria-selected', isActive);
    tab.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  // Update panels
  allPanels.forEach(panel => {
    const isActive = panel.id === targetPanel;
    panel.setAttribute('aria-hidden', !isActive);
  });
}

// ============================================
// INTERACTIVE CHECKLIST
// ============================================
class Checklist {
  constructor(containerId, storageKey) {
    this.container = document.getElementById(containerId);
    this.storageKey = storageKey;
    this.state = this.loadState();

    if (this.container) {
      this.init();
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Failed to load checklist state:', e);
      return {};
    }
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save checklist state:', e);
    }
  }

  init() {
    // Find all checklist items
    const items = this.container.querySelectorAll('.checkbox-item');

    items.forEach((item, index) => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const stepNumber = index + 1;

      // Restore state
      if (this.state[stepNumber]?.completed) {
        checkbox.checked = true;
        item.classList.add('completed');
      }

      // Checkbox change handler
      checkbox.addEventListener('change', () => {
        this.toggleStep(stepNumber, checkbox.checked, item);
      });
    });

    // Update progress bar
    this.updateProgress();

    // Add action buttons
    this.addActionButtons();
  }

  toggleStep(stepNumber, completed, itemElement) {
    this.state[stepNumber] = {
      completed: completed,
      timestamp: new Date().toISOString()
    };

    if (completed) {
      itemElement.classList.add('completed');
    } else {
      itemElement.classList.remove('completed');
    }

    this.saveState();
    this.updateProgress();
  }

  updateProgress() {
    const progressBar = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');

    if (!progressBar) return;

    const totalSteps = this.container.querySelectorAll('.checkbox-item').length;
    const completedSteps = Object.values(this.state).filter(s => s.completed).length;
    const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    progressBar.style.width = `${percentage}%`;

    if (progressText) {
      progressText.textContent = `${completedSteps} of ${totalSteps} steps completed (${percentage}%)`;
    }
  }

  addActionButtons() {
    const actionsContainer = this.container.querySelector('.checklist-actions');
    if (!actionsContainer) return;

    // Print button
    const printBtn = actionsContainer.querySelector('[data-action="print"]');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Reset button
    const resetBtn = actionsContainer.querySelector('[data-action="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
          this.state = {};
          this.saveState();

          // Uncheck all boxes
          this.container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
          });
          this.container.querySelectorAll('.checkbox-item').forEach(item => {
            item.classList.remove('completed');
          });

          this.updateProgress();
        }
      });
    }
  }

  export() {
    return {
      checklist: this.storageKey,
      completedSteps: Object.keys(this.state).filter(key => this.state[key].completed),
      totalSteps: this.container.querySelectorAll('.checkbox-item').length,
      lastUpdated: new Date().toISOString()
    };
  }
}

// ============================================
// EXPANDABLE SECTIONS
// ============================================
function initExpandables() {
  const steps = document.querySelectorAll('.checklist-step');

  steps.forEach(step => {
    const header = step.querySelector('.step-header');
    if (header) {
      header.addEventListener('click', () => {
        step.classList.toggle('expanded');
      });
    }
  });
}

// ============================================
// SMOOTH SCROLL TO ANCHORS
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Skip if it's just "#" or a tab control
      if (href === '#' || this.getAttribute('role') === 'tab') {
        return;
      }

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Update URL
        history.pushState(null, null, href);

        // Focus target for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    });
  });
}

// ============================================
// CONVICTION CHECKER (Information Page)
// ============================================
function initConvictionChecker() {
  const form = document.getElementById('conviction-checker-form');
  if (!form) return;

  // Minimum years from convictions_policy
  const minimumYears = {
    'violence': 10,
    'sexual': 15,
    'dishonesty': 7,
    'drugs_supply': 10,
    'drugs_possession': 7,
    'driving': 7,
    'public_order': 10
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const offenceType = formData.get('offence_type');
    const completionDate = new Date(formData.get('completion_date'));

    // Calculate years elapsed
    const now = new Date();
    const yearsElapsed = (now - completionDate) / (365.25 * 24 * 60 * 60 * 1000);

    const minimumRequired = minimumYears[offenceType];

    // Determine result
    let result = {
      likelihood: '',
      alertType: '',
      assessment: '',
      nextSteps: ''
    };

    if (yearsElapsed >= minimumRequired) {
      result.likelihood = 'Likely to be considered';
      result.alertType = 'success';
      result.assessment = `You have passed the minimum time period of ${minimumRequired} years. Your application will be considered on individual merits.`;
      result.nextSteps = 'You can apply. Be completely honest about your conviction on the application form.';
    } else if (yearsElapsed >= minimumRequired * 0.8) {
      result.likelihood = 'Unclear - individual assessment needed';
      result.alertType = 'warning';
      result.assessment = `You are approaching the minimum time period of ${minimumRequired} years (${yearsElapsed.toFixed(1)} years have elapsed). The council will consider individual circumstances.`;
      result.nextSteps = 'Contact the licensing team at licensing@gloucester.gov.uk to discuss your circumstances before applying.';
    } else {
      result.likelihood = 'Unlikely at this time';
      result.alertType = 'danger';
      result.assessment = `The minimum time period is ${minimumRequired} years. ${yearsElapsed.toFixed(1)} years have elapsed since completion of your sentence.`;
      result.nextSteps = 'It is unlikely a licence will be granted at this time. You can contact the licensing team for advice about your specific circumstances.';
    }

    // Display result
    displayConvictionResult(result, minimumRequired, yearsElapsed);
  });
}

function displayConvictionResult(result, minimumYears, yearsElapsed) {
  const resultPanel = document.getElementById('conviction-result');
  if (!resultPanel) return;

  resultPanel.innerHTML = `
    <div class="card">
      <h3>Assessment Result</h3>

      <div class="alert alert-${result.alertType}">
        <div class="alert-content">
          <strong>${result.likelihood}</strong>
        </div>
      </div>

      <div class="result-details">
        <p><strong>Time period from policy:</strong> ${minimumYears} years from completion of sentence</p>
        <p><strong>Time elapsed:</strong> ${yearsElapsed.toFixed(1)} years</p>
        <p><strong>Assessment:</strong> ${result.assessment}</p>
      </div>

      <div class="alert alert-info">
        <div class="alert-content">
          <strong>Next steps:</strong><br>
          ${result.nextSteps}
        </div>
      </div>

      <p class="text-small mt-md">
        <strong>Important:</strong> This is guidance only. Each case is assessed individually based on all circumstances.
        <a href="#full-conviction-policy">Read the full conviction policy</a> for more details.
      </p>
    </div>
  `;

  resultPanel.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initTabs();
  initExpandables();
  initSmoothScroll();
  initConvictionChecker();

  // Initialize checklists if present
  if (document.getElementById('driver-checklist')) {
    window.driverChecklist = new Checklist('driver-checklist', 'gcc-driver-checklist');
  }
});

// Export for use in other modules
export { Checklist, initTabs, initConvictionChecker };
