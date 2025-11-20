import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Info, Share2, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { useStartConversation, useConversation } from '@/hooks/useConversation';
import { useAgentBySlug } from '@/hooks/useAgents';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ConversationProgress } from '@/components/chat/ConversationProgress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function PublicChatPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Get agent by slug
  const { data: agent, isLoading: isLoadingAgent } = useAgentBySlug(slug || null);

  const startConversationMutation = useStartConversation();
  const { messages, conversationState, isStreaming, sendMessage } = useConversation(sessionId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Start conversation when component mounts
  useEffect(() => {
    if (!slug) {
      toast.error('Invalid agent link');
      navigate('/');
      return;
    }

    // Check if agent requires password
    if (agent?.advanced?.publish_settings?.password_protected && !sessionId) {
      setShowPasswordDialog(true);
      return;
    }

    // Start conversation
    if (!sessionId && !startConversationMutation.isPending) {
      startConversationMutation.mutate(
        {
          agent_slug: slug,
          password: agent?.advanced?.publish_settings?.password_protected ? password : undefined,
        },
        {
          onSuccess: (data) => {
            setSessionId(data.session_id);
            setShowPasswordDialog(false);
          },
          onError: (error: Error) => {
            if (error.message.includes('password')) {
              setShowPasswordDialog(true);
            } else {
              toast.error('Failed to start conversation');
            }
          },
        }
      );
    }
  }, [slug, agent, sessionId, password, startConversationMutation]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }
    startConversationMutation.mutate(
      {
        agent_slug: slug!,
        password: password,
      },
      {
        onSuccess: (data) => {
          setSessionId(data.session_id);
          setShowPasswordDialog(false);
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Invalid password');
        },
      }
    );
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const currentField = conversationState?.current_field
    ? agent?.schema.find((f) => f.key === conversationState.current_field)
    : undefined;

  const isLoading = isLoadingAgent || startConversationMutation.isPending || !sessionId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-medium-gray">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="h-12 w-12 text-deep-orange mx-auto" />
          <h1 className="text-2xl font-bold">Agent Not Found</h1>
          <p className="text-medium-gray">This agent link is invalid or has been removed.</p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-pale-gray sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {agent.appearance.avatar_url && (
              <img
                src={agent.appearance.avatar_url}
                alt={agent.name}
                className="h-10 w-10 rounded-full"
              />
            )}
            <div>
              <h1 className="font-bold text-lg">{agent.name}</h1>
              <p className="text-xs text-medium-gray">Conversational Form</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfoDialog(true)}
              className="h-9 w-9"
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-9 w-9"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-background"
      >
        <div className="max-w-4xl mx-auto py-6">
          {/* Welcome Message */}
          {messages.length === 0 && agent.appearance.welcome_message && (
            <div className="px-4 mb-4">
              <div className="bg-white border border-pale-gray rounded-2xl p-6 shadow-sm animate-fade-in">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: agent.appearance.welcome_message }}
                />
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              agentAvatar={agent.appearance.avatar_url}
              agentColor={agent.appearance.primary_color}
              isStreaming={isStreaming && index === messages.length - 1}
            />
          ))}

          {/* Typing Indicator */}
          {isStreaming && (
            <TypingIndicator
              agentColor={agent.appearance.primary_color}
              agentAvatar={agent.appearance.avatar_url}
            />
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Progress Bar */}
      {conversationState && agent.schema.length > 0 && (
        <ConversationProgress state={conversationState} schema={agent.schema} />
      )}

      {/* Input Area */}
      {conversationState && conversationState.status !== 'completed' && (
        <ChatInput
          onSend={sendMessage}
          disabled={isStreaming}
          currentField={currentField}
          placeholder={
            currentField
              ? `Enter ${currentField.label.toLowerCase()}...`
              : 'Type your message...'
          }
        />
      )}

      {/* Completion Message */}
      {conversationState?.status === 'completed' && (
        <div className="border-t border-pale-gray bg-white p-6">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Thank you!</h2>
            <p className="text-medium-gray">
              Your responses have been submitted successfully.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-pale-gray bg-white py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between text-xs text-medium-gray">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/legal/privacy-policy')}
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate('/legal/terms-of-service')}
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Secure & Private</span>
          </div>
        </div>
      </footer>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Required</DialogTitle>
            <DialogDescription>
              This agent is password protected. Please enter the password to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button type="submit">Continue</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About {agent.name}</DialogTitle>
            <DialogDescription>
              {agent.appearance.welcome_message && (
                <div
                  className="prose prose-sm max-w-none mt-2"
                  dangerouslySetInnerHTML={{ __html: agent.appearance.welcome_message }}
                />
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Status:</span>{' '}
              <span className="text-medium-gray capitalize">{agent.status}</span>
            </div>
            {agent.schema.length > 0 && (
              <div>
                <span className="font-medium">Fields:</span>{' '}
                <span className="text-medium-gray">{agent.schema.length} total</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
