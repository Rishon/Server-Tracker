import Script from "next/script";
import { CLARITY_ID, GA_ID } from "@/data/Analytics";

export default function Analytics() {
  return (
    <>
      {GA_ID && (
        <>
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
window.gtag = function () { dataLayer.push(arguments); };
gtag("consent", "default", {
  analytics_storage: "granted",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
});
gtag("js", new Date());
gtag("config", "${GA_ID}");`}
          </Script>
          <Script
            id="ga"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
        </>
      )}

      {CLARITY_ID && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");
clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });`}
        </Script>
      )}
    </>
  );
}
