import { doubleCsrf } from 'csrf-csrf';

const { doubleCsrfProtection } = doubleCsrf({
    getSecret: (req) => req?.session?.csrfSecret, 
    cookieName: 'XSRF-TOKEN', 
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], 
});

export { doubleCsrfProtection };
