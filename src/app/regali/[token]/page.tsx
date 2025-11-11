'use client'

import { Gift, Heart, TrendingUp, Share2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'

interface GiftListData {
  id: string
  titolo: string
  descrizione: string
  student: {
    nome: string
    cognome: string
  }
  giftItems: Array<{
    id: string
    tipo: string
    descrizione: string
    importoTarget: number
    importoRaccolto: number
    contributions: Array<{
      nome: string
      importo: number
      messaggio?: string
      dataContributo: string
    }>
  }>
}

export default function GiftListPage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<GiftListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [contributionForm, setContributionForm] = useState({
    nome: '',
    email: '',
    importo: '',
    messaggio: '',
    metodoPagamento: 'satispay'
  })
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasStartedPayment, setHasStartedPayment] = useState(false)
  
  const fetchGiftListData = useCallback(async () => {
    try {
      console.log('Fetching gift list data for token:', token)
      const response = await fetch(`/api/gift-lists/${token}`)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const giftListData = await response.json()
        console.log('Gift list data received:', giftListData)
        setData(giftListData)
      } else {
        const errorText = await response.text()
        console.log('Error response:', errorText)
        setError('Lista regalo non trovata')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }, [token])
  
  useEffect(() => {
    if (token) {
      fetchGiftListData()
    }
  }, [token, fetchGiftListData])

  const openContributionModal = (item: any) => {
    setSelectedItem(item)
    setShowModal(true)
    setPaymentResult(null)
    setContributionForm({
      nome: '',
      email: '',
      importo: '',
      messaggio: '',
      metodoPagamento: 'satispay'
    })
  }

  const closeContributionModal = () => {
    if (hasStartedPayment) {
      const confirmed = window.confirm('Hai un pagamento in corso. Sei sicuro di voler chiudere senza completare?')
      if (!confirmed) {
        return // Non chiudere se l'utente annulla
      }
    }
    
    setShowModal(false)
    setSelectedItem(null)
    setPaymentResult(null)
    setHasStartedPayment(false)
    setContributionForm({
      nome: '',
      email: '',
      importo: '',
      messaggio: '',
      metodoPagamento: 'satispay'
    })
    
    // Per bonifico ricarica i dati (può essere stato confermato)
    // Per Satispay non ricaricare (deve essere confermato manualmente dall'admin)
    if (paymentResult?.paymentInfo?.type === 'bonifico') {
      fetchGiftListData()
    }
  }

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedItem || !contributionForm.nome || !contributionForm.importo) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    setIsSubmitting(true)
    setPaymentResult(null)

    try {
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          giftItemId: selectedItem.id,
          nome: contributionForm.nome,
          email: contributionForm.email,
          importo: parseFloat(contributionForm.importo),
          messaggio: contributionForm.messaggio,
          metodoPagamento: contributionForm.metodoPagamento
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setPaymentResult(result)
        // Non chiudiamo il modal per mostrare le istruzioni di pagamento
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Errore nell\'invio del contributo')
      }
    } catch (error) {
      console.error('Errore:', error)
      alert('Errore nell\'invio del contributo')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento lista regalo...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Lista non trovata'}</p>
          <a 
            href="/registrazione"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Crea la tua lista
          </a>
        </div>
      </div>
    )
  }

  // Controlli di sicurezza per evitare errori se giftItems è undefined
  const giftItems = data?.giftItems || []
  
  const totalContributions = giftItems.reduce((sum, item) => 
    sum + (item.contributions?.length || 0), 0
  )
  const totalAmount = giftItems.reduce((sum, item) => 
    sum + (item.importoRaccolto || 0), 0
  )
  const targetAmount = giftItems.reduce((sum, item) => 
    sum + (item.importoTarget || 0), 0
  )
  
  const allContributions = giftItems.flatMap(item => 
    (item.contributions || []).map(contrib => ({
      ...contrib,
      itemDescrizione: item.descrizione
    }))
  ).sort((a, b) => new Date(b.dataContributo).getTime() - new Date(a.dataContributo).getTime())

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
              Lista Regali di {data.student?.nome || 'Studente'} {data.student?.cognome || ''} 🎄
            </h1>
            <p className="text-gray-600">
              {data.descrizione || 'Aiutami a realizzare il mio sogno di prendere la patente!'}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Progresso Totale</h2>
            <span className="text-2xl font-bold text-primary-600">
              €{totalAmount.toFixed(2)} / €{targetAmount.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-primary-600 h-4 rounded-full" 
              style={{ width: `${targetAmount > 0 ? Math.min((totalAmount / targetAmount) * 100, 100) : 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {totalContributions} persone hanno già contribuito ❤️
          </p>
        </div>

        {/* Gift Items */}
        <div className="space-y-6 mb-8">
          {giftItems.map((item, index) => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className={`p-4 border-b ${item.tipo === 'iscrizione' ? 'bg-primary-50 border-primary-100' : 'bg-green-50 border-green-100'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-gray-900">
                    {item.tipo === 'iscrizione' ? '💰' : '🚗'} {item.descrizione}
                  </h3>
                  <span className={`text-lg font-bold ${item.tipo === 'iscrizione' ? 'text-primary-600' : 'text-green-600'}`}>
                    €{item.importoRaccolto.toFixed(2)} / €{item.importoTarget.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className={`h-3 rounded-full ${item.tipo === 'iscrizione' ? 'bg-primary-600' : 'bg-green-600'}`} 
                    style={{ width: `${item.importoTarget > 0 ? Math.min((item.importoRaccolto / item.importoTarget) * 100, 100) : 0}%` }}
                  ></div>
                </div>
                <button 
                  onClick={() => openContributionModal(item)}
                  className={`w-full text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                    item.tipo === 'iscrizione' 
                      ? 'bg-primary-600 hover:bg-primary-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  <span>Contribuisci Ora</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Contributions */}
        {allContributions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-primary-600" />
              Contributi Recenti
            </h2>
            <div className="space-y-3">
              {allContributions.slice(0, 5).map((contribution, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{contribution.nome}</p>
                    <p className="text-sm text-gray-600">per {contribution.itemDescrizione}</p>
                      {contribution.messaggio && (
                        <p className="text-xs text-gray-500 italic mt-1">&ldquo;{contribution.messaggio}&rdquo;</p>
                      )}
                  </div>
                  <span className="font-bold text-primary-600">
                    €{contribution.importo.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Vuoi creare anche tu la tua lista regali per la patente?
          </p>
          <a
            href="/registrazione"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <Gift className="h-5 w-5" />
            <span>Crea la Tua Lista</span>
          </a>
        </div>
      </main>

      {/* Modal Contributo */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            {/* Pulsante di chiusura in alto a destra */}
            <button
              onClick={closeContributionModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              disabled={isSubmitting}
            >
              ×
            </button>
            
            {!paymentResult ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4 pr-8">
                  Contribuisci per: {selectedItem?.descrizione}
                </h3>
                
                <form onSubmit={handleContributionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Il tuo nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={contributionForm.nome}
                      onChange={(e) => setContributionForm(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Mario Rossi"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      La tua email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contributionForm.email}
                      onChange={(e) => setContributionForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="mario.rossi@email.com"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Riceverai una conferma e la ricevuta del pagamento
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Importo (€) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={contributionForm.importo}
                      onChange={(e) => setContributionForm(prev => ({ ...prev, importo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="50.00"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Messaggio (opzionale)
                    </label>
                    <textarea
                      value={contributionForm.messaggio}
                      onChange={(e) => setContributionForm(prev => ({ ...prev, messaggio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                      placeholder="Un messaggio di auguri..."
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Metodo di pagamento
                    </label>
                    <select
                      value={contributionForm.metodoPagamento}
                      onChange={(e) => setContributionForm(prev => ({ ...prev, metodoPagamento: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      disabled={isSubmitting}
                    >
                      <option value="satispay">Satispay</option>
                      <option value="bonifico">Bonifico Bancario</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeContributionModal}
                      className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                      disabled={isSubmitting}
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-gray-400"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Elaborando...' : 'Continua'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <PaymentInstructions 
                paymentResult={paymentResult}
                onClose={closeContributionModal}
                hasStartedPayment={hasStartedPayment}
                setHasStartedPayment={setHasStartedPayment}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente per mostrare le istruzioni di pagamento
function PaymentInstructions({ paymentResult, onClose, hasStartedPayment, setHasStartedPayment }: { 
  paymentResult: any, 
  onClose: () => void,
  hasStartedPayment: boolean,
  setHasStartedPayment: (value: boolean) => void
}) {
  const { paymentInfo } = paymentResult
  const [isSubmittingContabile, setIsSubmittingContabile] = useState(false)
  const [ricevutaFile, setRicevutaFile] = useState<File | null>(null)
  const [isUploadingRicevuta, setIsUploadingRicevuta] = useState(false)
  const [contabileFile, setContabileFile] = useState<File | null>(null)
  const [isUploadingContabile, setIsUploadingContabile] = useState(false)

  const handleSubmitContabile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contabileFile) {
      alert('Carica il PDF della contabile del bonifico')
      return
    }

    setIsUploadingContabile(true)
    setHasStartedPayment(true)
    
    try {
      const formData = new FormData()
      formData.append('contributionId', paymentResult.contribution.id)
      formData.append('contabile-pdf', contabileFile)

      const response = await fetch('/api/contributions/upload-bank-receipt', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        alert('Ricevuta PDF caricata con successo! ✅ Il contributo sarà verificato dall\'autoscuola.')
        setHasStartedPayment(false)
        onClose()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Errore nel caricare la ricevuta')
      }
    } catch (error) {
      console.error('Errore:', error)
      alert('Errore nel caricare la ricevuta')
    } finally {
      setIsUploadingContabile(false)
    }
  }

  const handleUploadRicevuta = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!ricevutaFile) {
      alert('Seleziona il file PDF della ricevuta Satispay')
      return
    }

    setIsUploadingRicevuta(true)
    setHasStartedPayment(true)
    
    try {
      const formData = new FormData()
      formData.append('contributionId', paymentResult.contribution.id)
      formData.append('ricevuta', ricevutaFile)

      const response = await fetch('/api/contributions/upload-receipt', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        alert('Ricevuta caricata con successo! ✅ Il contributo sarà verificato dall\'autoscuola.')
        setHasStartedPayment(false)
        onClose()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Errore nel caricare la ricevuta')
      }
    } catch (error) {
      console.error('Errore:', error)
      alert('Errore nel caricare la ricevuta')
    } finally {
      setIsUploadingRicevuta(false)
    }
  }

  if (paymentInfo.type === 'satispay') {
    return (
      <>
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Heart className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Contributo Registrato! 🎉
          </h3>
          <p className="text-gray-600 mb-4">{paymentInfo.message}</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-orange-800 mb-2">📱 Pagamento con Satispay</h4>
          <p className="text-orange-700 text-sm mb-3">{paymentInfo.instructions}</p>
          
            <div className="space-y-3">
            <div className="text-sm space-y-1">
              <p><strong>Importo:</strong> €{paymentInfo.amount.toFixed(2)}</p>
              <p><strong>Beneficiario:</strong> {paymentInfo.studentName}</p>
              <p><strong>Causale:</strong> {paymentInfo.description}</p>
              <p><strong>Riferimento:</strong> {paymentInfo.reference}</p>
            </div>
            
            {/* Nota per identificazione pagamento */}
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs">
              <p><strong>📋 Per l&apos;autoscuola:</strong></p>
              <p>Il pagamento sarà identificato tramite importo, orario e nome del cliente. 
              Riferimento interno: <strong>{paymentInfo.reference}</strong></p>
            </div>            {/* Link di pagamento Satispay */}
            {paymentInfo.paymentLink && (
              <div className="text-center space-y-3">
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <div className="text-6xl mb-2">📱</div>
                  <p className="text-sm text-gray-600 mb-3">
                    Clicca il pulsante sotto per aprire Satispay
                  </p>
                  <a
                    href={paymentInfo.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setHasStartedPayment(true)}
                    className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
                  >
                    <span>🚀</span>
                    <span>Paga con Satispay</span>
                  </a>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
                  <p><strong>💡 Come funziona:</strong></p>
                  <ol className="list-decimal list-inside mt-1 space-y-1 text-left">
                    <li>Clicca &ldquo;Vai al Negozio Satispay&rdquo;</li>
                    <li>Si aprirà l&apos;app Satispay sul negozio dell&apos;autoscuola</li>
                    <li>Inserisci l&apos;importo: <strong>€{paymentInfo.amount.toFixed(2)}</strong></li>
                    <li>Conferma il pagamento</li>
                    <li>La conferma avverrà in orario di ufficio</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Istruzioni manuali alternative */}
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm">
              <p className="font-medium text-gray-700 mb-2">📝 Alternativa manuale:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Apri l&apos;app Satispay</li>
                <li>Tocca &ldquo;Paga&rdquo; nell&apos;app</li>
                <li>Usa il link diretto al negozio qui sopra</li>
                <li>Inserisci l&apos;importo: <strong>€{paymentInfo.amount.toFixed(2)}</strong></li>
                <li>Conferma il pagamento</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
          <p className="text-blue-800">
            <strong>📋 Importante:</strong> Dopo aver effettuato il pagamento, carica la ricevuta PDF per completare la procedura.
          </p>
        </div>

        {/* Form upload ricevuta Satispay */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-orange-800 mb-2">📄 Carica Ricevuta Satispay</h4>
          <p className="text-orange-700 text-sm mb-3">
            Per confermare il pagamento, carica il PDF della ricevuta che hai ricevuto da Satispay.
          </p>
          
          <form onSubmit={handleUploadRicevuta}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-orange-700 mb-1">
                File Ricevuta PDF *
              </label>
              <input
                type="file"
                accept=".pdf"
                required
                onChange={(e) => setRicevutaFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                disabled={isUploadingRicevuta}
              />
              <p className="text-xs text-orange-600 mt-1">
                Solo file PDF, dimensione massima 5MB
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:bg-gray-400"
              disabled={isUploadingRicevuta}
            >
              {isUploadingRicevuta ? 'Caricamento...' : 'Carica Ricevuta e Conferma'}
            </button>
          </form>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            {hasStartedPayment ? 'Chiudi (attenzione: pagamento in corso)' : 'Chiudi (caricherò la ricevuta più tardi)'}
          </button>
        </div>
      </>
    )
  }

  if (paymentInfo.type === 'bonifico') {
    return (
      <>
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Heart className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Contributo Registrato! 🎉
          </h3>
          <p className="text-gray-600 mb-4">{paymentInfo.message}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-blue-800 mb-2">🏦 Coordinate Bonifico</h4>
          <p className="text-blue-700 text-sm mb-3">{paymentInfo.instructions}</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Banca:</span>
              <span>{paymentInfo.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">IBAN:</span>
              <span className="font-mono text-xs">{paymentInfo.iban}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Beneficiario:</span>
              <span>{paymentInfo.recipient}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Importo:</span>
              <span className="font-bold">€{paymentInfo.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Causale:</span>
              <span className="font-mono text-xs">{paymentInfo.reference}</span>
            </div>
          </div>

          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
            <strong>⚠️ Importante:</strong> Inserisci esattamente la causale <strong>{paymentInfo.reference}</strong> per identificare il tuo contributo.
          </div>
        </div>

        {/* Form per caricare ricevuta bonifico */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-green-800 mb-2">📋 Conferma Bonifico</h4>
          <p className="text-green-700 text-sm mb-3">
            Dopo aver effettuato il bonifico, carica qui la ricevuta PDF.
          </p>
          
          <form onSubmit={handleSubmitContabile}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-green-700 mb-1">
                Ricevuta Bonifico PDF *
              </label>
              <input
                type="file"
                accept=".pdf"
                required
                onChange={(e) => setContabileFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                disabled={isUploadingContabile}
              />
              <p className="text-xs text-green-600 mt-1">
                Carica la ricevuta/contabile in PDF che hai ricevuto dalla tua banca (max 5MB)
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
              disabled={isUploadingContabile}
            >
              {isUploadingContabile ? 'Caricamento...' : 'Carica Ricevuta e Conferma'}
            </button>
          </form>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            {hasStartedPayment ? 'Chiudi (attenzione: pagamento in corso)' : 'Chiudi (confermerò la contabile più tardi)'}
          </button>
        </div>
      </>
    )
  }

  return null
}
