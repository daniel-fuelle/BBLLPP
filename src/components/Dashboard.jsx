import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Dashboard.css'

function Dashboard({ user }) {
  const [pages, setPages] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
    fetchPages()
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchPages = async () => {
    try {
      let query = supabase
        .from('wiki_pages')
        .select('*, categories(name, icon)')
        .order('updated_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory)
      }

      const { data, error } = await query
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
    (page.content && page.content.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const pagesByCategory = categories.map(cat => ({
    ...cat,
    pages: filteredPages.filter(p => p.category_id === cat.id)
  })).filter(cat => cat.pages.length > 0)

  const uncategorized = filteredPages.filter(p => !p.category_id)

  return (
    <div>
      <div className="app-header">
        <div className="app-header-content">
          <h1>🏭 BLP Fertigungs-Wiki</h1>
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
          <h2>Wissensdatenbank</h2>
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
            placeholder="🔍 Durchsuche das Wiki..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-tabs">
          <button 
            className={'category-tab ' + (selectedCategory === 'all' ? 'active' : '')}
            onClick={() => setSelectedCategory('all')}
          >
            📚 Alle
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={'category-tab ' + (selectedCategory === cat.id ? 'active' : '')}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
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
        ) : selectedCategory === 'all' ? (
          <div>
            {pagesByCategory.map(cat => (
              <div key={cat.id} className="category-section">
                <h3 className="category-title">
                  {cat.icon} {cat.name}
                  <span className="page-count">{cat.pages.length}</span>
                </h3>
                <div className="pages-grid">
                  {cat.pages.map(page => (
                    <PageCard key={page.id} page={page} onDelete={deletePage} navigate={navigate} />
                  ))}
                </div>
              </div>
            ))}

            {uncategorized.length > 0 && (
              <div className="category-section">
                <h3 className="category-title">
                  📄 Unkategorisiert
                  <span className="page-count">{uncategorized.length}</span>
                </h3>
                <div className="pages-grid">
                  {uncategorized.map(page => (
                    <PageCard key={page.id} page={page} onDelete={deletePage} navigate={navigate} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="pages-grid">
            {filteredPages.map(page => (
              <PageCard key={page.id} page={page} onDelete={deletePage} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PageCard({ page, onDelete, navigate }) {
  const stripHtml = (html) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  return (
    <div className="page-card">
      <Link to={'/page/' + page.id} className="page-card-link">
        {page.categories && (
          <div className="page-category-badge">
            {page.categories.icon} {page.categories.name}
          </div>
        )}
        <h3>{page.title}</h3>
        <div className="page-preview">
          {stripHtml(page.content || '').substring(0, 150) + '...'}
        </div>
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
          onClick={() => onDelete(page.id)}
          className="btn btn-danger btn-sm"
        >
          Löschen
        </button>
      </div>
    </div>
  )
}

export default Dashboard
