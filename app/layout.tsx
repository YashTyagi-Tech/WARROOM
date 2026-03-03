import "./globals.css";
import Script from "next/script";

export const metadata = {
title: "WarRoom — Real-Time Global Intelligence",
  description: "Live Iran–Israel–USA conflict tracking & market reaction dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,100;0,300;0,400;0,700;1,300&display=swap" rel="stylesheet" />

                <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" strategy="beforeInteractive"></Script>
                <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" strategy="beforeInteractive"></Script>
                <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollToPlugin.min.js" strategy="beforeInteractive"></Script>
                <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" strategy="beforeInteractive"></Script>
            </head>
            <body>{children}</body>
        </html>
    );
}
