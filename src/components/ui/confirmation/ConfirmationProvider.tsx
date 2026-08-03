import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { ConfirmationOptions, ConfirmationContextType } from './confirmation.types';
import { ConfirmationModal } from './ConfirmationModal';

export const ConfirmationContext = createContext<ConfirmationContextType | null>(null);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = useCallback((newOptions: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(newOptions);
      setResolver({ resolve });
    });
  }, []);

  const handleConfirm = async () => {
    if (resolver) {
      resolver.resolve(true);
      
      // If there's no custom async handling on the consumer side,
      // we could close immediately. However, the requirement states:
      // "The modal must remain open until the async action finishes."
      // Since confirm() returns a Promise to the caller (e.g. handleConfirm),
      // the caller is responsible for awaiting their own API calls.
      // 
      // Wait, if resolver.resolve(true) is synchronous, how do we know when the caller finishes?
      // For a truly promise-based API that holds the loading state, the `confirm` 
      // function itself doesn't know about the caller's async work unless the caller 
      // passes a callback, or we resolve and the caller handles it.
      // BUT the prompt asked for `const confirmed = await confirm({...}); await deleteMember();`
      // If `confirm()` resolves immediately with `true`, the `await confirm()` finishes,
      // and the code proceeds to `await deleteMember()`. 
      // How does the Modal know it's loading?
      // Ah! To make the modal show loading state while `deleteMember` runs, we must either:
      // 1. Pass `action: () => Promise<void>` in options, and `ConfirmationModal` awaits it.
      // 2. OR `confirm` doesn't resolve until `deleteMember` finishes. But the usage example says:
      //    `const ok = await confirm(...); if (!ok) return; await deleteMember();`
      // In this exact usage pattern, the modal component has no way to know when `deleteMember` starts or finishes, because it has already yielded control back to the caller!
      // To fulfill "Loading State: Modal must remain open until async action finishes" WITH that exact usage example, it's impossible unless the modal stays open globally and the user calls a `closeConfirmation()` manually, or we use a different API.
      // However, a common pattern is to extend `confirm` options to accept an `onConfirm` async function:
      // `await confirm({ title: '...', onConfirm: async () => await deleteMember() })`
      // Since the prompt explicitly provided the `const ok = await confirm(...)` example AND the loading state requirement, it's likely they want the modal to handle the loading state automatically. 
      // To support BOTH the provided example AND the loading requirement, we can either:
      // A) Accept an `action` function in options.
      // B) Expose `close()` and `setLoading()` from the hook, but that violates "no prop drilling / simple usage".
      // Let's implement the `action` property in options to gracefully handle the loading state, while still supporting the basic boolean resolution.
      
      // For this basic boolean resolution without `action`:
      // We resolve immediately and close immediately.
      if (!options?.action) {
        setOptions(null);
        setResolver(null);
      }
    }
  };

  const handleActionConfirm = async () => {
    if (options?.action) {
      try {
        await options.action();
        if (resolver) resolver.resolve(true);
        setOptions(null);
        setResolver(null);
      } catch (error) {
        // If action fails, don't close the modal. Let the caller handle or show a toast.
        throw error;
      }
    } else {
      handleConfirm();
    }
  };

  const handleCancel = useCallback(() => {
    if (resolver) {
      resolver.resolve(false);
      setOptions(null);
      setResolver(null);
    }
  }, [resolver]);

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <ConfirmationModal 
        options={options} 
        onConfirm={options?.action ? handleActionConfirm : handleConfirm} 
        onCancel={handleCancel} 
      />
    </ConfirmationContext.Provider>
  );
}
