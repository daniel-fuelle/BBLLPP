import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('Registrierung erfolgreich! Bitte prüfe deine E-Mail zur Bestätigung.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🏭 Firmenwiki BLP</h1>
        <h2>{isSignUp ? 'Registrieren' : 'Anmelden'}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleAuth}>
          <div className="form-group">
            <label>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@firma.de"
            />
          </div>

          <div className="form-group">
            <label>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mindestens 6 Zeichen"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Bitte warten...' : (isSignUp ? 'Registrieren' : 'Anmelden')}
          </button>
        </form>

        <div className="toggle-auth">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="btn-link"
          >
            {isSignUp ? 'Bereits registriert? Anmelden' : 'Noch kein Konto? Registrieren'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
