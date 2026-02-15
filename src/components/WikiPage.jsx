import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './WikiPage.css'

function WikiPage({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPage()
  }, [id])

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setPage(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Seite nicht gefunden')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div className="loading">Laden...</div>
  }

  return (
    <div>
      <div className="app-header">
        <div className="app-header-content">
          <h1>🏭 Firmenwiki BLP</h1>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <button onClick={handleSignOut} className="btn btn-secondary">
              Abmelden
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="page-header">
          <Link to="/" className="btn btn-secondary">← Zurück</Link>
          <button 
            onClick={() => navigate('/edit/' + id)}
            className="btn btn-primary"
          >
            Bearbeiten
          </button>
        </div>

        <article className="wiki-content">
          <h1>{page.title}</h1>
          <div className="page-meta-info">
            Erstellt: {new Date(page.created_at).toLocaleString('de-DE')} | 
            Aktualisiert: {new Date(page.updated_at).toLocaleString('de-DE')}
          </div>
          <div 
            className="content"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </div>
    </div>
  )
}

export default WikiPage
