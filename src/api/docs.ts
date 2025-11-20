import { api } from "@/lib/api";
import type {
  Documentation,
  Category,
  FAQ,
  Tutorial,
  DocumentationSearchResult,
} from "@/types/docs";

export const docsApi = {
  // Get all documentation
  getDocumentation: async (category?: string): Promise<Documentation[]> => {
    const endpoint = category
      ? `/docs/documentation?category=${category}`
      : "/docs/documentation";
    return api.get<Documentation[]>(endpoint);
  },

  // Get single documentation by ID or slug
  getDocumentationById: async (id: string): Promise<Documentation> => {
    return api.get<Documentation>(`/docs/documentation/${id}`);
  },

  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    return api.get<Category[]>("/docs/categories");
  },

  // Get all FAQs
  getFAQs: async (category?: string): Promise<FAQ[]> => {
    const endpoint = category
      ? `/docs/faqs?category=${category}`
      : "/docs/faqs";
    return api.get<FAQ[]>(endpoint);
  },

  // Get all tutorials
  getTutorials: async (category?: string): Promise<Tutorial[]> => {
    const endpoint = category
      ? `/docs/tutorials?category=${category}`
      : "/docs/tutorials";
    return api.get<Tutorial[]>(endpoint);
  },

  // Search documentation
  search: async (query: string): Promise<DocumentationSearchResult> => {
    return api.get<DocumentationSearchResult>(
      `/docs/search?q=${encodeURIComponent(query)}`
    );
  },

  // Create documentation (admin only)
  createDocumentation: async (
    data: Omit<Documentation, "id" | "last_updated" | "author">
  ): Promise<Documentation> => {
    return api.post<Documentation>("/docs/documentation", data);
  },

  // Update documentation (admin only)
  updateDocumentation: async (
    id: string,
    data: Partial<Documentation>
  ): Promise<Documentation> => {
    return api.put<Documentation>(`/docs/documentation/${id}`, data);
  },

  // Delete documentation (admin only)
  deleteDocumentation: async (id: string): Promise<void> => {
    return api.delete(`/docs/documentation/${id}`);
  },

  // Create FAQ (admin only)
  createFAQ: async (data: Omit<FAQ, "id">): Promise<FAQ> => {
    return api.post<FAQ>("/docs/faqs", data);
  },

  // Update FAQ (admin only)
  updateFAQ: async (id: string, data: Partial<FAQ>): Promise<FAQ> => {
    return api.put<FAQ>(`/docs/faqs/${id}`, data);
  },

  // Delete FAQ (admin only)
  deleteFAQ: async (id: string): Promise<void> => {
    return api.delete(`/docs/faqs/${id}`);
  },
};
