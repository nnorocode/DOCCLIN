"use client";

import { Info } from "lucide-react";

export default function InfoHint({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="v2-info-hint"
      aria-label={text}
    >
      <Info size={12} strokeWidth={2.2} aria-hidden="true" />
      <span role="tooltip">{text}</span>
    </button>
  );
}
