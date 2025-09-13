import { doubleCsrf } from 'csrf-csrf';

const { doubleCsrfProtection } = doubleCsrf({
    getSecret: (req) => (req?.session as any)?.csrfSecret || 'fallback-secret', 
    cookieName: 'XSRF-TOKEN', 
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], 
});

export { doubleCsrfProtection };
