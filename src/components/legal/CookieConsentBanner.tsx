import { useState, useEffect } from 'react';
import { Cookie, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CookieConsentDialog } from './CookieConsentDialog';
import { useUpdateCookiePreferences } from '@/hooks/useLegal';
import { cn } from '@/lib/utils';

const CONSENT_STORAGE_KEY = 'agentforms_cookie_consent';
const CONSENT_VERSION = '1.0';

export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const { mutate: updatePreferences } = useUpdateCookiePreferences();

  useEffect(() => {
    // Check if user has already given consent
    const consentData = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!consentData) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const defaultPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    
    updatePreferences(defaultPreferences, {
      onSuccess: () => {
        localStorage.setItem(
          CONSENT_STORAGE_KEY,
          JSON.stringify({ version: CONSENT_VERSION, timestamp: new Date().toISOString() })
        );
        setShowBanner(false);
      },
    });
  };

  const handleRejectAll = () => {
    const minimalPreferences = {
      necessary: true, // Always required
      analytics: false,
      marketing: false,
      functional: false,
    };
    
    updatePreferences(minimalPreferences, {
      onSuccess: () => {
        localStorage.setItem(
          CONSENT_STORAGE_KEY,
          JSON.stringify({ version: CONSENT_VERSION, timestamp: new Date().toISOString() })
        );
        setShowBanner(false);
      },
    });
  };

  const handleCustomize = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ version: CONSENT_VERSION, timestamp: new Date().toISOString() })
    );
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-fade-in-up',
          'pointer-events-none'
        )}
      >
        <Card className="max-w-4xl mx-auto shadow-card-hover pointer-events-auto">
          <div className="p-4 md:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Cookie Preferences
                </h3>
                <p className="text-sm text-medium-gray mb-4">
                  We use cookies to enhance your browsing experience, analyze site traffic, and 
                  personalize content. By clicking "Accept All", you consent to our use of cookies. 
                  You can customize your preferences or reject non-essential cookies.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleAcceptAll}
                    size="sm"
                    className="bg-primary text-white hover:scale-105"
                  >
                    Accept All
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                    size="sm"
                    className="border-pale-gray hover:bg-pale-gray"
                  >
                    Reject All
                  </Button>
                  <Button
                    onClick={handleCustomize}
                    variant="outline"
                    size="sm"
                    className="border-pale-gray hover:bg-pale-gray"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="ghost"
                    size="sm"
                    className="text-medium-gray hover:text-charcoal"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <CookieConsentDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={() => {
          setIsOpen(false);
          setShowBanner(false);
        }}
      />
    </>
  );
}
