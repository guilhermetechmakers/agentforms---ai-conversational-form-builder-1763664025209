import { format } from 'date-fns';
import { Bot, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/types/conversation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ChatMessageProps {
  message: ChatMessageType;
  agentAvatar?: string;
  agentColor?: string;
  isStreaming?: boolean;
}

export function ChatMessage({ message, agentAvatar, agentColor, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const hasError = message.metadata?.validation_error;

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3 animate-fade-in',
        isUser ? 'justify-end' : 'justify-start',
        isSystem && 'justify-center'
      )}
    >
      {!isUser && !isSystem && (
        <Avatar
          className="h-8 w-8 border-2"
          style={{ borderColor: agentColor || 'rgb(var(--primary))' }}
        >
          <AvatarImage src={agentAvatar} alt="Agent" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col gap-1 max-w-[80%] md:max-w-[70%]',
          isUser && 'items-end',
          !isUser && !isSystem && 'items-start',
          isSystem && 'items-center w-full'
        )}
      >
        {!isSystem && (
          <div className="flex items-center gap-2 text-xs text-medium-gray px-1">
            <span>{isUser ? 'You' : 'Agent'}</span>
            <span>•</span>
            <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
          </div>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm transition-all duration-200',
            isUser
              ? 'bg-primary text-primary-foreground'
              : isSystem
              ? 'bg-pale-gray text-foreground text-sm'
              : 'bg-white border border-pale-gray text-foreground',
            hasError && 'border-deep-orange border-2',
            isStreaming && 'animate-pulse'
          )}
        >
          {isSystem ? (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{message.content}</span>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content || (isStreaming ? '...' : '')}
              </p>
              {message.field_key && message.field_value !== undefined && (
                <div className="mt-2 pt-2 border-t border-pale-gray">
                  <Badge variant="outline" className="text-xs">
                    {message.field_key}: {String(message.field_value)}
                  </Badge>
                </div>
              )}
              {hasError && message.metadata?.validation_error && (
                <div className="mt-2 pt-2 border-t border-deep-orange/20">
                  <p className="text-xs text-deep-orange flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {message.metadata.validation_error}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {message.metadata?.token_usage && !isUser && message.metadata && (
          <div className="text-xs text-medium-gray px-1">
            Tokens: {message.metadata.token_usage.total} • Model: {message.metadata.model || 'default'}
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-medium-gray text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
