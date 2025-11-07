'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Gift, TrendingUp, Euro, Calendar, Download, LogOut } from 'lucide-react'

interface Student {
  id: string
  email: string
  nome: string
  cognome: string
  telefono: string | null
  createdAt: string
  giftLists: GiftList[]
}

interface GiftList {
  id: string
  titolo: string
  shareToken: string
  attiva: boolean
  createdAt: string
  giftItems: GiftItem[]
}

interface GiftItem {
  id: string
  tipo: string
  descrizione: string
  importoTarget: number
  importoRaccolto: number
  contributions: Contribution[]
}

interface Contribution {
  id: string
  nome: string
  email: string | null
  importo: number
  metodoPagamento: string
  stato: string
  dataContributo: string
  messaggio: string | null
  ricevutaPath: string | null
}

interface AdminStats {
  totalStudents: number
  totalLists: number
  totalContributions: number
  totalAmount: number
  pendingAmount: number
  completedContributions: number
}

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pendingContributions, setPendingContributions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'contributions'>('overview')
  const [adminData, setAdminData] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Controllo autenticazione admin
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const adminInfo = localStorage.getItem('adminData')
    
    if (!token || !adminInfo) {
      router.push('/admin/login')
      return
    }

    try {
      const adminParsed = JSON.parse(adminInfo)
      setAdminData(adminParsed)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Errore parsing dati admin:', error)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminData')
      router.push('/admin/login')
    }
  }, [router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData()
    }
  }, [isAuthenticated])

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()
      
      if (response.ok) {
        setStats(data.stats)
        setStudents(data.students)
        setPendingContributions(data.pendingContributions || [])
      } else {
        console.error('Error fetching admin data:', data.error)
        // Fallback ai dati mock se l'API non funziona
        setStats({
          totalStudents: 0,
          totalLists: 0,
          totalContributions: 0,
          totalAmount: 0,
          pendingAmount: 0,
          completedContributions: 0
        })
        setStudents([])
        setPendingContributions([])
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      setLoading(false)
      
      // Dati di fallback
      setStats({
        totalStudents: 0,
        totalLists: 0,
        totalContributions: 0,
        totalAmount: 0,
        pendingAmount: 0,
        completedContributions: 0
      })
      setStudents([])
      setPendingContributions([])
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
    router.push('/admin/login')
  }

  const exportData = async () => {
    try {
      const response = await fetch('/api/admin/export?format=csv')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = 'contributi_autoscuola.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Errore durante l\'esportazione')
      }
    } catch (error) {
      console.error('Errore durante l\'esportazione:', error)
    }
  }

  const approveContribution = async (contributionId: string) => {
    if (!confirm('Confermi l\'approvazione di questo contributo? Il saldo dello studente verrà aggiornato.')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/admin/approve-contribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ contributionId, action: 'approve' })
      })

      if (response.ok) {
        alert('Contributo approvato con successo! ✅')
        await fetchAdminData() // Ricarica i dati
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Errore nell\'approvazione del contributo')
      }
    } catch (error) {
      console.error('Error approving contribution:', error)
      alert('Errore nell\'approvazione del contributo')
    } finally {
      setLoading(false)
    }
  }

  const rejectContribution = async (contributionId: string) => {
    const reason = prompt('Inserisci il motivo del rifiuto (opzionale):')
    if (reason === null) return // Utente ha annullato

    try {
      setLoading(true)
      const response = await fetch('/api/admin/approve-contribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ contributionId, action: 'reject', reason })
      })

      if (response.ok) {
        alert('Contributo rifiutato. ❌')
        await fetchAdminData() // Ricarica i dati
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Errore nel rifiuto del contributo')
      }
    } catch (error) {
      console.error('Error rejecting contribution:', error)
      alert('Errore nel rifiuto del contributo')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dati admin...</p>
        </div>
      </div>
    )
  }

  // Se non è autenticato, non renderizzare nulla (il redirect gestisce la navigazione)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Verificando autenticazione...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600 mt-1">
                Benvenuto, {adminData?.nome} • Gestione liste regali autoscuola
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportData}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Esporta Dati</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Allievi Registrati</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
                </div>
                <Users className="h-12 w-12 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Liste Create</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalLists}</p>
                </div>
                <Gift className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Totale Raccolto</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">€{stats.totalAmount.toFixed(2)}</p>
                </div>
                <Euro className="h-12 w-12 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Contributi</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completedContributions}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Panoramica
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Allievi
              </button>
              <button
                onClick={() => setActiveTab('contributions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contributions'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Contributi
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Statistiche principali */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Allievi</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Liste Attive</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalLists}</p>
                        </div>
                        <Gift className="h-8 w-8 text-green-600" />
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Totale Raccolto</p>
                          <p className="text-2xl font-bold text-green-600">€{stats.totalAmount.toFixed(2)}</p>
                        </div>
                        <Euro className="h-8 w-8 text-green-600" />
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Contributi</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalContributions}</p>
                          <p className="text-xs text-gray-500">{stats.completedContributions} completati</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Alert per contributi in attesa */}
                {pendingContributions.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-bold text-sm">!</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-orange-800">
                            {pendingContributions.length} Contributi da Verificare
                          </h3>
                          <p className="text-orange-700">
                            Ci sono contributi con ricevute PDF in attesa della tua approvazione.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('contributions')}
                        className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 text-sm font-medium"
                      >
                        Verifica Ora
                      </button>
                    </div>
                  </div>
                )}

                {/* Attività recenti */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Attività Recente</h3>
                  {students.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Nessuna attività recente</p>
                      <p className="text-sm text-gray-400 mt-1">Le attività appariranno qui quando ci saranno nuovi allievi e contributi</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {students.slice(0, 3).map(student => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{student.nome} {student.cognome}</p>
                            <p className="text-sm text-gray-600">
                              Registrato il {new Date(student.createdAt).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{student.giftLists.length} lista/e</p>
                            <p className="text-sm font-medium text-green-600">
                              €{student.giftLists.reduce((total, list) => 
                                total + list.giftItems.reduce((sum, item) => sum + item.importoRaccolto, 0), 0
                              ).toFixed(2)} raccolti
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Lista Allievi</h3>
                {students.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Nessun allievo registrato</p>
                    <p className="text-sm text-gray-400 mt-1">I nuovi allievi appariranno qui dopo la registrazione</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Allievo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Liste
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Totale Raccolto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registrato
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.nome} {student.cognome}
                              </div>
                              <div className="text-sm text-gray-500">{student.telefono}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.giftLists.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            €{student.giftLists.reduce((total, list) => 
                              total + list.giftItems.reduce((sum, item) => sum + item.importoRaccolto, 0), 0
                            ).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(student.createdAt).toLocaleDateString('it-IT')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}

            {activeTab === 'contributions' && (
              <div className="space-y-6">
                {/* Sezione contributi in attesa di verifica */}
                {pendingContributions.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-800 mb-4">
                      🔔 Contributi in Attesa di Verifica ({pendingContributions.length})
                    </h3>
                    <div className="space-y-4">
                      {pendingContributions.map(contribution => (
                        <div key={contribution.id} className="bg-white p-4 rounded-lg border border-orange-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{contribution.nome}</p>
                              <p className="text-sm text-gray-600">
                                Contributo per: {contribution.giftItem.giftList.student.nome} {contribution.giftItem.giftList.student.cognome}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(contribution.dataContributo).toLocaleDateString('it-IT')} • {contribution.metodoPagamento}
                                {contribution.ricevutaPath && (
                                  <span className="ml-2">
                                    <a 
                                      href={contribution.ricevutaPath}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-xs"
                                    >
                                      📄 Vedi Ricevuta
                                    </a>
                                  </span>
                                )}
                              </p>
                              {contribution.messaggio && (
                                <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{contribution.messaggio}&rdquo;</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-orange-600">€{contribution.importo.toFixed(2)}</p>
                              <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                                contribution.stato === 'pending_verification'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {contribution.stato === 'pending_verification' ? 'Da verificare' : 'In attesa'}
                              </span>
                              
                              {/* Pulsanti di approvazione per contributi da verificare */}
                              {contribution.stato === 'pending_verification' && contribution.ricevutaPath && (
                                <div className="mt-2 flex space-x-2">
                                  <button
                                    onClick={() => approveContribution(contribution.id)}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                    disabled={loading}
                                  >
                                    ✅ Approva
                                  </button>
                                  <button
                                    onClick={() => rejectContribution(contribution.id)}
                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                    disabled={loading}
                                  >
                                    ❌ Rifiuta
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold">Contributi Completati</h3>
                {students.flatMap(student =>
                  student.giftLists.flatMap(list =>
                    list.giftItems.flatMap(item => item.contributions)
                  )
                ).length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Nessun contributo ricevuto</p>
                    <p className="text-sm text-gray-400 mt-1">I contributi appariranno qui quando gli allievi riceveranno regali</p>
                  </div>
                ) : (
                <div className="space-y-4">
                  {students.flatMap(student =>
                    student.giftLists.flatMap(list =>
                      list.giftItems.flatMap(item =>
                        item.contributions.map(contribution => (
                          <div key={contribution.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{contribution.nome}</p>
                                <p className="text-sm text-gray-600">
                                  Contributo per: {student.nome} {student.cognome} - {item.descrizione}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {new Date(contribution.dataContributo).toLocaleDateString('it-IT')} • {contribution.metodoPagamento}
                                  {contribution.ricevutaPath && (
                                    <span className="ml-2">
                                      <a 
                                        href={contribution.ricevutaPath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                      >
                                        📄 Vedi Ricevuta
                                      </a>
                                    </span>
                                  )}
                                </p>
                                {contribution.messaggio && (
                                  <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{contribution.messaggio}&rdquo;</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">€{contribution.importo.toFixed(2)}</p>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                                  contribution.stato === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : contribution.stato === 'pending_verification'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {contribution.stato === 'completed' ? 'Completato' : 
                                   contribution.stato === 'pending_verification' ? 'Da verificare' : 'In attesa'}
                                </span>
                                
                                {/* Pulsanti di approvazione per contributi da verificare */}
                                {contribution.stato === 'pending_verification' && contribution.ricevutaPath && (
                                  <div className="mt-2 flex space-x-2">
                                    <button
                                      onClick={() => approveContribution(contribution.id)}
                                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                      disabled={loading}
                                    >
                                      ✅ Approva
                                    </button>
                                    <button
                                      onClick={() => rejectContribution(contribution.id)}
                                      className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                      disabled={loading}
                                    >
                                      ❌ Rifiuta
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )
                    )
                  )}
                </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}