import { LoginForm } from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="mono text-[var(--text-lg)] font-medium">Sign in</h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--text-muted)]">
          This is the private dashboard for editing site content.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
