import { api } from '@/lib/api';
import type { 
  LegalDocument, 
  LegalDocumentType, 
  UserConsent, 
  ConsentType,
  CookiePreferences,
  ConsentRecord 
} from '@/types/legal';

// Legal Documents API
export const legalApi = {
  /**
   * Get a legal document by type
   */
  getDocument: async (documentType: LegalDocumentType): Promise<LegalDocument> => {
    return api.get<LegalDocument>(`/legal/documents/${documentType}`);
  },

  /**
   * Get all legal documents
   */
  getAllDocuments: async (): Promise<LegalDocument[]> => {
    return api.get<LegalDocument[]>('/legal/documents');
  },

  /**
   * Get the latest version of a document
   */
  getLatestVersion: async (documentType: LegalDocumentType): Promise<LegalDocument> => {
    return api.get<LegalDocument>(`/legal/documents/${documentType}/latest`);
  },

  /**
   * Record user consent
   */
  recordConsent: async (consent: ConsentRecord): Promise<UserConsent> => {
    return api.post<UserConsent>('/legal/consent', consent);
  },

  /**
   * Get user consent history
   */
  getUserConsent: async (consentType?: ConsentType): Promise<UserConsent[]> => {
    const endpoint = consentType 
      ? `/legal/consent?type=${consentType}`
      : '/legal/consent';
    return api.get<UserConsent[]>(endpoint);
  },

  /**
   * Update cookie preferences
   */
  updateCookiePreferences: async (preferences: CookiePreferences): Promise<void> => {
    return api.post<void>('/legal/consent/cookies', preferences);
  },

  /**
   * Get current cookie preferences
   */
  getCookiePreferences: async (): Promise<CookiePreferences> => {
    return api.get<CookiePreferences>('/legal/consent/cookies');
  },

  /**
   * Download DPA document
   */
  downloadDPA: async (): Promise<Blob> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/legal/documents/data-processing-addendum/download`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to download DPA');
    }
    
    return response.blob();
  },
};
