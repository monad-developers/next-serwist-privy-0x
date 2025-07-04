import type { Metadata } from "next";

import SendNotification from "./components/SendNotification";
import { InstallPWA } from "./components/InstallPWA";
import UseLoginPrivy from "./components/UseLoginPrivy";
import SwapComponent from "./components/SwapComponent";

export const metadata: Metadata = {
  title: "Home",
};

// trigger deploy

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100">
              Next.js + Privy + Serwist
            </h1>
          </div>
        </div>
        <SwapComponent />

        <div className="space-y-8">
          <SendNotification />
          <UseLoginPrivy />
        </div>
      </div>
      <InstallPWA />
    </div>
  );
}
