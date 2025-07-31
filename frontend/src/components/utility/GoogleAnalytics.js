// File: frontend/src/components/utility/GoogleAnalytics.js
'use client';

import Script from 'next/script';

const GoogleAnalytics = () => {
  // IMPORTANT: Replace with your actual Measurement ID from Google Analytics
  const measurementId = "G-K3NNDZNZ00";

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}');
          `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;