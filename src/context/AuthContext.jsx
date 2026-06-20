import { createContext, useContext, useReducer, useEffect } from 'react'
import { subscribeToAuthChanges } from '../services/authService.js'

const AuthContext = createContext(null)

const initialState = {
  user:           null,
  isLoading:      false,
  isInitializing: true,
  error:          null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':   return { ...state, isLoading: true,  error: null }
    case 'LOGIN_OK':      return { ...state, isLoading: false, user: action.payload }
    case 'LOGIN_ERR':     return { ...state, isLoading: false, error: action.payload }
    case 'LOGOUT':        return { ...initialState, isInitializing: false }
    case 'INIT_DONE':     return { ...state, isInitializing: false, user: action.payload }
    // Merge partiel des champs utilisateur (pseudo, homeAddress, photoURL…)
    case 'UPDATE_USER':   return { ...state, user: { ...state.user, ...action.payload } }
    default:              return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      dispatch({ type: 'INIT_DONE', payload: user })
    })
    return () => unsubscribe()
  }, [])

  const login      = (user)   => dispatch({ type: 'LOGIN_OK',    payload: user })
  const logout     = ()       => dispatch({ type: 'LOGOUT' })
  const setError   = (e)      => dispatch({ type: 'LOGIN_ERR',   payload: e })
  const updateUser = (fields) => dispatch({ type: 'UPDATE_USER', payload: fields })

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setError, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
