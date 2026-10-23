"use client";
import "./globals.css";
import { PageRecovery } from "@/components/page-recovery";

export default function GlobalError({ retry }: { retry: () => void }) {
  return <html lang="en-GB"><body style={{ fontFamily: "Arial, sans-serif" }}><PageRecovery retry={retry} /></body></html>;
}
