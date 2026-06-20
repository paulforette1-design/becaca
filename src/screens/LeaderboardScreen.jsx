import { useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchLeaderboard } from '../api/leaderboardService.js'
import LeaderboardRow from '../components/LeaderboardRow.jsx'
import SkeletonLoader from '../components/SkeletonLoader.jsx'
import EmptyState from '../components/EmptyState.jsx'

const PODIUM_COLORS = {
  1: 'bg-yellow-400 text-yellow-900',
  2: 'bg-gray-300  text-gray-700',
  3: 'bg-amber-600 text-white',
}

export default function LeaderboardScreen() {
  const { leaderboard, loadingLB, error, setLeaderboard, setLoadingLB, setLBError } = useApp()
  const { user } = useAuth()

  useEffect(() => {
    setLoadingLB()
    fetchLeaderboard()
      .then(setLeaderboard)
      .catch((e) => setLBError(e.message))
  }, [])

  const top3 = leaderboard.slice(0, 3)
  const rest  = leaderboard.slice(3)

  return (
    <div className="min-h-screen bg-caca-bg font-nunito pb-20">
      {/* Header */}
      <header className="px-4 py-4 border-b border-caca-surface bg-caca-bg">
        <h1 className="text-xl font-black text-caca-primary">Classement 🏆</h1>
        <p className="text-xs text-caca-muted">🏠 Maison = 1 pt &nbsp;|&nbsp; 🌍 Dehors = 2 pts</p>
      </header>

      {loadingLB && <SkeletonLoader count={5} />}

      {!loadingLB && error && (
        <EmptyState icon="⚠️" title="Erreur" message={error} />
      )}

      {!loadingLB && !error && leaderboard.length === 0 && (
        <EmptyState title="Aucun score encore" message="Poste ton premier BeCaca pour rejoindre le classement !" />
      )}

      {!loadingLB && !error && leaderboard.length > 0 && (
        <div className="px-4 pt-6">
          {/* Podium top 3 */}
          <div className="flex items-end justify-center gap-3 mb-8">
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, i) => {
              const realRank = i === 0 ? 2 : i === 1 ? 1 : 3
              return (
                <div key={entry.id} className="flex flex-col items-center">
                  <span className="text-3xl mb-1">{entry.avatar}</span>
                  <p className="font-bold text-caca-text text-sm truncate max-w-16 text-center">{entry.pseudo}</p>
                  <p className="text-xs text-caca-muted">{entry.score} pts</p>
                  <div className={`mt-2 w-16 flex items-center justify-center rounded-t-xl font-black text-2xl ${
                    realRank === 1 ? 'h-20' : realRank === 2 ? 'h-14' : 'h-10'
                  } ${PODIUM_COLORS[realRank]}`}>
                    {['🥇','🥈','🥉'][realRank - 1]}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Liste complète */}
          <div>
            {leaderboard.map((entry, i) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                rank={i + 1}
                isCurrentUser={entry.id === (user?.id ?? 'u1')}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
