export type LegalDocumentType = 
  | 'privacy-policy'
  | 'terms-of-service'
  | 'data-processing-addendum'
  | 'cookie-policy';

export type ConsentType = 
  | 'cookies'
  | 'dpa'
  | 'marketing';

export interface LegalDocument {
  id: string;
  documentType: LegalDocumentType;
  content: string;
  version: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserConsent {
  id: string;
  userId: string;
  consentType: ConsentType;
  consentGiven: boolean;
  timestamp: string;
  version?: string; // Version of the document when consent was given
}

export interface CookiePreferences {
  necessary: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface ConsentRecord {
  consentType: ConsentType;
  consentGiven: boolean;
  timestamp: string;
  version?: string;
}
