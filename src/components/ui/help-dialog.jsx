import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Badge } from './badge';
import { Keyboard } from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from '../../hooks/useKeyboardShortcuts';

export function HelpDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Use these keyboard shortcuts to navigate the app more efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <span className="text-sm text-foreground">{shortcut.description}</span>
              <Badge variant="secondary" className="font-mono">
                {shortcut.key}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-background border rounded">?</kbd> anytime to show this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
