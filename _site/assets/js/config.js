/**
 * Global Configuration
 * Centralized configuration for API endpoints and shared constants
 */
window.GCC_CONFIG = {
    // API Configuration
    API_BASE_URL: 'https://gccpublicliteapi-c3dsa8fmg7g3eydv.westeurope-01.azurewebsites.net',
    API_TOKEN: 'oije8u23984uoriwfjowei2398470',

    // API Endpoints (relative to API_BASE_URL)
    ENDPOINTS: {
        ADDRESS_LOOKUP: '/api/addresses/lookup',
        BINS_BY_ADDRESS: '/api/bins/by-address',
        BINS_WEBCAL: '/api/bins/webcal',
        COUNCILLORS: '/api/about/councillors',
        SUBMIT_MISSED_COLLECTION: '/api/submitMissedCollection',
        SUBMIT_FEEDBACK: '/api/submitFeedback',
        SUBSCRIPTIONS_BINS: '/api/subscriptions/bins',
        JOBS: '/api/jobs/getJobs',
        PAYMENTS_CREATE: '/api/payments/create',
        PAYMENTS_STATUS: '/api/payments'
    },

    // Jobs API Configuration (uses same public API base)
    JOBS_API_BASE_URL: 'https://gccpublicliteapi-c3dsa8fmg7g3eydv.westeurope-01.azurewebsites.net',
    JOBS_API_TOKEN: 'oije8u23984uoriwfjowei2398470'
};
