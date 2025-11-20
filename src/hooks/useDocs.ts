import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { docsApi } from "@/api/docs";
import type {
  Documentation,
  FAQ,
} from "@/types/docs";
import { toast } from "sonner";

// Query keys
export const docsKeys = {
  all: ["docs"] as const,
  documentation: (category?: string) =>
    [...docsKeys.all, "documentation", category] as const,
  documentationById: (id: string) =>
    [...docsKeys.all, "documentation", id] as const,
  categories: () => [...docsKeys.all, "categories"] as const,
  faqs: (category?: string) => [...docsKeys.all, "faqs", category] as const,
  tutorials: (category?: string) =>
    [...docsKeys.all, "tutorials", category] as const,
  search: (query: string) => [...docsKeys.all, "search", query] as const,
};

// Get all documentation
export function useDocumentation(category?: string) {
  return useQuery({
    queryKey: docsKeys.documentation(category),
    queryFn: () => docsApi.getDocumentation(category),
  });
}

// Get single documentation
export function useDocumentationById(id: string) {
  return useQuery({
    queryKey: docsKeys.documentationById(id),
    queryFn: () => docsApi.getDocumentationById(id),
    enabled: !!id,
  });
}

// Get categories
export function useCategories() {
  return useQuery({
    queryKey: docsKeys.categories(),
    queryFn: () => docsApi.getCategories(),
  });
}

// Get FAQs
export function useFAQs(category?: string) {
  return useQuery({
    queryKey: docsKeys.faqs(category),
    queryFn: () => docsApi.getFAQs(category),
  });
}

// Get tutorials
export function useTutorials(category?: string) {
  return useQuery({
    queryKey: docsKeys.tutorials(category),
    queryFn: () => docsApi.getTutorials(category),
  });
}

// Search documentation
export function useSearchDocs(query: string) {
  return useQuery({
    queryKey: docsKeys.search(query),
    queryFn: () => docsApi.search(query),
    enabled: query.length > 0,
  });
}

// Create documentation
export function useCreateDocumentation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Documentation, "id" | "last_updated" | "author">) =>
      docsApi.createDocumentation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docsKeys.all });
      toast.success("Documentation created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create documentation");
    },
  });
}

// Update documentation
export function useUpdateDocumentation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Documentation>;
    }) => docsApi.updateDocumentation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docsKeys.all });
      toast.success("Documentation updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update documentation");
    },
  });
}

// Delete documentation
export function useDeleteDocumentation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => docsApi.deleteDocumentation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docsKeys.all });
      toast.success("Documentation deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete documentation");
    },
  });
}

// Create FAQ
export function useCreateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<FAQ, "id">) => docsApi.createFAQ(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docsKeys.all });
      toast.success("FAQ created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create FAQ");
    },
  });
}

// Update FAQ
export function useUpdateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FAQ> }) =>
      docsApi.updateFAQ(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docsKeys.all });
      toast.success("FAQ updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update FAQ");
    },
  });
}

// Delete FAQ
export function useDeleteFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => docsApi.deleteFAQ(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docsKeys.all });
      toast.success("FAQ deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete FAQ");
    },
  });
}
