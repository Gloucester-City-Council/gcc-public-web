/**
 * Global Configuration
 * Centralized configuration for API endpoints and shared constants
 */
const GCC_CONFIG = {
    // API Configuration
    API_BASE_URL: 'https://salmon-meadow-0dcf69803.2.azurestaticapps.net',
    API_TOKEN: 'oije8u23984uoriwfjowei2398470',

    // API Endpoints (relative to API_BASE_URL)
    ENDPOINTS: {
        POSTCODE_ADDRESSES: '/api/postcode-addresses',
        BINS_BY_UPRN: '/api/bins-by-uprn',
        SUBMIT_MISSED_COLLECTION: '/api/submitMissedCollection',
        SUBMIT_FEEDBACK: '/api/submitFeedback'
    }
};
