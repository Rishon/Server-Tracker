import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { getCache, setCache } from "@/data/Cache";
import { revokeAnalytics } from "@/data/Analytics";

type ConsentContextType = {
  consent: boolean | null;
  bannerOpen: boolean;
  setConsent: (choice: boolean) => void;
  openBanner: () => void;
};

const ConsentContext = createContext<ConsentContextType | undefined>(
  undefined,
);

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsentState] = useState<boolean | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const cachedConsent = getCache("cookieConsent");
    if (typeof cachedConsent === "boolean") {
      setConsentState(cachedConsent);
    } else {
      setBannerOpen(true);
    }
  }, []);

  const setConsent = (choice: boolean) => {
    setCache("cookieConsent", choice);
    setBannerOpen(false);

    if (consent && !choice) {
      revokeAnalytics();
      window.location.reload();
      return;
    }

    setConsentState(choice);
  };

  return (
    <ConsentContext.Provider
      value={{
        consent,
        bannerOpen,
        setConsent,
        openBanner: () => setBannerOpen(true),
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return context;
};
