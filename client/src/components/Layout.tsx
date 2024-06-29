// Next.js
import Head from "next/head";
import Script from "next/script";

// Analytics
import { GoogleAnalytics } from "@next/third-parties/google";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";

// React
import { useState } from "react";

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const domain = process.env.NEXT_PUBLIC_HOSTNAME;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Server Tracker</title>
        <meta name="description" content="Track Israeli minecraft servers" />
        <meta name="author" content="Tracker" />
        <meta name="keywords" content="Tracker, Minecraft, Israel, Servers" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#FFFFFF" />

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
            name: "Tracker",
            author: {
              "@type": "Organization",
              name: "Sela Development",
            },
            description: "Track Israeli minecraft servers",
            potentialAction: {
              "@type": "SearchAction",
              target: `https://${domain}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <main className="bg-black-gray-dots bg-dots-pattern min-h-screen">
        <Navbar toggleSidebar={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        {children}
        <Footer />
      </main>

      {/* Google Analytics */}
      <GoogleAnalytics gaId={`G-08RW5HWFEH`} />
    </div>
  );
};

export default RootLayout;
