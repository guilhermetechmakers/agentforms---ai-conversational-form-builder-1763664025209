import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationApi } from '@/api/conversation';
import { toast } from 'sonner';
import type {
  StartSessionInput,
  SendMessageInput,
  ChatMessage,
  ConversationState,
  StreamingChunk,
} from '@/types/conversation';

// Query keys
export const conversationKeys = {
  all: ['conversations'] as const,
  sessions: () => [...conversationKeys.all, 'sessions'] as const,
  session: (sessionId: string) => [...conversationKeys.sessions(), sessionId] as const,
  state: (sessionId: string) => [...conversationKeys.session(sessionId), 'state'] as const,
  messages: (sessionId: string) => [...conversationKeys.session(sessionId), 'messages'] as const,
};

// Start conversation hook
export const useStartConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StartSessionInput) => conversationApi.startSession(input),
    onSuccess: (data) => {
      queryClient.setQueryData(conversationKeys.session(data.session_id), data);
      queryClient.setQueryData(conversationKeys.state(data.session_id), data.conversation_state);
      if (data.initial_message) {
        queryClient.setQueryData(conversationKeys.messages(data.session_id), [data.initial_message]);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to start conversation: ${error.message}`);
    },
  });
};

// Get conversation state
export const useConversationState = (sessionId: string | null) => {
  return useQuery({
    queryKey: conversationKeys.state(sessionId!),
    queryFn: () => conversationApi.getState(sessionId!),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const state = query.state.data as ConversationState | undefined;
      // Only refetch if conversation is active
      return state?.status === 'active' ? 5000 : false;
    },
  });
};

// Get conversation messages
export const useConversationMessages = (sessionId: string | null) => {
  return useQuery({
    queryKey: conversationKeys.messages(sessionId!),
    queryFn: () => conversationApi.getMessages(sessionId!),
    enabled: !!sessionId,
  });
};

// Send message hook with streaming support
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      input,
      onChunk,
    }: {
      input: SendMessageInput;
      onChunk?: (chunk: StreamingChunk) => void;
    }) => {
      return conversationApi.sendMessage(input, onChunk);
    },
    onSuccess: (data, variables) => {
      // Update messages
      const messagesKey = conversationKeys.messages(variables.input.session_id);
      const currentMessages = queryClient.getQueryData<ChatMessage[]>(messagesKey) || [];
      queryClient.setQueryData(messagesKey, [...currentMessages, data.message]);

      // Update state
      const stateKey = conversationKeys.state(variables.input.session_id);
      queryClient.setQueryData(stateKey, data.state);

      // If conversation is completed, show success
      if (data.state.status === 'completed') {
        toast.success('Conversation completed!');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });
};

// Custom hook for managing conversation UI state
export const useConversation = (sessionId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const streamingMessageRef = useRef<ChatMessage | null>(null);

  // Load initial messages and state
  const { data: initialMessages } = useConversationMessages(sessionId);
  const { data: initialState } = useConversationState(sessionId);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (initialState) {
      setConversationState(initialState);
    }
  }, [initialState]);

  const sendMessageMutation = useSendMessage();

  const sendMessage = useCallback(
    async (content: string, fieldKey?: string, fieldValue?: any) => {
      if (!sessionId) return;

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        field_key: fieldKey,
        field_value: fieldValue,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingContent('');

      // Create placeholder for assistant message
      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      streamingMessageRef.current = assistantMessage;
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        await sendMessageMutation.mutateAsync({
          input: {
            session_id: sessionId,
            content,
            field_key: fieldKey,
            field_value: fieldValue,
          },
          onChunk: (chunk: StreamingChunk) => {
            if (chunk.type === 'content' && chunk.content) {
              setStreamingContent((prev) => {
                const newContent = prev + chunk.content;
                // Update the assistant message in the messages array
                setMessages((prevMessages) => {
                  const updated = [...prevMessages];
                  const index = updated.findIndex((m) => m.id === assistantMessageId);
                  if (index !== -1) {
                    updated[index] = {
                      ...updated[index],
                      content: newContent,
                    };
                  }
                  return updated;
                });
                return newContent;
              });
            }

            if (chunk.type === 'status' && chunk.status) {
              setConversationState(chunk.status);
            }

            if (chunk.type === 'field') {
              // Update message with field information
              setMessages((prevMessages) => {
                const updated = [...prevMessages];
                const index = updated.findIndex((m) => m.id === assistantMessageId);
                if (index !== -1) {
                  updated[index] = {
                    ...updated[index],
                    field_key: chunk.field_key,
                    field_value: chunk.field_value,
                  };
                }
                return updated;
              });
            }
          },
        });

        // Final message will be set by the mutation's onSuccess
      } catch (error) {
        // Remove the placeholder message on error
        setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));
        toast.error('Failed to send message');
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
        streamingMessageRef.current = null;
      }
    },
    [sessionId, sendMessageMutation]
  );

  return {
    messages,
    conversationState,
    isStreaming,
    streamingContent,
    sendMessage,
    isLoading: sendMessageMutation.isPending,
  };
};
