import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#020817",
};

export const metadata: Metadata = {
  title: "AI Cloth Changer - Virtual Try-On Experience",
  description: "Experience virtual try-on powered by AI. Upload your photo and instantly see how different garments look on you. Transform your shopping experience with our advanced AI technology.",
  keywords: "AI cloth changer, virtual try-on, AI fashion, digital fitting room, virtual mirror, AI clothing, fashion technology, virtual clothing try-on",
  authors: [{ name: "Ali Hamza Kamboh", url: "https://alihamzakamboh.com" }],
  creator: "Ali Hamza Kamboh",
  publisher: "Ali Hamza Kamboh",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-cloth-changer.vercel.app",
    title: "AI Cloth Changer - Virtual Try-On Experience",
    description: "Transform your shopping experience with AI-powered virtual try-on technology.",
    siteName: "AI Cloth Changer",
    images: [{
      url: "/og-image.png", // Make sure to add this image to your public folder
      width: 1200,
      height: 630,
      alt: "AI Cloth Changer Preview"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Cloth Changer - Virtual Try-On Experience",
    description: "Transform your shopping experience with AI-powered virtual try-on technology.",
    creator: "@ahkamboh",
    images: ["/og-image.png"], // Same image as OpenGraph
  },
  manifest: "/manifest.json", // If you want to make your app installable (PWA)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Safe area for iOS devices */}
        <meta name="theme-color" content="#020817" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
