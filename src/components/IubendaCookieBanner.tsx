'use client'

import Script from 'next/script'

export default function IubendaCookieBanner() {
  return (
    <>
      <Script 
        id="iubenda-cookie-banner"
        src="https://embeds.iubenda.com/widgets/58101ae9-a24a-421e-9ef9-74bf193491e5.js"
        strategy="afterInteractive"
      />
    </>
  )
}
