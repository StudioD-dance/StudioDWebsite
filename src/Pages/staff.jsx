// src/Pages/Staff.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Staff() {
  const navigate = useNavigate();
  
  // Auth state
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState('sign_in'); // 'sign_in' | 'sign_up'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Editor state
  const [pages, setPages] = useState([]);
  const [current, setCurrent] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [uploads, setUploads] = useState([]);

  // Auth: session and listener
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        setSession(session);
        if (session) navigate('/staffHome');
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        navigate('/staffHome');
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Fetch pages once authenticated
  useEffect(() => {
    if (session) fetchPages();
  }, [session]);

  async function fetchPages() {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('order', { ascending: true });
    if (!error && data) setPages(data);
  }

  async function refreshUploads(pageId) {
    const { data, error } = await supabase
      .storage
      .from('site-images')
      .list(`pages/${pageId}/`);
    if (!error) setUploads(data || []);
  }

  async function loadPage(page) {
    setCurrent(page);
    setTitle(page.title);
    setContent(page.content);
    setMenuItems(page.menu_items || []);
    await refreshUploads(page.id);
  }

  async function savePage() {
    if (!current) return;
    const updates = { title, content, menu_items: menuItems };
    await supabase.from('pages').update(updates).eq('id', current.id);
    await fetchPages();
    alert('Page saved.');
  }

  function addMenuItem() {
    if (!newMenuLabel) return;
    setMenuItems([...menuItems, { label: newMenuLabel, link: '' }]);
    setNewMenuLabel('');
  }

  async function uploadImage(e) {
    const file = e.target.files?.[0];
    if (!file || !current) return;
    const path = `pages/${current.id}/${file.name}`;
    const { error } = await supabase.storage
      .from('site-images')
      .upload(path, file, { upsert: true });
    if (!error) await refreshUploads(current.id);
  }

  async function removeImage(name) {
    if (!current) return;
    await supabase.storage
      .from('site-images')
      .remove([`pages/${current.id}/${name}`]);
    await refreshUploads(current.id);
  }

  async function createPage() {
    const { data } = await supabase
      .from('pages')
      .insert([{ title: 'New Page', content: '', order: pages.length + 1 }])
      .select()
      .single();
    await fetchPages();
    if (data) await loadPage(data);
  }

  function publicImageUrl(pageId, name) {
    const { data } = supabase
      .storage
      .from('site-images')
      .getPublicUrl(`pages/${pageId}/${name}`);
    return data.publicUrl;
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (mode === 'sign_in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setAuthError(error.message);
        else navigate('/staffHome');
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) setAuthError(error.message);
        else if (data?.user && !data?.session) {
          // Email confirmation required
          setAuthError('Check your email to confirm your account before signing in.');
        } else {
          navigate('/staffHome');
        }
      }
    } finally {
      setAuthLoading(false);
    }
  }

  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f0f0f0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <div style={{
          width: 420,
          maxWidth: '100%',
          background: '#ffffff',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          padding: 24
        }}>
          <h1 style={{ margin: 0, marginBottom: 8, fontSize: 24, textAlign: 'center' }}>Staff Access</h1>
          <p style={{ marginTop: 0, marginBottom: 16, color: '#555', textAlign: 'center' }}>
            Log in or sign up to manage site pages.
          </p>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            <button
              onClick={() => setMode('sign_in')}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: mode === 'sign_in' ? '2px solid #333' : '1px solid #ccc',
                background: mode === 'sign_in' ? '#f7f7f7' : '#fff',
                cursor: 'pointer'
              }}
            >
              Log in
            </button>
            <button
              onClick={() => setMode('sign_up')}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: mode === 'sign_up' ? '2px solid #333' : '1px solid #ccc',
                background: mode === 'sign_up' ? '#f7f7f7' : '#fff',
                cursor: 'pointer'
              }}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleAuthSubmit}>
            <label style={{ display: 'block', marginBottom: 8 }}>
              <span style={{ display: 'block', marginBottom: 4, color: '#333' }}>Email</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '95%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #ddd'
                }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', marginBottom: 4, color: '#333' }}>Password</span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '95%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #ddd'
                }}
              />
            </label>

            {authError && (
              <div style={{ color: '#b00020', marginBottom: 12 }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: 'none',
                background: '#333',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {authLoading ? (mode === 'sign_in' ? 'Logging in…' : 'Signing up…') : (mode === 'sign_in' ? 'Log in' : 'Sign up')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: 20, background: '#f0f0f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Staff Site Editor</h1>
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>

      <button onClick={createPage}>+ New Page</button>

      <div style={{ display: 'flex', marginTop: 20 }}>
        <nav style={{ width: 200, borderRight: '1px solid #ccc', background: '#fff', padding: 10, borderRadius: 6 }}>
          {pages.map(p => (
            <div key={p.id} style={{ marginBottom: 8 }}>
              <Link to="#" onClick={() => loadPage(p)}>{p.title}</Link>
            </div>
          ))}
        </nav>

        {current && (
          <section style={{ flex: 1, padding: 20, marginLeft: 20, background: '#fff', borderRadius: 6, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <input
              style={{ fontSize: 24, width: '100%' }}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <textarea
              style={{ width: '100%', height: 200, marginTop: 10 }}
              value={content}
              onChange={e => setContent(e.target.value)}
            />

            <div style={{ marginTop: 10 }}>
              <h3>Menu Items</h3>
              {menuItems.map((m, i) => (
                <input
                  key={i}
                  placeholder="Label"
                  value={m.label}
                  onChange={e => {
                    const ms = [...menuItems];
                    ms[i].label = e.target.value;
                    setMenuItems(ms);
                  }}
                />
              ))}
              <input
                placeholder="New tab label"
                value={newMenuLabel}
                onChange={e => setNewMenuLabel(e.target.value)}
              />
              <button onClick={addMenuItem}>Add Tab</button>
            </div>

            <div style={{ marginTop: 10 }}>
              <h3>Images</h3>
              <input type="file" onChange={uploadImage} />
              <div>
                {uploads.map(img => (
                  <div key={img.name} style={{ marginTop: 5 }}>
                    <img
                      src={publicImageUrl(current.id, img.name)}
                      alt={img.name}
                      width={100}
                    />
                    <button onClick={() => removeImage(img.name)}>Remove</button>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={savePage} style={{ marginTop: 20 }}>
              Save Page
            </button>
          </section>
        )}
      </div>
    </div>
  );
}