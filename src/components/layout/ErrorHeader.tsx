import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ErrorHeaderProps {
  className?: string;
}

export function ErrorHeader({ className }: ErrorHeaderProps) {
  return (
    <header
      className={cn(
        'bg-card border-b border-pale-gray',
        'px-4 md:px-6 lg:px-8 py-4',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold text-charcoal hover:text-primary transition-colors"
        >
          AgentForms
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm text-medium-gray hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className="text-sm text-medium-gray hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
