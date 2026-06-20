import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import BottomNav from './components/BottomNav.jsx'
import OfflineBanner from './components/OfflineBanner.jsx'
import OnboardingScreen  from './screens/OnboardingScreen.jsx'
import FeedScreen        from './screens/FeedScreen.jsx'
import MapScreen         from './screens/MapScreen.jsx'
import LeaderboardScreen from './screens/LeaderboardScreen.jsx'
import ProfileScreen     from './screens/ProfileScreen.jsx'
import CameraScreen      from './screens/CameraScreen.jsx'
import SettingsScreen    from './screens/SettingsScreen.jsx'

function ProtectedRoute({ children }) {
  const { user, isInitializing } = useAuth()
  if (isInitializing) return null
  return user ? children : <Navigate to="/onboarding" replace />
}

function AppLayout({ children }) {
  return (
    <div className="max-w-md mx-auto min-h-screen relative">
      <OfflineBanner />
      {children}
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingScreen />} />

      {/* Plein écran — sans AppLayout */}
      <Route path="/camera" element={
        <ProtectedRoute><CameraScreen /></ProtectedRoute>
      } />
      <Route path="/parametres" element={
        <ProtectedRoute><SettingsScreen /></ProtectedRoute>
      } />

      <Route path="/feed" element={
        <ProtectedRoute><AppLayout><FeedScreen /></AppLayout></ProtectedRoute>
      } />
      <Route path="/map" element={
        <ProtectedRoute><AppLayout><MapScreen /></AppLayout></ProtectedRoute>
      } />
      <Route path="/classement" element={
        <ProtectedRoute><AppLayout><LeaderboardScreen /></AppLayout></ProtectedRoute>
      } />
      <Route path="/profil" element={
        <ProtectedRoute><AppLayout><ProfileScreen /></AppLayout></ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  )
}
