import { AppProps } from "next/app";
import { ReactElement } from "react";

// Styles
import "@/styles/globals.css";

// Context
import { GraphColorProvider } from "@/contexts/GraphColorContext";

export default function MyApp({
  Component,
  pageProps,
  router,
}: AppProps): ReactElement {
  return (
    <GraphColorProvider>
      <Component {...pageProps} key={router.route} />;
    </GraphColorProvider>
  );
}
