import React from "react";
import Link from "next/link";
import { Mountain, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-charcoal topo-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-6 max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-border/40 text-text-muted mb-2">
          <Mountain className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-sora-family)] text-text-primary">
            Lost on the Trail?
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            We couldn&apos;t find the captain or trek page you are looking for. It might have been deleted, made private, or the address might be misspelled.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-card border border-border hover:border-border-hover text-sm font-semibold text-text-muted hover:text-text-primary rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trek Captain
          </Link>
        </div>
      </div>
    </div>
  );
}
