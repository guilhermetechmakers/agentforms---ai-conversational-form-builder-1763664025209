import { useState } from "react";
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SchemaField } from "@/types/agent";

interface SchemaFieldListProps {
  fields: SchemaField[];
  onReorder: (fields: SchemaField[]) => void;
  onEdit: (field: SchemaField) => void;
  onDelete: (fieldId: string) => void;
  onAdd: () => void;
}

export function SchemaFieldList({
  fields,
  onReorder,
  onEdit,
  onDelete,
  onAdd,
}: SchemaFieldListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newFields = [...fields];
    const [draggedField] = newFields.splice(draggedIndex, 1);
    newFields.splice(dropIndex, 0, draggedField);

    // Update order numbers
    const reorderedFields = newFields.map((field, index) => ({
      ...field,
      order: index,
    }));

    onReorder(reorderedFields);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getFieldTypeColor = (type: SchemaField["type"]) => {
    const colors: Record<SchemaField["type"], string> = {
      text: "bg-light-blue/10 text-light-blue",
      number: "bg-light-orange/10 text-deep-orange",
      email: "bg-pale-pink/10 text-pale-pink",
      select: "bg-lavender/10 text-lavender",
      date: "bg-soft-yellow/10 text-charcoal",
      phone: "bg-light-blue/10 text-light-blue",
      textarea: "bg-light-orange/10 text-deep-orange",
      file: "bg-pale-pink/10 text-pale-pink",
    };
    return colors[type] || "bg-medium-gray/10 text-medium-gray";
  };

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-pale-gray rounded-2xl bg-white">
        <p className="text-medium-gray text-sm mb-4">No fields added yet</p>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add First Field
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <Card
          key={field.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={cn(
            "p-4 cursor-move transition-all duration-200",
            draggedIndex === index && "opacity-50 scale-95",
            dragOverIndex === index && draggedIndex !== index && "border-primary border-2 shadow-lg scale-105"
          )}
        >
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-medium-gray flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-charcoal truncate">{field.label}</h4>
                <Badge className={cn("text-xs", getFieldTypeColor(field.type))}>
                  {field.type}
                </Badge>
                {field.required && (
                  <Badge variant="outline" className="text-xs text-deep-orange border-deep-orange">
                    Required
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-medium-gray">
                <span className="text-xs">Key: {field.key}</span>
                {field.placeholder && (
                  <>
                    <span className="text-xs">•</span>
                    <span className="text-xs truncate">Placeholder: {field.placeholder}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(field)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(field.id)}
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
      
      <Button
        onClick={onAdd}
        variant="outline"
        className="w-full mt-4 gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" />
        Add Field
      </Button>
    </div>
  );
}
