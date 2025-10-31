export const API_CONFIG = {
  // Use VITE_* env vars when provided. Otherwise:
  // - In development: default to localhost ports
  // - In production: default to the deployed Render service URLs
  ISSUANCE_SERVICE_URL:
    import.meta.env.VITE_ISSUANCE_SERVICE_URL ||
    (import.meta.env.PROD
      ? 'https://kube-credential-issuance-service-cf63.onrender.com'
      : 'http://localhost:3001'),
  VERIFICATION_SERVICE_URL:
    import.meta.env.VITE_VERIFICATION_SERVICE_URL ||
    (import.meta.env.PROD
      ? 'https://kube-credential-verification-service-jxhx.onrender.com'
      : 'http://localhost:3002'),
};
