// src/Components/PageRenderer.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function PageRenderer({ pageType }) {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageData();
  }, [pageType]);

  async function fetchPageData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('page_type', pageType)
      .single();

    if (!error && data) {
      setPageData(data);
    } else {
      setPageData(null);
    }
    setLoading(false);
  }

  function publicImageUrl(fileName) {
    const { data } = supabase
      .storage
      .from('site-images')
      .getPublicUrl(`pages/${pageType}/${fileName}`);
    return data.publicUrl;
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  }

  if (!pageData) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Page not found</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>{pageData.title || 'Untitled Page'}</h1>
      
      <div style={{ lineHeight: 1.6, marginBottom: 30, fontSize: 16, color: '#333' }}>
        {pageData.content || 'No content available'}
      </div>

      {pageData.images && pageData.images.length > 0 && (
        <div>
          {pageData.images.map((img, index) => {
            const textAlign = img.position === 'center' ? 'center' : img.position === 'right' ? 'right' : 'left';
            return (
              <div key={index} style={{ textAlign, marginBottom: 30 }}>
                <img
                  src={publicImageUrl(img.name)}
                  alt={img.name}
                  style={{
                    width: Math.min(img.width || 300, 600),
                    maxWidth: '100%',
                    borderRadius: 4
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
