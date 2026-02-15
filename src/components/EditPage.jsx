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
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) {
      fetchPage()
    }
  }, [id])

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
      if (id) {
        const { error } = await supabase
          .from('wiki_pages')
          .update({ title, content, updated_at: new Date() })
          .eq('id', id)

        if (error) throw error
        navigate('/page/' + id)
      } else {
        const { data, error } = await supabase
          .from('wiki_pages')
          .insert([{ title, content, user_id: user.id }])
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
      ['link', 'image'],
      ['clean']
    ],
  }

  return (
    <div>
      <div className="app-header">
        <div className="app-header-content">
          <h1>🏭 Firmenwiki BLP</h1>
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
            <div className="form-group">
              <label>Titel *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Onboarding-Prozess"
                required
                className="title-input"
              />
            </div>

            <div className="form-group">
              <label>Inhalt</label>
              <ReactQuill 
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="Schreibe hier den Wiki-Inhalt..."
              />
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
