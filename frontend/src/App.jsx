import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import Charts from './components/Charts'
import RepoModal from './components/RepoModal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const AUTH_TOKEN_KEY = 'repoinsight_auth_token'

// 🔥 attach token automatically
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default function App() {
  const [authUser, setAuthUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [repos, setRepos] = useState([])
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState('')

  const location = useLocation()

  // ✅ handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token)

      // clean URL
      window.history.replaceState({}, document.title, location.pathname)

      // 🔥 important reload
      window.location.reload()
    }
  }, [location.search, location.pathname])

  // ✅ sync auth
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY)

        if (!token) {
          setAuthUser(null)
          setLoading(false)
          return
        }

        const res = await axios.get(`${API_BASE_URL}/auth/me`)

        if (res.data && res.data.user) {
          setAuthUser(res.data.user)
        } else {
          setAuthUser(null)
        }
      } catch (err) {
        console.error(err)
        setAuthUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setAuthUser(null)
    setUsername('')
    setRepos([])
    setUserData(null)
  }

  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Enter username')
      return
    }

    if (!authUser) {
      setError('Please login first')
      return
    }

    try {
      setLoading(true)
      setError('')

      const profileRes = await axios.get(`${API_BASE_URL}/api/github/${username}`)
      const repoRes = await axios.get(`${API_BASE_URL}/api/github/${username}/repos`)

      setUserData(profileRes.data)
      setRepos(repoRes.data.data || [])
    } catch {
      setError('Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <h2 style={{ textAlign: 'center' }}>Loading...</h2>
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <h2>RepoInsight</h2>

        {authUser ? (
          <div>
            <span>{authUser.login}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <a href={`${API_BASE_URL}/auth/github`}>Login</a>
        )}
      </nav>

      {!authUser ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Please login to continue</h2>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username"
          />
          <button onClick={handleSearch}>Analyze</button>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          {userData && (
            <>
              <Charts userData={userData} repos={repos} />

              {repos.map((repo) => (
                <div key={repo.id}>
                  <h3>{repo.name}</h3>
                  <p>{repo.description}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}