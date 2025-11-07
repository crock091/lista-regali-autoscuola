'use client'

import { Gift, Plus, Share2, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  // TODO: Implement actual data fetching and state management
  // For now, showing static mockup

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">La Mia Dashboard</h1>
              <p className="text-gray-600 mt-1">Gestisci le tue liste regali</p>
            </div>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Nuova Lista</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Liste Create</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">1</p>
              </div>
              <Gift className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Contributi Ricevuti</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">€450</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Persone Generose</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">7</p>
              </div>
              <Share2 className="h-12 w-12 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Lists */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Le Mie Liste Regali</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Example list item */}
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">La Mia Patente 🚗</h3>
                    <p className="text-gray-600 text-sm">Aiutami a realizzare il mio sogno!</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Attiva
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Iscrizione Autoscuola</span>
                    <span className="font-medium">€200 / €500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pacchetto 10 Guide</span>
                    <span className="font-medium">€250 / €400</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-100 flex items-center justify-center space-x-2">
                    <Share2 className="h-4 w-4" />
                    <span>Condividi</span>
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
                    Dettagli
                  </button>
                </div>
              </div>

              {/* Empty state when no lists */}
              {/* <div className="text-center py-12">
                <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna lista ancora</h3>
                <p className="text-gray-600 mb-4">Crea la tua prima lista regali per iniziare!</p>
                <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
                  Crea Lista
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
