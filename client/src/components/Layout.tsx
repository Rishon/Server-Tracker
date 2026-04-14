// Next.js
import Head from "next/head";
import Script from "next/script";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

interface LayoutProps {
  children: React.ReactNode;
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

const RootLayout = ({ children, seo }: LayoutProps) => {
  const domain = process.env.NEXT_PUBLIC_HOSTNAME;

  const fallbackTitle = "Server Tracker";
  const fallbackDescription =
    "Live tracking of player counts, MOTDs, and historical uptime.";

  const title = seo?.title ? `${seo.title} | Server Tracker` : fallbackTitle;
  const description = seo?.description || fallbackDescription;
  const image = seo?.image;

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="author" content="Rishon" />
        <meta name="keywords" content="Tracker, Minecraft, Israel, Servers" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#FFFFFF" />

        {/* OpenGraph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        {domain && <meta property="og:url" content={`https://${domain}`} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />

        <link rel="canonical" href={domain} />
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>

      {/* JSON-LD Structured Data */}
      <Script
        id="json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: domain,
            name: "Server Tracker",
            author: {
              "@type": "Organization",
              name: "Sela Development",
            },
            description: "Track Minecraft servers",
            potentialAction: {
              "@type": "SearchAction",
              target: `https://${domain}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <main className="bg-black-gray-dots bg-dots-pattern min-h-screen">
        <Navbar />
        {children}
        <Footer />
      </main>

      {/* Cookie Banner & Analytics */}
      <CookieBanner />
    </div>
  );
};

export default RootLayout;
