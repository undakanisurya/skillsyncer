// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5003';

export { API_BASE_URL };

// For backward compatibility, also export as default
export default API_BASE_URL;