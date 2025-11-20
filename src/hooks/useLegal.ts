import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { legalApi } from '@/api/legal';
import type { 
  LegalDocumentType, 
  ConsentType, 
  CookiePreferences,
  ConsentRecord 
} from '@/types/legal';

// Query keys
export const legalKeys = {
  all: ['legal'] as const,
  documents: () => [...legalKeys.all, 'documents'] as const,
  document: (type: LegalDocumentType) => [...legalKeys.documents(), type] as const,
  latest: (type: LegalDocumentType) => [...legalKeys.document(type), 'latest'] as const,
  consent: () => [...legalKeys.all, 'consent'] as const,
  consentByType: (type?: ConsentType) => [...legalKeys.consent(), type] as const,
  cookiePreferences: () => [...legalKeys.consent(), 'cookies'] as const,
};

/**
 * Hook to fetch a legal document by type
 */
export function useLegalDocument(documentType: LegalDocumentType) {
  return useQuery({
    queryKey: legalKeys.document(documentType),
    queryFn: () => legalApi.getDocument(documentType),
    staleTime: 1000 * 60 * 60, // 1 hour - legal documents don't change often
  });
}

/**
 * Hook to fetch all legal documents
 */
export function useAllLegalDocuments() {
  return useQuery({
    queryKey: legalKeys.documents(),
    queryFn: () => legalApi.getAllDocuments(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch the latest version of a document
 */
export function useLatestDocumentVersion(documentType: LegalDocumentType) {
  return useQuery({
    queryKey: legalKeys.latest(documentType),
    queryFn: () => legalApi.getLatestVersion(documentType),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to record user consent
 */
export function useRecordConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (consent: ConsentRecord) => legalApi.recordConsent(consent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalKeys.consent() });
      toast.success('Consent preferences saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save consent preferences');
    },
  });
}

/**
 * Hook to get user consent history
 */
export function useUserConsent(consentType?: ConsentType) {
  return useQuery({
    queryKey: legalKeys.consentByType(consentType),
    queryFn: () => legalApi.getUserConsent(consentType),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to update cookie preferences
 */
export function useUpdateCookiePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: CookiePreferences) => 
      legalApi.updateCookiePreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalKeys.cookiePreferences() });
      toast.success('Cookie preferences updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update cookie preferences');
    },
  });
}

/**
 * Hook to get current cookie preferences
 */
export function useCookiePreferences() {
  return useQuery({
    queryKey: legalKeys.cookiePreferences(),
    queryFn: () => legalApi.getCookiePreferences(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry if user hasn't set preferences yet
  });
}

/**
 * Hook to download DPA document
 */
export function useDownloadDPA() {
  return useMutation({
    mutationFn: () => legalApi.downloadDPA(),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data-processing-addendum.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('DPA document downloaded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to download DPA document');
    },
  });
}
