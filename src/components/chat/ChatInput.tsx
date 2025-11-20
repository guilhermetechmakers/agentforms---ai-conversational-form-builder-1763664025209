import { useState, useRef, useEffect } from 'react';
import { Send, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SchemaField } from '@/types/agent';

interface ChatInputProps {
  onSend: (content: string, fieldKey?: string, fieldValue?: any) => void;
  disabled?: boolean;
  currentField?: SchemaField;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, currentField, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input when field changes
    if (currentField?.type === 'text' || currentField?.type === 'textarea' || currentField?.type === 'email' || currentField?.type === 'phone' || currentField?.type === 'number') {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        } else if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [currentField]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disabled) return;

    let valueToSend = input;
    let fieldKey = currentField?.key;
    let fieldValue: any = input;

    // Handle select fields
    if (currentField?.type === 'select' && selectedOption) {
      valueToSend = selectedOption;
      fieldValue = selectedOption;
    }

    // Handle empty input
    if (!valueToSend.trim() && !selectedOption) return;

    onSend(valueToSend, fieldKey, fieldValue);
    setInput('');
    setSelectedOption('');
  };

  const handleQuickReply = (option: string) => {
    if (disabled) return;
    onSend(option, currentField?.key, option);
    setSelectedOption('');
  };

  // Render field-specific input
  const renderFieldInput = () => {
    if (!currentField) {
      return (
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={placeholder || 'Type your message...'}
          disabled={disabled}
          className="resize-none"
          rows={3}
        />
      );
    }

    switch (currentField.type) {
      case 'select':
        return (
          <div className="space-y-3">
            <Select value={selectedOption} onValueChange={setSelectedOption} disabled={disabled}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={currentField.placeholder || `Select ${currentField.label}`} />
              </SelectTrigger>
              <SelectContent>
                {currentField.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentField.options && currentField.options.length <= 4 && (
              <div className="flex flex-wrap gap-2">
                {currentField.options.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickReply(option)}
                    disabled={disabled}
                    className="text-sm"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <Input
            ref={inputRef}
            type="date"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentField.placeholder || 'Select date'}
            disabled={disabled}
            className="w-full"
          />
        );

      case 'email':
        return (
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-medium-gray" />
            <Input
              ref={inputRef}
              type="email"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentField.placeholder || 'Enter your email'}
              disabled={disabled}
              className="pl-10"
            />
          </div>
        );

      case 'phone':
        return (
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-medium-gray" />
            <Input
              ref={inputRef}
              type="tel"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentField.placeholder || 'Enter your phone number'}
              disabled={disabled}
              className="pl-10"
            />
          </div>
        );

      case 'number':
        return (
          <Input
            ref={inputRef}
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentField.placeholder || 'Enter a number'}
            disabled={disabled}
            min={currentField.validation?.min}
            max={currentField.validation?.max}
          />
        );

      case 'file':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // In a real implementation, you'd upload the file first
                  // For now, we'll just send the filename
                  setInput(file.name);
                }
              }}
              disabled={disabled}
              accept={currentField.validation?.pattern || '*'}
            />
            <p className="text-xs text-medium-gray">
              {currentField.placeholder || 'Choose a file to upload'}
            </p>
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentField.placeholder || `Enter ${currentField.label.toLowerCase()}`}
            disabled={disabled}
            rows={4}
            className="resize-none"
          />
        );

      case 'text':
      default:
        return (
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={currentField.placeholder || `Enter ${currentField.label.toLowerCase()}`}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-pale-gray bg-white p-4">
      <div className="flex flex-col gap-3 max-w-4xl mx-auto">
        {currentField && (
          <div className="text-sm text-medium-gray">
            <span className="font-medium">{currentField.label}</span>
            {currentField.required && <span className="text-deep-orange ml-1">*</span>}
          </div>
        )}
        
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            {renderFieldInput()}
          </div>
          
          {currentField?.type !== 'select' && (
            <Button
              type="submit"
              disabled={disabled || (!input.trim() && !selectedOption)}
              size="icon"
              className="shrink-0 h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>

        {currentField?.type === 'select' && selectedOption && (
          <Button
            type="submit"
            disabled={disabled}
            className="w-full"
          >
            Continue
          </Button>
        )}
      </div>
    </form>
  );
}
