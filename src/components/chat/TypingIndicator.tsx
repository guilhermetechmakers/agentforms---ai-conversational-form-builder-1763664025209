import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  agentColor?: string;
  agentAvatar?: string;
}

export function TypingIndicator({ agentColor }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 px-4 py-3 animate-fade-in">
      <Avatar
        className="h-8 w-8 border-2"
        style={{ borderColor: agentColor || 'rgb(var(--primary))' }}
      >
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex items-center gap-1 bg-white border border-pale-gray rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <div className="h-2 w-2 bg-medium-gray rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-medium-gray rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-medium-gray rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
