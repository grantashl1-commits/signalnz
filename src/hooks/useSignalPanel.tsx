import { createContext, useContext, useState, useCallback } from "react";

interface SignalPanelContext {
  open: boolean;
  openSignal: (prompt?: string, pageContext?: string) => void;
  closeSignal: () => void;
  initialPrompt?: string;
  pageContext?: string;
}

const ctx = createContext<SignalPanelContext>({
  open: false,
  openSignal: () => {},
  closeSignal: () => {},
});

export function SignalPanelProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
  const [pageContext, setPageContext] = useState<string | undefined>();

  const openSignal = useCallback((prompt?: string, page?: string) => {
    setInitialPrompt(prompt);
    setPageContext(page);
    setOpen(true);
  }, []);

  const closeSignal = useCallback(() => {
    setOpen(false);
    setInitialPrompt(undefined);
  }, []);

  return (
    <ctx.Provider value={{ open, openSignal, closeSignal, initialPrompt, pageContext }}>
      {children}
    </ctx.Provider>
  );
}

export function useSignalPanel() {
  return useContext(ctx);
}
