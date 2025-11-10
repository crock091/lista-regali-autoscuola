'use client'

import { useState, useEffect } from 'react'
import { Gift, Copy, ExternalLink, TrendingUp, Car, Euro } from 'lucide-react'

interface DashboardData {
  student: {
    id: string
    nome: string
    cognome: string
    email: string
    categoriaPatente: string
  }
  giftList: {
    id: string
    titolo: string
    descrizione: string
    shareToken: string
    iscrizione: {
      importoTarget: number
      importoRaccolto: number
      percentuale: number
    }
    guide: {
      importoTarget: number
      importoRaccolto: number
      percentuale: number
      oreTarget: number
      oreRaggiunte: number
    }
    totale: {
      importoTarget: number
      importoRaccolto: number
      percentuale: number
    }
  }
  contributi: {
    numero: number
    recenti: Array<{
      nome: string
      importo: number
      data: string
      messaggio?: string
      stato: string // Aggiungiamo stato (pending, pending_verification, completed, rejected)
      note?: string // Note admin (motivo rifiuto)
    }>
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Controlla se l'utente è loggato
      const studentData = localStorage.getItem('student')
      if (!studentData) {
        window.location.href = '/login'
        return
      }

      const student = JSON.parse(studentData)
      const response = await fetch(`/api/student/dashboard?studentId=${student.id}`)
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      } else if (response.status === 401) {
        localStorage.removeItem('student') // Clear invalid session
        window.location.href = '/login'
      } else {
        setError('Errore nel caricamento dei dati')
      }
    } catch (err) {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = () => {
    if (data?.giftList.shareToken) {
      const shareUrl = `${window.location.origin}/regali/${data.giftList.shareToken}`
      navigator.clipboard.writeText(shareUrl)
      alert('Link copiato negli appunti! 🎉\nCondividilo con amici e parenti!')
    }
  }

  const openShareLink = () => {
    if (data?.giftList.shareToken) {
      const shareUrl = `${window.location.origin}/regali/${data.giftList.shareToken}`
      window.open(shareUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Errore nel caricamento'}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Ciao {data.student.nome}! 🚗
            </h1>
            <p className="text-gray-600 mt-1">
              La tua lista regali per la Patente {data.student.categoriaPatente}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Statistiche principali */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Totale Raccolto</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  €{data.giftList.totale.importoRaccolto.toFixed(2)}
                </p>
              </div>
              <Euro className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Guide Regalate</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  {(data.giftList.guide.importoRaccolto / 50).toFixed(1)}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-primary-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">
                guide di guida regalate
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Contributi</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {data.contributi.numero}
                </p>
              </div>
              <Gift className="h-12 w-12 text-blue-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">
                persone ti hanno aiutato
              </span>
            </div>
          </div>
        </div>

        {/* Progresso dettagliato */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">{data.giftList.titolo}</h2>
            <p className="text-gray-600 text-sm mt-1">{data.giftList.descrizione}</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Iscrizione */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-900">💳 Iscrizione</h3>
                <span className="text-sm font-medium text-gray-600">
                  €{data.giftList.iscrizione.importoRaccolto.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(data.giftList.iscrizione.percentuale, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Guide */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-900">🚗 Guide Pratiche</h3>
                <span className="text-sm font-medium text-gray-600">
                  €{data.giftList.guide.importoRaccolto.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(data.giftList.guide.percentuale, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(data.giftList.guide.importoRaccolto / 50).toFixed(1)} guide regalate ({data.giftList.guide.percentuale.toFixed(1)}%)
              </p>
            </div>

            {/* Progresso totale */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">🎯 Progresso Totale</h3>
                <span className="text-lg font-bold text-gray-900">
                  €{data.giftList.totale.importoRaccolto.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-6">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-6 rounded-full transition-all duration-700 flex items-center justify-center" 
                  style={{ width: `${Math.min(data.giftList.totale.percentuale, 100)}%` }}
                >
                  {data.giftList.totale.percentuale > 10 && (
                    <span className="text-white text-sm font-bold">
                      {data.giftList.totale.percentuale.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="text-center mt-2">
                {data.giftList.totale.percentuale >= 100 && (
                  <p className="text-sm text-gray-600">
                    🎉 Congratulazioni! Hai raggiunto il tuo obiettivo!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Azioni condivisione */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">📤 Condividi la tua lista</h2>
            <p className="text-gray-600 text-sm mt-1">
              Invia il link ai tuoi amici e parenti per ricevere contributi
            </p>
          </div>
          <div className="p-6">
            <div className="flex space-x-3">
              <button 
                onClick={copyShareLink}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center justify-center space-x-2 font-medium"
              >
                <Copy className="h-5 w-5" />
                <span>Copia Link</span>
              </button>
              <button 
                onClick={openShareLink}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2 font-medium"
              >
                <ExternalLink className="h-5 w-5" />
                <span>Visualizza Lista</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contributi recenti */}
        {data.contributi.recenti.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">💝 Contributi Recenti</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {data.contributi.recenti.map((contributo, index) => (
                <div key={index} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{contributo.nome}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(contributo.data).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      
                      {/* Stato contributo */}
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          contributo.stato === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : contributo.stato === 'pending_verification'
                              ? 'bg-orange-100 text-orange-800'
                              : contributo.stato === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {contributo.stato === 'completed' && '✅ Approvato'}
                          {contributo.stato === 'pending_verification' && '🔍 In verifica'}
                          {contributo.stato === 'rejected' && '❌ Rifiutato'}
                          {contributo.stato === 'pending' && '⏳ In attesa'}
                        </span>
                      </div>

                      {contributo.messaggio && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          &ldquo;{contributo.messaggio}&rdquo;
                        </p>
                      )}

                      {/* Note admin (motivo rifiuto) */}
                      {contributo.stato === 'rejected' && contributo.note && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-700">
                            <strong>Motivo rifiuto:</strong> {contributo.note}
                          </p>
                        </div>
                      )}
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      €{contributo.importo.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}