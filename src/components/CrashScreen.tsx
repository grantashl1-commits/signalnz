/** Shown when the app hits an error it can't recover from on its own. */
export default function CrashScreen({ resetError }: { resetError?: () => void }) {
  return (
    <main role="alert" className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center space-y-4">
        <h1 className="display-serif text-3xl text-foreground">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          Your plans and entries are still saved. Reload to try again, or head back to Today.
        </p>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
            Reload
          </button>
          <a href="/" onClick={() => resetError?.()} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground">
            Go to Today
          </a>
        </div>
      </div>
    </main>
  );
}
