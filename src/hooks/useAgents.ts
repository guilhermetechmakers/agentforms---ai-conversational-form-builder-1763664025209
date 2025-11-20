import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi } from '@/api/agents';
import { toast } from 'sonner';
import type { UpdateAgentInput } from '@/types/agent';

// Query keys
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (filters: string) => [...agentKeys.lists(), { filters }] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
};

// Get all agents
export const useAgents = () => {
  return useQuery({
    queryKey: agentKeys.lists(),
    queryFn: agentsApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get agent by ID
export const useAgent = (id: string) => {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: () => agentsApi.getById(id),
    enabled: !!id,
  });
};

// Get agent by slug (public)
export const useAgentBySlug = (slug: string | null) => {
  return useQuery({
    queryKey: [...agentKeys.all, 'slug', slug],
    queryFn: () => agentsApi.getBySlug(slug!),
    enabled: !!slug,
  });
};

// Create agent mutation
export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agentsApi.create,
    onSuccess: (newAgent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.setQueryData(agentKeys.detail(newAgent.id), newAgent);
      toast.success('Agent created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create agent: ${error.message}`);
    },
  });
};

// Update agent mutation
export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateAgentInput }) =>
      agentsApi.update(id, updates),
    onSuccess: (updatedAgent) => {
      queryClient.setQueryData(agentKeys.detail(updatedAgent.id), updatedAgent);
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('Agent updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update agent: ${error.message}`);
    },
  });
};

// Delete agent mutation
export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agentsApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: agentKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('Agent deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete agent: ${error.message}`);
    },
  });
};

// Duplicate agent mutation
export const useDuplicateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agentsApi.duplicate,
    onSuccess: (duplicatedAgent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.setQueryData(agentKeys.detail(duplicatedAgent.id), duplicatedAgent);
      toast.success('Agent duplicated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to duplicate agent: ${error.message}`);
    },
  });
};

// Publish agent mutation
export const usePublishAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agentsApi.publish,
    onSuccess: (publishedAgent) => {
      queryClient.setQueryData(agentKeys.detail(publishedAgent.id), publishedAgent);
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('Agent published successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish agent: ${error.message}`);
    },
  });
};
