import { createContext, useContext, useReducer, useEffect } from 'react'
import { subscribeToAuthChanges } from '../services/authService.js'

const AuthContext = createContext(null)

const initialState = {
  user:          null,
  isLoading:     false,
  isInitializing: true,   // true jusqu'à ce que Firebase confirme l'état de session
  error:         null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':  return { ...state, isLoading: true,  error: null }
    case 'LOGIN_OK':     return { ...state, isLoading: false, user: action.payload }
    case 'LOGIN_ERR':    return { ...state, isLoading: false, error: action.payload }
    case 'LOGOUT':       return { ...initialState, isInitializing: false }
    case 'INIT_DONE':    return { ...state, isInitializing: false, user: action.payload }
    default:             return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Restaure la session Firebase au démarrage de l'app
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      dispatch({ type: 'INIT_DONE', payload: user })
    })
    return () => unsubscribe()
  }, [])

  const login    = (user) => dispatch({ type: 'LOGIN_OK',  payload: user })
  const logout   = ()     => dispatch({ type: 'LOGOUT' })
  const setError = (e)    => dispatch({ type: 'LOGIN_ERR', payload: e })

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
