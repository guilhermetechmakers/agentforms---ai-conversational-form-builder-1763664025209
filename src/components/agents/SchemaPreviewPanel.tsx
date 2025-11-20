import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SchemaField } from "@/types/agent";

interface SchemaPreviewPanelProps {
  fields: SchemaField[];
  className?: string;
}

export function SchemaPreviewPanel({ fields, className }: SchemaPreviewPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});

  if (!isOpen) {
    return (
      <div className={cn("fixed right-4 top-1/2 -translate-y-1/2 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg"
          size="icon"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (field: SchemaField) => {
    const value = formData[field.key] || "";
    const isRequired = field.required;
    const hasError = isRequired && !value;

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={`preview-${field.key}`}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={`preview-${field.key}`}
              type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className={cn(hasError && "border-red-500")}
            />
            {hasError && (
              <p className="text-xs text-red-500">This field is required</p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={`preview-${field.key}`}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={`preview-${field.key}`}
              type="number"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              min={field.validation?.min}
              max={field.validation?.max}
              className={cn(hasError && "border-red-500")}
            />
            {hasError && (
              <p className="text-xs text-red-500">This field is required</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={`preview-${field.key}`}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={`preview-${field.key}`}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              rows={4}
              className={cn(hasError && "border-red-500")}
            />
            {hasError && (
              <p className="text-xs text-red-500">This field is required</p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={`preview-${field.key}`}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleInputChange(field.key, val)}
            >
              <SelectTrigger
                id={`preview-${field.key}`}
                className={cn(hasError && "border-red-500")}
              >
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-xs text-red-500">This field is required</p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={`preview-${field.key}`}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={`preview-${field.key}`}
              type="date"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className={cn(hasError && "border-red-500")}
            />
            {hasError && (
              <p className="text-xs text-red-500">This field is required</p>
            )}
          </div>
        );

      case "file":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={`preview-${field.key}`}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={`preview-${field.key}`}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleInputChange(field.key, file?.name || "");
              }}
              className={cn(hasError && "border-red-500")}
            />
            {hasError && (
              <p className="text-xs text-red-500">This field is required</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const requiredFields = fields.filter((f) => f.required);
  const completedFields = requiredFields.filter((f) => formData[f.key]);
  const completionPercentage =
    requiredFields.length > 0
      ? Math.round((completedFields.length / requiredFields.length) * 100)
      : 100;

  return (
    <Card className={cn("sticky top-6", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Preview</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {requiredFields.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-medium-gray mb-1">
              <span>Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-pale-gray rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-medium-gray text-sm">
            <p>No fields to preview</p>
            <p className="text-xs mt-1">Add fields to see the preview</p>
          </div>
        ) : (
          <>
            {fields.map(renderField)}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-xs text-medium-gray">
                <Badge variant="outline" className="text-xs">
                  {fields.length} {fields.length === 1 ? "field" : "fields"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {requiredFields.length} required
                </Badge>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
