declare namespace Express {
  export interface Request {
    user?: any;
    admin?: any;
    isBot?: boolean;
    geoData?: {
      country?: string;
      city?: string;
      region?: string;
      ll?: number[];
      [key: string]: any;
    };
  }
}
