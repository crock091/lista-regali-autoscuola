'use client'

import { Gift, Heart, TrendingUp, Share2 } from 'lucide-react'
import { use } from 'react'

export default function GiftListPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  
  // TODO: Fetch actual data from API
  // For now, showing static mockup

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Gift className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Lista Regali di Mario Rossi 🎄
            </h1>
            <p className="text-gray-600">
              Aiutami a realizzare il mio sogno di prendere la patente!
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Progresso Totale</h2>
            <span className="text-2xl font-bold text-primary-600">€450 / €900</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div className="bg-gradient-to-r from-green-500 to-primary-600 h-4 rounded-full" style={{ width: '50%' }}></div>
          </div>
          <p className="text-sm text-gray-600">7 persone hanno già contribuito ❤️</p>
        </div>

        {/* Gift Items */}
        <div className="space-y-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-primary-50 p-4 border-b border-primary-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">💰 Iscrizione Autoscuola</h3>
                <span className="text-lg font-bold text-primary-600">€200 / €500</span>
              </div>
              <p className="text-gray-600 text-sm mt-1">Contributo per l&apos;iscrizione e materiale didattico</p>
            </div>
            <div className="p-4">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div className="bg-primary-600 h-3 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <button className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Contribuisci Ora</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-green-50 p-4 border-b border-green-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">🚗 Pacchetto 10 Guide Pratiche</h3>
                <span className="text-lg font-bold text-green-600">€250 / €400</span>
              </div>
              <p className="text-gray-600 text-sm mt-1">Guide pratiche con istruttore certificato</p>
            </div>
            <div className="p-4">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: '62%' }}></div>
              </div>
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Contribuisci Ora</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Contributions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-primary-600" />
            Contributi Recenti
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Nonna Maria ❤️</p>
                <p className="text-sm text-gray-600">per Iscrizione Autoscuola</p>
              </div>
              <span className="font-bold text-primary-600">€100</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Zio Antonio</p>
                <p className="text-sm text-gray-600">per Pacchetto Guide</p>
              </div>
              <span className="font-bold text-green-600">€50</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Amici del Liceo 🎓</p>
                <p className="text-sm text-gray-600">per Pacchetto Guide</p>
              </div>
              <span className="font-bold text-green-600">€150</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Vuoi creare anche tu la tua lista regali per la patente?
          </p>
          <a
            href="/"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <Gift className="h-5 w-5" />
            <span>Crea la Tua Lista</span>
          </a>
        </div>
      </main>
    </div>
  )
}
