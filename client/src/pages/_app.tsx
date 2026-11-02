import { AppProps } from "next/app";
import { ReactElement } from "react";

// Styles
import "@/styles/globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

// Context
import { ConsentProvider } from "@/contexts/ConsentContext";
import { GraphColorProvider } from "@/contexts/GraphColorContext";
import { CurrentListProvider } from "@/contexts/CurrentListContext";
import { SortByProvider } from "@/contexts/SortByContext";

export default function MyApp({
  Component,
  pageProps,
  router,
}: AppProps): ReactElement {
  return (
    <ConsentProvider>
      <GraphColorProvider>
        <CurrentListProvider game={pageProps.game}>
          <SortByProvider>
            <Navbar />
            <Component {...pageProps} key={router.route} />
            <Footer />
            <CookieBanner />
          </SortByProvider>
        </CurrentListProvider>
      </GraphColorProvider>
    </ConsentProvider>
  );
}
