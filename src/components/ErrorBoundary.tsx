'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">
                Errore nell&apos;applicazione
              </h1>
              <p className="text-gray-600 mb-6">
                Si &egrave; verificato un errore imprevisto. Prova a ricaricare la pagina.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
                >
                  Ricarica Pagina
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Torna alla Home
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 text-left">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-500">
                      Dettagli errore (dev)
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 text-red-600 text-xs overflow-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}