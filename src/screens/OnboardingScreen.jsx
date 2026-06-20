import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { createAccount, signIn } from '../api/authService.js'

// Traduit les codes d'erreur Firebase en messages lisibles
function firebaseErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use':    return 'Cet email est déjà utilisé.'
    case 'auth/invalid-email':           return 'Email invalide.'
    case 'auth/weak-password':           return 'Mot de passe trop court (6 caractères min).'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':      return 'Email ou mot de passe incorrect.'
    case 'auth/too-many-requests':       return 'Trop de tentatives. Réessaie plus tard.'
    default:                             return 'Une erreur est survenue. Réessaie.'
  }
}

export default function OnboardingScreen() {
  const [mode, setMode]         = useState('register') // 'register' | 'login'
  const [pseudo, setPseudo]     = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress]   = useState('')
  const [consent, setConsent]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (mode === 'register') {
      if (!consent)        { setError('Active la géolocalisation pour continuer.'); return }
      if (!pseudo.trim())  { setError('Choisis un pseudo.'); return }
      if (!address.trim()) { setError('Saisis ton adresse domicile.'); return }
    }

    setLoading(true)
    try {
      let user
      if (mode === 'register') {
        user = await createAccount({
          email:   email.trim(),
          password,
          pseudo:  pseudo.trim(),
          address: address.trim(),
        })
      } else {
        user = await signIn({ email: email.trim(), password })
      }
      login(user)
      navigate('/feed')
    } catch (err) {
      // Erreur d'adresse introuvable → message spécifique
      if (err.message === 'ADDRESS_NOT_FOUND') {
        setError('Adresse introuvable. Vérifie et réessaie.')
      } else {
        setError(firebaseErrorMessage(err.code))
      }
    } finally {
      setLoading(false)
    }
  }

  const isRegister = mode === 'register'

  return (
    <div className="min-h-screen bg-caca-bg flex flex-col items-center justify-center px-6 font-nunito">
      <div className="mb-10 text-center">
        <div className="text-7xl mb-3">💩</div>
        <h1 className="text-4xl font-black text-caca-primary tracking-tight">BeCaca</h1>
        <p className="text-caca-muted text-sm mt-1">L'appli qui ne se prend pas au sérieux</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6">
        {/* Tabs */}
        <div className="flex mb-5 bg-caca-surface rounded-xl p-1">
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${isRegister ? 'bg-white text-caca-primary shadow-sm' : 'text-caca-muted'}`}
          >
            Créer un compte
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${!isRegister ? 'bg-white text-caca-primary shadow-sm' : 'text-caca-muted'}`}
          >
            Se connecter
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Ton pseudo (ex: BeCacaKing)"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              maxLength={20}
              required
              className="w-full border border-caca-surface rounded-xl px-4 py-3 text-caca-text font-nunito focus:outline-none focus:ring-2 focus:ring-caca-primary"
            />
          )}

          <input
            type="email"
            placeholder="Ton email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-caca-surface rounded-xl px-4 py-3 text-caca-text font-nunito focus:outline-none focus:ring-2 focus:ring-caca-primary"
          />

          <input
            type="password"
            placeholder="Mot de passe (6 caractères min)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-caca-surface rounded-xl px-4 py-3 text-caca-text font-nunito focus:outline-none focus:ring-2 focus:ring-caca-primary"
          />

          {isRegister && (
            <div>
              <input
                type="text"
                placeholder="Adresse de ton domicile (ex: 12 rue de Rivoli, Paris)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full border border-caca-surface rounded-xl px-4 py-3 text-caca-text font-nunito focus:outline-none focus:ring-2 focus:ring-caca-primary"
              />
              <p className="text-xs text-caca-muted mt-1 ml-1">
                🏠 Sert à détecter si tu cacas chez toi ou dehors
              </p>
            </div>
          )}

          {isRegister && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 accent-caca-primary"
              />
              <span className="text-sm text-caca-muted leading-snug">
                J'autorise BeCaca à accéder à ma <strong>localisation GPS</strong> pour chaque caca 🌍
              </span>
            </label>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-caca-primary text-white font-bold py-3 rounded-full hover:bg-caca-dark transition disabled:opacity-50"
          >
            {loading
              ? (isRegister ? 'Création...' : 'Connexion...')
              : (isRegister ? "C'est parti ! 💩" : 'Se connecter 💩')}
          </button>
        </form>
      </div>
    </div>
  )
}
