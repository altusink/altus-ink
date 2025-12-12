// Subdomain middleware for artist booking pages
// Handles routing: artist.altusink.io -> /book/artist

import type { Request, Response, NextFunction } from 'express';

interface SubdomainConfig {
  mainDomain: string;
  excludedSubdomains: string[];
}

const DEFAULT_CONFIG: SubdomainConfig = {
  mainDomain: 'altusink.io',
  excludedSubdomains: ['www', 'api', 'app', 'admin', 'dashboard', 'staging', 'dev'],
};

export function createSubdomainMiddleware(config: Partial<SubdomainConfig> = {}) {
  const { mainDomain, excludedSubdomains } = { ...DEFAULT_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    const host = req.headers.host || '';
    
    // Skip if localhost or IP address
    if (host.includes('localhost') || host.includes('127.0.0.1') || /^\d+\.\d+\.\d+\.\d+/.test(host)) {
      return next();
    }

    // Skip if replit domain (for development)
    if (host.includes('.replit.dev') || host.includes('.repl.co')) {
      return next();
    }

    // Extract subdomain from host
    const hostWithoutPort = host.split(':')[0];
    const parts = hostWithoutPort.split('.');
    
    // Check if it's a subdomain of the main domain
    // Format: subdomain.altusink.io or subdomain.www.altusink.io
    if (parts.length >= 3) {
      const subdomain = parts[0].toLowerCase();
      
      // Skip excluded subdomains
      if (excludedSubdomains.includes(subdomain)) {
        return next();
      }

      // Check if this is a request to the main domain
      const domainParts = mainDomain.split('.');
      const hostDomain = parts.slice(-domainParts.length).join('.');
      
      if (hostDomain === mainDomain) {
        // Rewrite URL to booking page
        if (!req.url.startsWith('/api/') && !req.url.startsWith('/book/')) {
          req.url = `/book/${subdomain}${req.url === '/' ? '' : req.url}`;
          console.log(`[subdomain] Rewriting ${host}${req.originalUrl} -> ${req.url}`);
        }
      }
    }

    next();
  };
}

export const subdomainMiddleware = createSubdomainMiddleware();
