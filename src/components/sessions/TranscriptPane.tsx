import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Bot, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/session";
import { toast } from "sonner";

interface TranscriptPaneProps {
  messages: Message[];
}

export function TranscriptPane({ messages }: TranscriptPaneProps) {
  const downloadMessage = (message: Message) => {
    const content = JSON.stringify(
      {
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        model: message.model,
        token_usage: message.token_usage,
        metadata: message.metadata,
      },
      null,
      2
    );
    const blob = new Blob([content], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `message-${message.id}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Message downloaded!");
  };

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-medium-gray mb-4" />
        <h3 className="text-lg font-semibold text-charcoal mb-2">
          No messages yet
        </h3>
        <p className="text-medium-gray">
          This session doesn't have any messages yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const isUser = message.role === "user";
        const isSystem = message.role === "system";

        return (
          <div
            key={message.id}
            className={cn(
              "animate-fade-in-up",
              "flex gap-4",
              isUser ? "flex-row-reverse" : "flex-row"
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Avatar */}
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                isUser
                  ? "bg-primary text-white"
                  : isSystem
                  ? "bg-medium-gray text-white"
                  : "bg-light-orange text-charcoal"
              )}
            >
              {isUser ? (
                <User className="h-5 w-5" />
              ) : isSystem ? (
                <MessageSquare className="h-5 w-5" />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </div>

            {/* Message Content */}
            <Card className={cn("flex-1 p-4", isUser ? "bg-pale-gray" : "bg-white")}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-charcoal">
                      {isUser ? "User" : isSystem ? "System" : "Assistant"}
                    </span>
                    <span className="text-xs text-medium-gray">
                      {format(new Date(message.timestamp), "h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => downloadMessage(message)}
                  className="h-8 w-8 flex-shrink-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              {/* Metadata */}
              {(message.model || message.token_usage) && (
                <div className="mt-3 pt-3 border-t border-pale-gray">
                  <div className="flex flex-wrap gap-4 text-xs text-medium-gray">
                    {message.model && (
                      <span>
                        Model: <span className="font-medium">{message.model}</span>
                      </span>
                    )}
                    {message.token_usage && (
                      <span>
                        Tokens:{" "}
                        <span className="font-medium">
                          {message.token_usage.total} (prompt: {message.token_usage.prompt}, completion: {message.token_usage.completion})
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
}
