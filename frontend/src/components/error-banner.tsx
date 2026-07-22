import { Button } from '@/components/ui/button';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start justify-between gap-3">
      <span className="shrink-0 mt-0.5" aria-hidden>
        !
      </span>
      <p className="flex-1">{message}</p>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto py-1 text-destructive hover:text-destructive/80 -mr-2"
        onClick={onDismiss}
      >
        Dismiss
      </Button>
    </div>
  );
}
