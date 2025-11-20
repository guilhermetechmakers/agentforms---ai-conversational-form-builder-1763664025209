import { CheckCircle2, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ConversationState } from '@/types/conversation';
import type { SchemaField } from '@/types/agent';

interface ConversationProgressProps {
  state: ConversationState | null;
  schema: SchemaField[];
}

export function ConversationProgress({ state, schema }: ConversationProgressProps) {
  if (!state || !schema.length) return null;

  const requiredFields = schema.filter((f) => f.required);
  const completedCount = state.completed_fields.length;
  const totalRequired = requiredFields.length;
  const progress = totalRequired > 0 ? (completedCount / totalRequired) * 100 : 0;

  return (
    <div className="border-t border-pale-gray bg-white p-4">
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            Progress: {completedCount} of {totalRequired} required fields
          </span>
          <span className="text-medium-gray">{Math.round(progress)}%</span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        {requiredFields.length > 0 && requiredFields.length <= 8 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {requiredFields.map((field) => {
              const isCompleted = state.completed_fields.includes(field.key);
              return (
                <div
                  key={field.key}
                  className={cn(
                    'flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-colors',
                    isCompleted
                      ? 'bg-primary/10 text-primary'
                      : 'bg-pale-gray text-medium-gray'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                  <span>{field.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
