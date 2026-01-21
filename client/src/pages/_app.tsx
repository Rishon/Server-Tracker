import { AppProps } from "next/app";
import { ReactElement } from "react";

// Styles
import "@/styles/globals.css";

// Context
import { GraphColorProvider } from "@/contexts/GraphColorContext";
import { CurrentListProvider } from "@/contexts/CurrentListContext";

export default function MyApp({
  Component,
  pageProps,
  router,
}: AppProps): ReactElement {
  return (
    <GraphColorProvider>
      <CurrentListProvider>
        <Component {...pageProps} key={router.route} />;
      </CurrentListProvider>
    </GraphColorProvider>
  );
}
