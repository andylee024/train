"use client";

/** Shown when the server cannot read the log. */
export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <main className="shell">
      <p className="mark">Analyst</p>
      <h1>The log didn’t load</h1>
      <p className="banner">{error.message || "Supabase could not be read."}</p>
    </main>
  );
}
