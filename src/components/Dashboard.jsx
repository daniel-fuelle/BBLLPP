import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Dashboard.css'

function Dashboard({ user }) {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setPages(data || [])
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const deletePage = async (id) => {
    if (!confirm('Seite wirklich löschen?')) return

    try {
      const { error } = await supabase
        .from('wiki_pages')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchPages()
    } catch (error) {
      alert('Fehler beim Löschen: ' + error.message)
    }
  }

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <div className="dashboard-header">
          <h2>Wiki-Seiten</h2>
          <button 
            onClick={() => navigate('/new')} 
            className="btn btn-success"
          >
            ➕ Neue Seite
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Seiten durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {loading ? (
          <div className="loading">Lade Seiten...</div>
        ) : filteredPages.length === 0 ? (
          <div className="empty-state">
            <p>
              {searchTerm 
                ? 'Keine Seiten gefunden.' 
                : 'Noch keine Seiten vorhanden. Erstelle deine erste Wiki-Seite!'}
            </p>
          </div>
        ) : (
          <div className="pages-grid">
            {filteredPages.map((page) => (
              <div key={page.id} className="page-card">
                <Link to={'/page/' + page.id} className="page-card-link">
                  <h3>{page.title}</h3>
                  <div 
                    className="page-preview"
                    dangerouslySetInnerHTML={{ 
                      __html: page.content.substring(0, 150) + '...' 
                    }}
                  />
                  <div className="page-meta">
                    Aktualisiert: {new Date(page.updated_at).toLocaleDateString('de-DE')}
                  </div>
                </Link>
                <div className="page-actions">
                  <button 
                    onClick={() => navigate('/edit/' + page.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    Bearbeiten
                  </button>
                  <button 
                    onClick={() => deletePage(page.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
