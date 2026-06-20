const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function LeaderboardRow({ entry, rank, isCurrentUser }) {
  const { pseudo, avatar, score, count } = entry

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-2 ${
      isCurrentUser ? 'bg-caca-primary text-white' : 'bg-caca-surface'
    }`}>
      {/* Rang */}
      <span className="w-8 text-center text-lg font-bold font-nunito">
        {MEDAL[rank] ?? `#${rank}`}
      </span>

      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
        isCurrentUser ? 'bg-white/20' : 'bg-white'
      }`}>
        {avatar}
      </div>

      {/* Pseudo + stats */}
      <div className="flex-1 min-w-0">
        <p className={`font-bold font-nunito truncate ${isCurrentUser ? 'text-white' : 'text-caca-text'}`}>
          {pseudo} {isCurrentUser && <span className="text-xs font-normal opacity-80">(toi)</span>}
        </p>
        <p className={`text-xs font-nunito ${isCurrentUser ? 'text-white/70' : 'text-caca-muted'}`}>
          {count} caca{count > 1 ? 's' : ''}
        </p>
      </div>

      {/* Score */}
      <span className={`text-lg font-bold font-nunito ${isCurrentUser ? 'text-white' : 'text-caca-accent'}`}>
        {score} pt{score > 1 ? 's' : ''}
      </span>
    </div>
  )
}
