import { api } from '@/lib/api';
import type {
  StartSessionInput,
  StartSessionResponse,
  SendMessageInput,
  ChatMessage,
  ConversationState,
  StreamingChunk,
} from '@/types/conversation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const conversationApi = {
  // Start a new conversation session
  startSession: async (input: StartSessionInput): Promise<StartSessionResponse> => {
    return api.post<StartSessionResponse>('/conversations/start', input);
  },

  // Send a message and get streaming response
  sendMessage: async (
    input: SendMessageInput,
    onChunk?: (chunk: StreamingChunk) => void
  ): Promise<{ message: ChatMessage; state: ConversationState }> => {
    // Use fetch with streaming for better control over headers and error handling
    // EventSource doesn't support custom headers, so we use fetch with ReadableStream
    return new Promise(async (resolve, reject) => {
      try {
        const params = new URLSearchParams({
          content: input.content,
        });
        if (input.field_key) params.append('field_key', input.field_key);
        if (input.field_value) params.append('field_value', JSON.stringify(input.field_value));

        const response = await fetch(
          `${API_URL}/conversations/${input.session_id}/message/stream?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'text/event-stream',
            },
          }
        );

        if (!response.ok) {
          // Fallback to non-streaming if streaming not available
          return conversationApi.sendMessageNonStreaming(input)
            .then(resolve)
            .catch(reject);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';
        let finalMessage: ChatMessage | null = null;
        let finalState: ConversationState | null = null;
        let hasError = false;

        if (!reader) {
          return conversationApi.sendMessageNonStreaming(input)
            .then(resolve)
            .catch(reject);
        }

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const chunk: StreamingChunk = JSON.parse(line.slice(6));

                if (chunk.type === 'error') {
                  hasError = true;
                  reject(new Error(chunk.error || 'Streaming error'));
                  return;
                }

                if (chunk.type === 'content' && chunk.content) {
                  fullContent += chunk.content;
                  onChunk?.(chunk);
                }

                if (chunk.type === 'field') {
                  onChunk?.(chunk);
                }

                if (chunk.type === 'status' && chunk.status) {
                  finalState = chunk.status;
                  onChunk?.(chunk);
                }

                if (chunk.type === 'done' && chunk.done) {
                  if (finalState && !hasError) {
                    finalMessage = {
                      id: `msg-${Date.now()}`,
                      role: 'assistant',
                      content: fullContent,
                      timestamp: new Date().toISOString(),
                      field_key: chunk.field_key,
                      field_value: chunk.field_value,
                    };

                    resolve({
                      message: finalMessage,
                      state: finalState,
                    });
                    return;
                  } else {
                    reject(new Error('Incomplete response'));
                    return;
                  }
                }
              } catch (error) {
                // Skip invalid JSON lines
                continue;
              }
            }
          }
        }

        // If we get here without a done message, fallback to non-streaming
        if (!finalMessage) {
          return conversationApi.sendMessageNonStreaming(input)
            .then(resolve)
            .catch(reject);
        }
      } catch (error) {
        // Fallback to non-streaming on any error
        return conversationApi.sendMessageNonStreaming(input)
          .then(resolve)
          .catch(reject);
      }
    });
  },

  // Non-streaming fallback
  sendMessageNonStreaming: async (
    input: SendMessageInput
  ): Promise<{ message: ChatMessage; state: ConversationState }> => {
    return api.post<{ message: ChatMessage; state: ConversationState }>(
      `/conversations/${input.session_id}/message`,
      {
        content: input.content,
        field_key: input.field_key,
        field_value: input.field_value,
      }
    );
  },

  // Get conversation state
  getState: async (sessionId: string): Promise<ConversationState> => {
    return api.get<ConversationState>(`/conversations/${sessionId}/state`);
  },

  // Get conversation messages
  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    return api.get<ChatMessage[]>(`/conversations/${sessionId}/messages`);
  },
};
