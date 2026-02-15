
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './EditPage.css'

function EditPage({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCategories()
    if (id) {
      fetchPage()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const fetchPage = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setTitle(data.title)
      setContent(data.content)
      setCategoryId(data.category_id || '')
    } catch (error) {
      alert('Fehler beim Laden: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Bitte Titel eingeben')
      return
    }

    setSaving(true)
    try {
      const pageData = {
        title,
        content,
        category_id: categoryId || null,
        updated_at: new Date()
      }

      if (id) {
        const { error } = await supabase
          .from('wiki_pages')
          .update(pageData)
          .eq('id', id)

        if (error) throw error
        navigate('/page/' + id)
      } else {
        const { data, error } = await supabase
          .from('wiki_pages')
          .insert([{ ...pageData, user_id: user.id }])
          .select()

        if (error) throw error
        navigate('/page/' + data[0].id)
      }
    } catch (error) {
      alert('Fehler beim Speichern: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  }

  return (
    <div>
      <div className="app-header">
        <div className="app-header-content">
          <h1>🏭 BLP Fertigungs-Wiki</h1>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="page-header">
          <Link to="/" className="btn btn-secondary">← Zurück</Link>
          <h2>{id ? 'Seite bearbeiten' : 'Neue Seite erstellen'}</h2>
        </div>

        {loading ? (
          <div className="loading">Laden...</div>
        ) : (
          <form onSubmit={handleSave} className="edit-form">
            <div className="form-row">
              <div className="form-group form-group-large">
                <label>Titel *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. Werkzeug W1234 - Schaftfräser D16"
                  required
                  className="title-input"
                />
              </div>

              <div className="form-group">
                <label>Kategorie</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="category-select"
                >
                  <option value="">-- Keine Kategorie --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Inhalt (mit Tabellen-Support)</label>
              <ReactQuill 
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="Schreibe hier... Nutze die Toolbar für Tabellen, Formatierung, Listen etc."
              />
            </div>

            <div className="editor-help">
              <strong>💡 Tipps:</strong>
              <ul>
                <li>Nutze Überschriften (H1-H3) für Struktur</li>
                <li>Tabellen: Ideal für Werkzeugdaten, Standzeiten, Schnittparameter</li>
                <li>Listen: Für Checklisten und Schrittanleitungen</li>
                <li>Bilder: Für Fotos von Werkzeugen, Maschinen oder Fehlern</li>
              </ul>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={saving}
              >
                {saving ? 'Speichere...' : '💾 Speichern'}
              </button>
              <button 
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary"
              >
                Abbrechen
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default EditPage
