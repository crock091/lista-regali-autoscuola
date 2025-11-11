'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'

export default function CookiePolicyPage() {
  useEffect(() => {
    // Carica lo script Iubenda
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.innerHTML = `(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);`
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo.png" 
                alt="Logo Autoscuola Ardito" 
                width={120} 
                height={60}
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </div>
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-primary-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alla Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
          
          {/* Widget Iubenda Cookie Policy */}
          <div className="iubenda-content">
            <a 
              href="https://www.iubenda.com/privacy-policy/65066394/cookie-policy" 
              className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe" 
              title="Cookie Policy"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
