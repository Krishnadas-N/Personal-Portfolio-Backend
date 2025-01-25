import 'express-session';

declare module 'express-session' {
    interface SessionData {
        csrfSecret?: string; // Add the custom property
    }
}
