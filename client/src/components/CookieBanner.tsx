import { useState, useEffect } from "react";
import { getCache, setCache } from "@/data/Cache";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function CookieBanner() {
  const [consent, setConsent] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const cachedConsent = getCache("cookieConsent");
    if (typeof cachedConsent === "boolean") {
      setConsent(cachedConsent);
    } else {
      setShowBanner(true);
    }
  }, []);

  const handleConsent = (choice: boolean) => {
    setCache("cookieConsent", choice);
    setConsent(choice);
    setShowBanner(false);
  };

  return (
    <>
      {consent && <GoogleAnalytics gaId="G-08RW5HWFEH" />}

      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/[0.08] bg-[#0f0f10]/90 p-4 px-6 shadow-2xl backdrop-blur-xl sm:flex-row md:rounded-t-2xl md:border-l md:border-r">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-gray-300">
                <strong className="text-white">We value your privacy.</strong>{" "}
                We use cookies to analyze site traffic and enhance your
                experience.
              </p>
            </div>
            <div className="flex w-full shrink-0 items-center justify-center gap-3 sm:w-auto">
              <button
                onClick={() => handleConsent(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white"
              >
                Decline
              </button>
              <button
                onClick={() => handleConsent(true)}
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-gray-200"
              >
                Allow Cookies
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
