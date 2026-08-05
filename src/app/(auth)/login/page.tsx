import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-2">Login</h1>
      <p className="text-sm text-center text-[rgb(var(--color-text-muted))] mb-6">
        Access the Social Autopilot dashboard
      </p>

      <a
        href="#"
        className="inline-flex items-center justify-center w-full gap-2 rounded-lg bg-[rgb(var(--color-text))] text-white px-4 py-3 text-sm font-medium shadow hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] focus-visible:ring-offset-2"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-1.35 6-6 0-3.45-3-6-6-6s-6 2.55-6 6c0 4.65 3 6 6 6a4.8 4.8 0 0 0-1 3.5v4"/><circle cx="9" cy="12" r="1"/></svg>
        Continue with GitHub
      </a>

      <p className="text-xs text-center text-[rgb(var(--color-text-muted))] mt-6">
        No account yet?{" "}
        <Link href="/register" className="text-[rgb(var(--color-primary))] hover:underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </>
  );
}
