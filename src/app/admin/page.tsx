'use client'

import { useEffect, useState } from 'react'
import { Users, Gift, TrendingUp, Euro, Calendar, Download } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'contributions'>('overview')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()
      
      if (response.ok) {
        setStats(data.stats)
        setStudents(data.students)
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
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600 mt-1">Gestione liste regali autoscuola</p>
            </div>
            <button
              onClick={exportData}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Esporta Dati</span>
            </button>
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
                <h3 className="text-lg font-semibold">Attività Recente</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Mario Rossi ha ricevuto un contributo</p>
                      <p className="text-sm text-gray-600">€200 da Nonna Maria - 3 giorni fa</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Completato
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Nuovo allievo registrato</p>
                      <p className="text-sm text-gray-600">Giulia Bianchi - 1 settimana fa</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Nuovo
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Lista Allievi</h3>
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
              </div>
            )}

            {activeTab === 'contributions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Contributi Ricevuti</h3>
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
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {contribution.stato === 'completed' ? 'Completato' : 'In attesa'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}