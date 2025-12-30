/**
 * Global Configuration
 * Centralized configuration for API endpoints and shared constants
 */
const GCC_CONFIG = {
    // API Configuration
    API_BASE_URL: 'https://gccpublicliteapi-c3dsa8fmg7g3eydv.westeurope-01.azurewebsites.net',
    API_TOKEN: 'oije8u23984uoriwfjowei2398470',

    // API Endpoints (relative to API_BASE_URL)
    ENDPOINTS: {
        POSTCODE_ADDRESSES: '/api/postcode-addresses',
        BINS_BY_ADDRESS: '/api/bins/by-address',
        SUBMIT_MISSED_COLLECTION: '/api/submitMissedCollection',
        SUBMIT_FEEDBACK: '/api/submitFeedback'
    }
};
