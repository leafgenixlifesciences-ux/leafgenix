"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <section className="shell grid min-h-[70vh] place-items-center py-20 text-center">
      <div className="max-w-md">
        <h1 className="display-lg">That didn&apos;t load.</h1>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-body">
          Something broke on our side. Try again — and if it keeps happening,
          tell us and we&apos;ll look at it properly.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-faint">Reference {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">
            Try again
          </button>
          <Link href="/" className="btn btn-outline">
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}
