// src/Pages/StaffHome.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PAGES_LIST = [
  { id: 'home', name: 'Home', file: 'Home.jsx' },
  { id: 'about', name: 'About Us', file: 'About.jsx' },
  { id: 'apparel', name: 'Apparel', file: 'apparel.jsx' },
  { id: 'cycle', name: 'Cycle', file: 'cycle.jsx' },
  { id: 'events', name: 'Events', file: 'events.jsx' },
  { id: 'login', name: 'Login', file: 'login.jsx' },
  { id: 'schedule', name: 'Schedule', file: 'schedule.jsx' },
  { id: 'teams', name: 'Teams', file: 'teams.jsx' }
];

export default function StaffHome() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [selectedPageId, setSelectedPageId] = useState(PAGES_LIST[0].id);
  const [pageContent, setPageContent] = useState({});
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedPage = PAGES_LIST.find(p => p.id === selectedPageId);

  // Auth check
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        setSession(session);
        if (!session) navigate('/staff');
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/staff');
      }
      setSession(session);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Fetch all page content
  useEffect(() => {
    if (session) fetchAllPages();
  }, [session]);

  async function fetchAllPages() {
    setLoading(true);
    const { data, error } = await supabase
      .from('pages')
      .select('*');
    
    if (!error && data) {
      const contentMap = {};
      data.forEach(page => {
        // Use page_type if available, otherwise use id
        const pageKey = page.page_type || page.id;
        contentMap[pageKey] = page;
      });
      setPageContent(contentMap);
      
      // Load first page
      const selectedPageData = contentMap[selectedPageId];
      if (selectedPageData) {
        loadPageData(selectedPageData);
      } else {
        // Initialize empty if no data exists
        setTitle('');
        setContent('');
        setImages([]);
        setUploads([]);
      }
    }
    setLoading(false);
  }

  async function loadPageData(page) {
    setTitle(page.title || '');
    setContent(page.content || '');
    const imageArray = page.images || [];
    setImages(imageArray);
    await refreshUploads(page.id);
  }

  async function refreshUploads(pageId) {
    const { data, error } = await supabase
      .storage
      .from('site-images')
      .list(`pages/${pageId}/`);
    if (!error) setUploads(data || []);
  }

  async function uploadImage(e) {
    const file = e.target.files?.[0];
    if (!file || !selectedPageId) return;
    
    setLoading(true);
    const path = `pages/${selectedPageId}/${file.name}`;
    const { error } = await supabase.storage
      .from('site-images')
      .upload(path, file, { upsert: true });
    
    if (!error) {
      await refreshUploads(selectedPageId);
      const pageData = pageContent[selectedPageId];
      if (pageData) {
        const newImages = [...images, { 
          name: file.name, 
          width: 300, 
          position: 'center' 
        }];
        setImages(newImages);
        alert('Image uploaded! Position it in the preview and save.');
      }
    }
    setLoading(false);
  }

  async function removeImage(fileName) {
    await supabase.storage
      .from('site-images')
      .remove([`pages/${selectedPageId}/${fileName}`]);
    const newImages = images.filter(img => img.name !== fileName);
    setImages(newImages);
    await refreshUploads(selectedPageId);
  }

  function updateImagePos(fileName, key, value) {
    const newImages = images.map(img => 
      img.name === fileName ? { ...img, [key]: value } : img
    );
    setImages(newImages);
  }

  async function savePage() {
    if (!selectedPageId) return;
    
    setLoading(true);
    const pageData = pageContent[selectedPageId];
    const pageRecord = {
      page_type: selectedPageId,
      title,
      content,
      images,
      updated_at: new Date().toISOString()
    };
    
    if (pageData?.id) {
      // Update existing page
      const { error } = await supabase
        .from('pages')
        .update(pageRecord)
        .eq('id', pageData.id);
      
      if (error) {
        alert('Error saving page: ' + error.message);
      } else {
        alert('Page saved successfully!');
      }
    } else {
      // Create new page
      const { data, error } = await supabase
        .from('pages')
        .insert([pageRecord])
        .select();
      
      if (error) {
        alert('Error creating page: ' + error.message);
      } else {
      // Page doesn't exist in database yet, start with empty form
        alert('Page created successfully!');
      }
    }
    
    await fetchAllPages();
    setLoading(false);
  }

  function handleSelectPage(pageId) {
    setSelectedPageId(pageId);
    const page = pageContent[pageId];
    if (page) {
      loadPageData(page);
    } else {
      setTitle('');
      setContent('');
      setImages([]);
      setUploads([]);
    }
  }

  function publicImageUrl(fileName) {
    const { data } = supabase
      .storage
      .from('site-images')
      .getPublicUrl(`pages/${selectedPageId}/${fileName}`);
    return data.publicUrl;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e0e0e0',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Site Editor</h1>
        <button
          onClick={() => supabase.auth.signOut().then(() => navigate('/'))}
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            border: '1px solid #dadce0',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500
          }}
        >
          Log out
        </button>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 65px)' }}>
        {/* Sidebar - Pages List */}
        <nav style={{
          width: 250,
          background: '#fff',
          borderRight: '1px solid #e0e0e0',
          overflowY: 'auto',
          padding: 0
        }}>
          <div style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 12, color: '#5f6368', fontWeight: 600 }}>
              PAGES
            </h3>
          </div>
          {PAGES_LIST.map(page => (
            <div
              key={page.id}
              onClick={() => handleSelectPage(page.id)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: selectedPageId === page.id ? '#f1f3f4' : 'transparent',
                borderLeft: selectedPageId === page.id ? '4px solid #1a73e8' : '4px solid transparent',
                color: selectedPageId === page.id ? '#1a73e8' : '#202124',
                fontWeight: selectedPageId === page.id ? 600 : 400,
                fontSize: 14,
                transition: 'background 0.2s'
              }}
            >
              {page.name}
            </div>
          ))}
        </nav>

        {/* Main Editor Area */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', gap: 24 }}>
          {/* Editor Panel */}
          <div style={{ flex: 1, maxWidth: 500 }}>
            <div style={{
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
              padding: 24
            }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: 28 }}>
                {selectedPage?.name}
              </h2>
              <p style={{ margin: '0 0 24px 0', color: '#5f6368', fontSize: 14 }}>
                File: {selectedPage?.file}
              </p>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#202124', display: 'block', marginBottom: 8 }}>
                    Page Title
                  </span>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 8px',
                      fontSize: 16,
                      border: '1px solid #dadce0',
                      borderRadius: 4,
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Enter page title"
                  />
                </label>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#202124', display: 'block', marginBottom: 8 }}>
                    Page Content
                  </span>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 8px',
                      fontSize: 14,
                      border: '1px solid #dadce0',
                      borderRadius: 4,
                      boxSizing: 'border-box',
                      minHeight: 150,
                      fontFamily: 'inherit'
                    }}
                    placeholder="Enter page content (HTML or text)"
                  />
                </label>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, margin: '0 0 12px 0' }}>Images</h3>
                <div style={{ marginBottom: 12 }}>
                  <input 
                    type="file" 
                    onChange={uploadImage}
                    accept="image/*"
                    style={{ fontSize: 12 }}
                  />
                </div>

                {images.length > 0 && (
                  <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 4, padding: 12 }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 600 }}>Images on Page:</h4>
                    {images.map(img => (
                      <div key={img.name} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e0e0e0' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: 12, fontWeight: 600 }}>{img.name}</p>
                        
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                          Width (px):
                          <input
                            type="number"
                            value={img.width}
                            onChange={e => updateImagePos(img.name, 'width', parseInt(e.target.value))}
                            style={{
                              width: '100%',
                              padding: '6px 4px',
                              marginTop: 4,
                              fontSize: 12,
                              border: '1px solid #dadce0',
                              borderRadius: 4
                            }}
                          />
                        </label>

                        <label style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                          Position:
                          <select
                            value={img.position}
                            onChange={e => updateImagePos(img.name, 'position', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 4px',
                              marginTop: 4,
                              fontSize: 12,
                              border: '1px solid #dadce0',
                              borderRadius: 4
                            }}
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </label>

                        <button
                          onClick={() => removeImage(img.name)}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            fontSize: 12,
                            background: '#ff4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={savePage}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: 4,
                    border: 'none',
                    background: '#1a73e8',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div style={{ flex: 1, maxWidth: 500 }}>
            <div style={{
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: '#e91e63',
                padding: '16px 24px',
                color: '#fff'
              }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Preview (Menu Bar)</h3>
              </div>
              
              <div style={{ padding: 24, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: 24 }}>{title || 'Page Title'}</h2>
                
                <div style={{ marginBottom: 24, lineHeight: 1.6, color: '#202124', fontSize: 14 }}>
                  {content || 'Page content will appear here...'}
                </div>

                {images.map(img => {
                  const textAlign = img.position === 'center' ? 'center' : img.position === 'right' ? 'right' : 'left';
                  return (
                    <div key={img.name} style={{ textAlign, marginBottom: 16 }}>
                      <img
                        src={publicImageUrl(img.name)}
                        alt={img.name}
                        style={{
                          width: Math.min(img.width, 400),
                          maxWidth: '100%',
                          borderRadius: 4
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
