import { Link } from 'react-router-dom';
import { Cookie, FileText, Shield, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CookieConsentDialog } from '@/components/legal/CookieConsentDialog';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const [isCookieDialogOpen, setIsCookieDialogOpen] = useState(false);

  return (
    <>
      <footer
        className={cn(
          'border-t border-pale-gray bg-card',
          'py-8 md:py-12',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-charcoal mb-4">AgentForms</h3>
              <p className="text-sm text-medium-gray">
                AI Conversational Form Builder for modern teams.
              </p>
            </div>

            {/* Legal Links */}
            <div className="md:col-span-1">
              <h4 className="text-sm font-semibold text-charcoal mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/legal/privacy-policy"
                    className="text-sm text-medium-gray hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legal/terms-of-service"
                    className="text-sm text-medium-gray hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legal/cookie-policy"
                    className="text-sm text-medium-gray hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Cookie className="h-4 w-4" />
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legal/data-processing-addendum"
                    className="text-sm text-medium-gray hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <FileCheck className="h-4 w-4" />
                    Data Processing Addendum
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="md:col-span-1">
              <h4 className="text-sm font-semibold text-charcoal mb-4">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/dashboard/help"
                    className="text-sm text-medium-gray hover:text-primary transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/help"
                    className="text-sm text-medium-gray hover:text-primary transition-colors"
                  >
                    Support
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-medium-gray hover:text-primary transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="md:col-span-1">
              <h4 className="text-sm font-semibold text-charcoal mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/about"
                    className="text-sm text-medium-gray hover:text-primary transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-sm text-medium-gray hover:text-primary transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCookieDialogOpen(true)}
                    className="text-sm text-medium-gray hover:text-primary p-0 h-auto font-normal"
                  >
                    <Cookie className="h-4 w-4 mr-2" />
                    Cookie Settings
                  </Button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-pale-gray flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-medium-gray">
              © {new Date().getFullYear()} AgentForms. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCookieDialogOpen(true)}
                className="text-sm text-medium-gray hover:text-primary"
              >
                <Cookie className="h-4 w-4 mr-2" />
                Manage Cookies
              </Button>
            </div>
          </div>
        </div>
      </footer>
      <CookieConsentDialog
        isOpen={isCookieDialogOpen}
        onClose={() => setIsCookieDialogOpen(false)}
        onSave={() => setIsCookieDialogOpen(false)}
      />
    </>
  );
}
