import { useNavigate } from 'react-router-dom'

export default function BeCacaButton() {
  const navigate = useNavigate()

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={() => navigate('/camera')}
        className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl transition-transform active:scale-90 bg-caca-primary hover:bg-caca-dark"
        aria-label="Prendre un BeCaca"
      >
        💩
      </button>
    </div>
  )
}
