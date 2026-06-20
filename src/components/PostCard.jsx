import { getLocationLabel, getLocationBadgeClass } from '../utils/scoring.js'

const PLACEHOLDER_COLORS = [
  '#C4852A', '#7A4B2B', '#9C7A5A', '#6B8E23', '#4A2510',
]

function PhotoPlaceholder({ seed = 0, small = false }) {
  const bg = PLACEHOLDER_COLORS[seed % PLACEHOLDER_COLORS.length]
  return (
    <div
      className={`flex items-center justify-center ${small ? 'w-full h-full' : 'w-full h-full'}`}
      style={{ background: bg }}
    >
      <span className={small ? 'text-2xl' : 'text-5xl'}>💩</span>
    </div>
  )
}

function formatTime(isoStr) {
  return new Date(isoStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function PostCard({ post, index = 0 }) {
  const { pseudo, avatar, createdAt, locationType, photoBack, photoFront } = post

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm mx-4 mb-4">
      {/* Photo principale (arrière) */}
      <div className="relative h-64 bg-caca-surface">
        {photoBack
          ? <img src={photoBack} alt="env" className="w-full h-full object-cover" />
          : <PhotoPlaceholder seed={index} />
        }

        {/* Badge lieu */}
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold font-nunito ${getLocationBadgeClass(locationType)}`}>
          {getLocationLabel(locationType)}
        </span>

        {/* Photo frontale en overlay */}
        <div className="absolute bottom-3 right-3 w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md">
          {photoFront
            ? <img src={photoFront} alt="selfie" className="w-full h-full object-cover" />
            : <PhotoPlaceholder seed={index + 1} small />
          }
        </div>
      </div>

      {/* Infos */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-caca-surface flex items-center justify-center text-xl flex-shrink-0">
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-caca-text font-nunito truncate">{pseudo}</p>
          <p className="text-xs text-caca-muted font-nunito">{formatTime(createdAt)}</p>
        </div>
        <span className="text-xs font-bold text-caca-accent font-nunito">
          +{locationType === 'outdoor' ? 2 : 1} pt
        </span>
      </div>
    </article>
  )
}
