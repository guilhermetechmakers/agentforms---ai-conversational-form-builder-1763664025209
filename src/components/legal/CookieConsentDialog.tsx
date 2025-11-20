import { useState, useEffect } from 'react';
import { Cookie, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCookiePreferences, useUpdateCookiePreferences } from '@/hooks/useLegal';

interface CookieConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function CookieConsentDialog({ isOpen, onClose, onSave }: CookieConsentDialogProps) {
  const { data: currentPreferences, isLoading } = useCookiePreferences();
  const { mutate: updatePreferences, isPending } = useUpdateCookiePreferences();

  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    if (currentPreferences) {
      setPreferences(currentPreferences);
    }
    // If no preferences exist, use defaults (already set in useState)
  }, [currentPreferences]);

  const handleToggle = (key: keyof typeof preferences) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updatePreferences(preferences, {
      onSuccess: () => {
        localStorage.setItem(
          'agentforms_cookie_consent',
          JSON.stringify({ version: '1.0', timestamp: new Date().toISOString() })
        );
        onSave();
      },
    });
  };

  const handleAcceptAll = () => {
    setPreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const handleRejectAll = () => {
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Cookie className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Cookie Preferences</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Manage your cookie preferences. You can enable or disable different types of cookies 
            below. Learn more in our{' '}
            <a
              href="/legal/cookie-policy"
              className="text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault();
                window.open('/legal/cookie-policy', '_blank');
              }}
            >
              Cookie Policy
            </a>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Necessary Cookies */}
          <div className="space-y-3 p-4 rounded-lg bg-pale-gray/50 border border-pale-gray">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="necessary" className="text-base font-semibold text-charcoal">
                    Necessary Cookies
                  </Label>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Always Active
                  </span>
                </div>
                <p className="text-sm text-medium-gray">
                  These cookies are essential for the website to function properly. They cannot be 
                  disabled as they are required for core functionality such as security, 
                  authentication, and navigation.
                </p>
              </div>
              <Switch
                id="necessary"
                checked={preferences.necessary}
                disabled
                className="ml-4"
              />
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="space-y-3 p-4 rounded-lg border border-pale-gray">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="analytics" className="text-base font-semibold text-charcoal block mb-1">
                  Analytics Cookies
                </Label>
                <p className="text-sm text-medium-gray">
                  These cookies help us understand how visitors interact with our website by 
                  collecting and reporting information anonymously. This helps us improve our 
                  services and user experience.
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={() => handleToggle('analytics')}
                className="ml-4"
              />
            </div>
          </div>

          {/* Marketing Cookies */}
          <div className="space-y-3 p-4 rounded-lg border border-pale-gray">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="marketing" className="text-base font-semibold text-charcoal block mb-1">
                  Marketing Cookies
                </Label>
                <p className="text-sm text-medium-gray">
                  These cookies are used to deliver personalized advertisements and track 
                  advertising effectiveness. They may be set by our advertising partners to build 
                  a profile of your interests.
                </p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={() => handleToggle('marketing')}
                className="ml-4"
              />
            </div>
          </div>

          {/* Functional Cookies */}
          <div className="space-y-3 p-4 rounded-lg border border-pale-gray">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="functional" className="text-base font-semibold text-charcoal block mb-1">
                  Functional Cookies
                </Label>
                <p className="text-sm text-medium-gray">
                  These cookies enable enhanced functionality and personalization, such as 
                  remembering your preferences and settings. They may be set by us or by third-party 
                  providers whose services we use.
                </p>
              </div>
              <Switch
                id="functional"
                checked={preferences.functional}
                onCheckedChange={() => handleToggle('functional')}
                className="ml-4"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-medium-gray">
              <p className="font-medium text-charcoal mb-1">Your Privacy Matters</p>
              <p>
                You can change these settings at any time by clicking the cookie icon in the footer 
                or visiting your account settings. For more information, please review our{' '}
                <a
                  href="/legal/privacy-policy"
                  className="text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('/legal/privacy-policy', '_blank');
                  }}
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleRejectAll}
              className="flex-1 sm:flex-initial border-pale-gray"
            >
              Reject All
            </Button>
            <Button
              variant="outline"
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-initial border-pale-gray"
            >
              Accept All
            </Button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-initial border-pale-gray"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending || isLoading}
              className="flex-1 sm:flex-initial bg-primary text-white hover:scale-105"
            >
              Save Preferences
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
