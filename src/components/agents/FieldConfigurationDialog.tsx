import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { SchemaField } from "@/types/agent";

const fieldTypeOptions = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "select", label: "Select (Dropdown)" },
  { value: "date", label: "Date" },
  { value: "phone", label: "Phone" },
  { value: "textarea", label: "Textarea" },
  { value: "file", label: "File Upload" },
] as const;

const fieldSchema = z.object({
  label: z.string().min(1, "Label is required").max(100, "Label is too long"),
  key: z
    .string()
    .min(1, "Key is required")
    .max(50, "Key is too long")
    .regex(/^[a-z0-9_]+$/, "Key must be lowercase letters, numbers, and underscores only"),
  type: z.enum(["text", "number", "email", "select", "date", "phone", "textarea", "file"]),
  required: z.boolean().default(false),
  placeholder: z.string().max(200, "Placeholder is too long").optional(),
  options: z.string().optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      custom: z.string().optional(),
    })
    .optional(),
});

type FieldFormData = z.infer<typeof fieldSchema>;

interface FieldConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field?: SchemaField | null;
  existingKeys: string[];
  onSubmit: (field: Omit<SchemaField, "id" | "order">) => void;
}

export function FieldConfigurationDialog({
  open,
  onOpenChange,
  field,
  existingKeys,
  onSubmit,
}: FieldConfigurationDialogProps) {
  const isEditing = !!field;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      label: field?.label || "",
      key: field?.key || "",
      type: field?.type || "text",
      required: field?.required || false,
      placeholder: field?.placeholder || "",
      options: field?.options?.join(", ") || "",
      validation: field?.validation || {},
    },
  });

  const fieldType = watch("type");
  const isSelectType = fieldType === "select";
  const isNumberType = fieldType === "number";

  useEffect(() => {
    if (open && field) {
      reset({
        label: field.label,
        key: field.key,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder || "",
        options: field.options?.join(", ") || "",
        validation: field.validation || {},
      });
    } else if (open && !field) {
      reset({
        label: "",
        key: "",
        type: "text",
        required: false,
        placeholder: "",
        options: "",
        validation: {},
      });
    }
  }, [open, field, reset]);

  const handleFormSubmit = (data: FieldFormData) => {
    // Validate key uniqueness (skip if editing the same field)
    if (!isEditing && existingKeys.includes(data.key)) {
      return;
    }

    // Validate select options
    if (isSelectType && (!data.options || data.options.trim() === "")) {
      return;
    }

    const fieldData: Omit<SchemaField, "id" | "order"> = {
      label: data.label,
      key: data.key,
      type: data.type,
      required: data.required,
      placeholder: data.placeholder || undefined,
      options: isSelectType && data.options ? data.options.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      validation: data.validation && Object.keys(data.validation).length > 0 ? data.validation : undefined,
    };

    onSubmit(fieldData);
    onOpenChange(false);
  };

  const generateKeyFromLabel = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value;
    setValue("label", label);
    
    // Auto-generate key if not editing or if key is empty
    if (!isEditing && !watch("key")) {
      const generatedKey = generateKeyFromLabel(label);
      setValue("key", generatedKey);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Field" : "Add New Field"}</DialogTitle>
          <DialogDescription>
            Configure the field properties and validation rules
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="label">
                Label <span className="text-red-500">*</span>
              </Label>
              <Input
                id="label"
                {...register("label")}
                onChange={handleLabelChange}
                placeholder="Field Label"
                className={cn(errors.label && "border-red-500")}
              />
              {errors.label && (
                <p className="text-sm text-red-500">{errors.label.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">
                Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="key"
                {...register("key")}
                placeholder="field_key"
                className={cn(errors.key && "border-red-500")}
                disabled={isEditing}
              />
              {errors.key && (
                <p className="text-sm text-red-500">{errors.key.message}</p>
              )}
              {!isEditing && existingKeys.includes(watch("key")) && (
                <p className="text-sm text-red-500">This key already exists</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">
                Field Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value as FieldFormData["type"])}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2 h-10">
                <Checkbox
                  id="required"
                  checked={watch("required")}
                  onCheckedChange={(checked) => setValue("required", checked === true)}
                />
                <Label htmlFor="required" className="cursor-pointer">
                  Required Field
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder Text</Label>
            <Input
              id="placeholder"
              {...register("placeholder")}
              placeholder="Enter placeholder text..."
            />
          </div>

            {isSelectType && (
            <div className="space-y-2">
              <Label htmlFor="options">
                Options <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="options"
                {...register("options", {
                  required: isSelectType ? "Options are required for select fields" : false,
                })}
                placeholder="Option 1, Option 2, Option 3"
                rows={3}
                className={cn(errors.options && "border-red-500")}
              />
              {errors.options && (
                <p className="text-sm text-red-500">{errors.options.message}</p>
              )}
              <p className="text-xs text-medium-gray">
                Separate options with commas
              </p>
            </div>
          )}

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-sm">Validation Rules</h4>
            
            {isNumberType && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min">Minimum Value</Label>
                  <Input
                    id="min"
                    type="number"
                    {...register("validation.min", { valueAsNumber: true })}
                    placeholder="Min"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">Maximum Value</Label>
                  <Input
                    id="max"
                    type="number"
                    {...register("validation.max", { valueAsNumber: true })}
                    placeholder="Max"
                  />
                </div>
              </div>
            )}

            {!isNumberType && (
              <div className="space-y-2">
                <Label htmlFor="pattern">Pattern (Regex)</Label>
                <Input
                  id="pattern"
                  {...register("validation.pattern")}
                  placeholder="^[A-Za-z]+$"
                />
                <p className="text-xs text-medium-gray">
                  Enter a regular expression pattern
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="custom">Custom Validation</Label>
              <Textarea
                id="custom"
                {...register("validation.custom")}
                placeholder="Custom validation message or rule..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Field" : "Add Field"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
