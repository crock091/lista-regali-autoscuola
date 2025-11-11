'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Login avvenuto con successo - salva i dati dello studente
        localStorage.setItem('student', JSON.stringify(data.student))
        router.push('/dashboard')
      } else {
        setError(data.error || 'Errore durante il login')
      }
    } catch (error) {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="mario.rossi@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="La tua password"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Accesso...' : 'Accedi'}
        </button>
      </div>

      <div className="text-center text-sm">
        <span className="text-gray-600">Non hai un account? </span>
        <Link href="/registrazione" className="font-medium text-primary-600 hover:text-primary-500">
          Registrati
        </Link>
      </div>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <Image 
            src="/logo.png" 
            alt="Logo Autoscuola Ardito" 
            width={200} 
            height={100}
            className="mb-4"
            priority
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Accedi al tuo account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Gestisci la tua lista regali
          </p>
        </div>
        <Suspense fallback={<div>Caricamento...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}