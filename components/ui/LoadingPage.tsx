"use client";

export function LoadingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-fuchsia-400 border-t-transparent" />
      <p className="text-lg font-semibold tracking-wide">
        Booting retro circuits…
      </p>
      <p className="mt-2 text-sm text-slate-400">
        Loading the captcha arcade for humans only.
      </p>
    </div>
  );
}

export default LoadingPage;
