import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { updatePseudo, updateAddress, updateProfilePhoto } from '../api/userService.js'
import { ChevronLeft } from 'lucide-react'

export default function SettingsScreen() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  // ── États des champs ─────────────────────────────────────────
  const [pseudo,  setPseudo]  = useState(user?.pseudo      ?? '')
  const [address, setAddress] = useState(user?.homeAddress ?? '')

  // ── États de chargement / feedback ───────────────────────────
  const [saving,   setSaving]   = useState(null)  // 'pseudo' | 'address' | 'photo'
  const [success,  setSuccess]  = useState(null)  // même clés
  const [error,    setError]    = useState(null)

  const photoInputRef = useRef(null)

  // ── Helpers ──────────────────────────────────────────────────
  const startSave = (key)  => { setSaving(key); setSuccess(null); setError(null) }
  const doneSave  = (key, fields) => {
    updateUser(fields)
    setSaving(null)
    setSuccess(key)
    setTimeout(() => setSuccess(null), 2500)
  }
  const failSave  = (msg)  => { setSaving(null); setError(msg) }

  // ── Handlers ─────────────────────────────────────────────────
  const handlePseudo = async () => {
    if (!pseudo.trim() || pseudo.trim() === user?.pseudo) return
    startSave('pseudo')
    try {
      const fields = await updatePseudo(user.uid, pseudo)
      doneSave('pseudo', fields)
    } catch (e) {
      failSave(e.message)
    }
  }

  const handleAddress = async () => {
    if (!address.trim() || address.trim() === user?.homeAddress) return
    startSave('address')
    try {
      const fields = await updateAddress(user.uid, address)
      doneSave('address', fields)
    } catch (e) {
      failSave(e.message === 'ADDRESS_NOT_FOUND'
        ? 'Adresse introuvable. Vérifie et réessaie.'
        : e.message)
    }
  }

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    startSave('photo')
    try {
      const fields = await updateProfilePhoto(user.uid, file)
      doneSave('photo', fields)
    } catch (e) {
      failSave('Erreur lors de l\'upload. Réessaie.')
    }
    // Reset input pour pouvoir rechoisir la même photo
    e.target.value = ''
  }

  // ── UI ───────────────────────────────────────────────────────
  const inputClass = "w-full border border-caca-surface rounded-xl px-4 py-3 text-caca-text font-nunito focus:outline-none focus:ring-2 focus:ring-caca-primary bg-white"
  const btnClass   = (key) =>
    `px-5 py-2.5 rounded-full font-bold text-sm transition ${
      saving === key
        ? 'bg-caca-surface text-caca-muted cursor-wait'
        : 'bg-caca-primary text-white hover:bg-caca-dark'
    }`

  return (
    <div className="min-h-screen bg-caca-bg font-nunito pb-20">

      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 border-b border-caca-surface bg-caca-bg sticky top-0 z-10">
        <button
          onClick={() => navigate('/profil')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-caca-surface transition"
          aria-label="Retour"
        >
          <ChevronLeft size={22} className="text-caca-primary" />
        </button>
        <h1 className="text-lg font-black text-caca-primary">Paramètres</h1>
      </header>

      <div className="px-4 pt-6 space-y-6">

        {/* ── Photo de profil ─────────────────────────────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-caca-text mb-4">Photo de profil</h2>

          <div className="flex items-center gap-4">
            {/* Avatar actuel */}
            <div className="w-20 h-20 rounded-full overflow-hidden bg-caca-surface flex items-center justify-center shrink-0 border-2 border-caca-surface">
              {user?.photoURL
                ? <img src={user.photoURL} alt="Photo de profil" className="w-full h-full object-cover" />
                : <span className="text-4xl">{user?.avatar ?? '💩'}</span>
              }
            </div>

            <div className="flex-1 space-y-2">
              {/* Input caché */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={saving === 'photo'}
                className={btnClass('photo')}
              >
                {saving === 'photo' ? 'Upload…' : 'Choisir une photo'}
              </button>
              {success === 'photo' && (
                <p className="text-sm text-caca-success font-semibold">✓ Photo mise à jour !</p>
              )}
              <p className="text-xs text-caca-muted">JPG ou PNG, max 400×400px (redimensionné auto)</p>
            </div>
          </div>
        </section>

        {/* ── Pseudo ──────────────────────────────────────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-caca-text mb-4">Nom d'utilisateur</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              maxLength={20}
              placeholder="Ton pseudo"
              className={inputClass}
            />
            <button
              onClick={handlePseudo}
              disabled={saving === 'pseudo' || !pseudo.trim() || pseudo.trim() === user?.pseudo}
              className={btnClass('pseudo')}
            >
              {saving === 'pseudo' ? '…' : 'OK'}
            </button>
          </div>
          {success === 'pseudo' && (
            <p className="text-sm text-caca-success font-semibold mt-2">✓ Pseudo mis à jour !</p>
          )}
        </section>

        {/* ── Adresse domicile ────────────────────────────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-caca-text mb-1">Adresse domicile</h2>
          <p className="text-xs text-caca-muted mb-4">
            🏠 Sert à détecter si tu cacas chez toi (&lt; 200 m = 1 pt) ou dehors (&gt; 200 m = 2 pts)
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: 12 rue de Rivoli, Paris"
              className={inputClass}
            />
            <button
              onClick={handleAddress}
              disabled={saving === 'address' || !address.trim() || address.trim() === user?.homeAddress}
              className={`${btnClass('address')} w-full`}
            >
              {saving === 'address' ? 'Géolocalisation…' : 'Mettre à jour l\'adresse'}
            </button>
          </div>
          {success === 'address' && (
            <p className="text-sm text-caca-success font-semibold mt-2">✓ Adresse mise à jour !</p>
          )}
        </section>

        {/* ── Erreur globale ───────────────────────────────── */}
        {error && (
          <p className="text-red-500 text-sm font-semibold text-center">{error}</p>
        )}

      </div>
    </div>
  )
}
