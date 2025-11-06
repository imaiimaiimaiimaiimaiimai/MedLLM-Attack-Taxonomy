import { useHotkeys } from 'react-hotkeys-hook';
import toast from 'react-hot-toast';
import type { KeyboardShortcutHandlers } from '../types/common';

/**
 * Custom hook to manage keyboard shortcuts throughout the app
 */
export function useKeyboardShortcuts(options: KeyboardShortcutHandlers = {}): null {
  const {
    onFocusSearch,
    onClearFilters,
    onShowHelp,
  } = options;

  // Focus search with '/' key
  useHotkeys('/', (e) => {
    e.preventDefault();
    if (onFocusSearch) {
      onFocusSearch();
      toast.success('Search focused', { duration: 1000 });
    }
  }, { enableOnFormTags: false });

  // Clear search/filters with 'Escape' key
  useHotkeys('escape', () => {
    // Check if we're in a focused input/textarea
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
      // If in input, blur it first
      activeElement.blur();
      return;
    }

    // Otherwise clear filters
    if (onClearFilters) {
      onClearFilters();
      toast.success('Filters cleared', { duration: 1000 });
    }
  });

  // Show help dialog with '?' key (Shift + /)
  useHotkeys('shift+/', (e) => {
    e.preventDefault();
    if (onShowHelp) {
      onShowHelp();
    }
  }, { enableOnFormTags: false });

  return null;
}

/**
 * List of available keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS: Array<{ key: string; description: string }> = [
  { key: '/', description: 'Focus search bar' },
  { key: 'Esc', description: 'Clear filters or blur input' },
  { key: '?', description: 'Show keyboard shortcuts help' },
];
