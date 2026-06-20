import { NavLink } from 'react-router-dom'
import { Home, Map, Trophy, User } from 'lucide-react'

const tabs = [
  { to: '/feed',       icon: Home,   label: 'Feed'       },
  { to: '/map',        icon: Map,    label: 'Carte'      },
  { to: '/classement', icon: Trophy, label: 'Classement' },
  { to: '/profil',     icon: User,   label: 'Profil'     },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-caca-surface flex items-center justify-around h-16 z-50 max-w-md mx-auto">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 flex-1 py-2 transition-colors ${
              isActive ? 'text-caca-primary' : 'text-caca-muted'
            }`
          }
        >
          <Icon size={22} />
          <span className="text-xs font-semibold font-nunito">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
