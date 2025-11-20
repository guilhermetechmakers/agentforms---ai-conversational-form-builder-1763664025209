import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Bot, ExternalLink, Edit, Copy, Trash2, MessageSquare, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types/agent";

interface AgentCardProps {
  agent: Agent;
  onDuplicate: (agentId: string) => void;
  onDelete: (agent: Agent) => void;
}

export function AgentCard({ agent, onDuplicate, onDelete }: AgentCardProps) {
  const statusColors = {
    published: "bg-green-100 text-green-700",
    draft: "bg-gray-100 text-gray-700",
    archived: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="card-base p-6 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Color Preview */}
          <div
            className="h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ backgroundColor: agent.primary_color || "#7B8CFF" }}
          >
            <Bot className="h-7 w-7 text-white" />
          </div>

          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg text-charcoal truncate">
                {agent.name}
              </h3>
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0",
                  statusColors[agent.status]
                )}
              >
                {agent.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-medium-gray mb-2">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                <span>{agent.session_count} sessions</span>
              </div>
              <div>
                Last activity {format(new Date(agent.last_activity), "MMM d, yyyy")}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-medium-gray">
              <ExternalLink className="h-3 w-3" />
              <a
                href={agent.public_url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-primary transition-colors"
              >
                {agent.public_url}
              </a>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to={`/dashboard/agents/${agent.id}`}>
            <Button variant="ghost" size="icon" title="Edit">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <a
            href={agent.public_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon" title="Open Link">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
          <Link to={`/dashboard/agents/${agent.id}/sessions`}>
            <Button variant="ghost" size="icon" title="View Sessions">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="More options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDuplicate(agent.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(agent)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
