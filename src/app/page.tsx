import Link from 'next/link'
import Image from 'next/image'
import { Gift, Car, Users, CreditCard } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Logo Autoscuola Ardito" 
                width={180} 
                height={90}
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </div>
            <div className="space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                Accedi
              </Link>
              <Link
                href="/registrazione"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Registrati
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            Il Regalo Perfetto per Natale 🎄
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Crea la tua lista regali personalizzata e ricevi contributi da amici e parenti
            per realizzare il tuo sogno di prendere la patente!
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Gift className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Registrati e Ottieni la tua Lista</h3>
            <p className="text-gray-600">
              Lista completa già pronta con iscrizione e guide pratiche. Tutto quello che ti serve per la patente!
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Condividi con Tutti</h3>
            <p className="text-gray-600">
              Genera un link unico da inviare ad amici e parenti. Loro potranno vedere la tua lista e contribuire.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Pagamenti Diretti</h3>
            <p className="text-gray-600">
              I contributi vengono pagati direttamente all&apos;autoscuola tramite Satispay o bonifico bancario.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-primary-600 text-white rounded-2xl p-12">
          <h3 className="text-3xl font-bold mb-4">Inizia Ora!</h3>
          <p className="text-xl mb-8 opacity-90">
            Registrati gratuitamente e crea la tua lista regali in pochi minuti
          </p>
          <Link
            href="/registrazione"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition inline-block"
          >
            Crea la Mia Lista
          </Link>
        </div>

        {/* How it works */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">Come Funziona</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-bold mb-2">Registrati</h4>
              <p className="text-gray-600 text-sm">Crea il tuo account gratuito e ottieni la tua lista</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-bold mb-2">Condividi</h4>
              <p className="text-gray-600 text-sm">Invia il link ad amici e parenti</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-bold mb-2">Ricevi Contributi</h4>
              <p className="text-gray-600 text-sm">Paga la tua patente coi regali!</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2025 Lista Regali Autoscuola Ardito. Tutti i diritti riservati.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="text-sm hover:text-primary-400">
                Privacy Policy
              </Link>
              <Link href="/cookie-policy" className="text-sm hover:text-primary-400">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
