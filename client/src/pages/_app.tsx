import { AppProps } from "next/app";
import { ReactElement } from "react";

// Styles
import "@/styles/globals.css";

export default function MyApp({
  Component,
  pageProps,
  router,
}: AppProps): ReactElement {
  return <Component {...pageProps} key={router.route} />;
}
