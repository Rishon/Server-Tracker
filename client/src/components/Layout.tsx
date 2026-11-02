// Next.js
import Head from "next/head";

interface LayoutProps {
  children: React.ReactNode;
  seo?: {
    title?: string;
    description?: string;
    path?: string;
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_HOSTNAME;
const SITE_NAME = "Server Tracker";
const DEFAULT_DESCRIPTION =
  "Live player counts, MOTDs, 24-hour graphs and uptime for Minecraft and Hytale servers.";

const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  publisher: {
    "@type": "Organization",
    name: "Sela Development",
  },
});

const RootLayout = ({ children, seo }: LayoutProps) => {
  const title = seo?.title ? `${seo.title} | ${SITE_NAME}` : SITE_NAME;
  const description = seo?.description || DEFAULT_DESCRIPTION;
  const url =
    seo?.path && seo.path !== "/" ? `${SITE_URL}${seo.path}` : SITE_URL;
  const image = `${SITE_URL}/assets/og.png`;

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="author" content="Rishon" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0f0f10" />

        {/* OpenGraph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={SITE_NAME} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />

        <link rel="canonical" href={url} />
        <link rel="icon" href="/assets/favicon.ico" />

        <script
          key="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </Head>

      <div className="bg-black-gray-dots bg-dots-pattern min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default RootLayout;
