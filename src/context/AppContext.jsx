import { createContext, useContext, useReducer } from 'react'

const AppContext = createContext(null)

const initialState = {
  posts:       [],
  leaderboard: [],
  loadingPosts: false,
  loadingLB:    false,
  error:        null,
}

function appReducer(state, action) {
  switch (action.type) {
    case 'POSTS_START':   return { ...state, loadingPosts: true,  error: null }
    case 'POSTS_OK':      return { ...state, loadingPosts: false, posts: action.payload }
    case 'POSTS_ERR':     return { ...state, loadingPosts: false, error: action.payload }
    case 'LB_START':      return { ...state, loadingLB: true,    error: null }
    case 'LB_OK':         return { ...state, loadingLB: false,   leaderboard: action.payload }
    case 'LB_ERR':        return { ...state, loadingLB: false,   error: action.payload }
    case 'ADD_POST':      return { ...state, posts: [action.payload, ...state.posts] }
    default:              return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const setPosts       = (posts) => dispatch({ type: 'POSTS_OK',  payload: posts })
  const setLoadingPost = ()      => dispatch({ type: 'POSTS_START' })
  const setPostError   = (e)     => dispatch({ type: 'POSTS_ERR', payload: e })
  const setLeaderboard = (lb)    => dispatch({ type: 'LB_OK',     payload: lb })
  const setLoadingLB   = ()      => dispatch({ type: 'LB_START' })
  const setLBError     = (e)     => dispatch({ type: 'LB_ERR',    payload: e })
  const addPost        = (post)  => dispatch({ type: 'ADD_POST',  payload: post })

  return (
    <AppContext.Provider value={{
      ...state,
      setPosts, setLoadingPost, setPostError,
      setLeaderboard, setLoadingLB, setLBError,
      addPost,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
