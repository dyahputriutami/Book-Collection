'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// HUBUNGKAN KE GUDANG PUSAT (SUPABASE)
const supabaseUrl = 'https://oabrworkjhiwyqjbjnrj.supabase.co';
const supabaseKey = 'sb_publishable_njmgfGUnskvboIHDOLOgdw_n25SOZAx';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BookTracker() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [uploadMode, setUploadMode] = useState('file');
  const [coverImage, setCoverImage] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // MENGAMBIL DATA DARI CLOUD SAAT WEB DIBUKA
  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    const { data } = await supabase
      .from('books')
      .select('*')
      .order('title', { ascending: true });
    
    if (data) setBooks(data);
    setLoading(false);
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return;

    const finalCover = uploadMode === 'file' 
      ? (coverImage || 'https://via.placeholder.com/150?text=No+Cover')
      : (coverUrl || `https://source.unsplash.com/featured/?book,${title}`);

    // SIMPAN KE SUPABASE (CLOUD)
    const { error } = await supabase
      .from('books')
      .insert([{ title, author, cover: finalCover }]);

    if (!error) {
      setTitle('');
      setAuthor('');
      setCoverImage(null);
      setCoverUrl('');
      fetchBooks(); // Ambil data terbaru
    }
  };

  const deleteBook = async (id) => {
    if (confirm('Hapus dari semua perangkat?')) {
      const { error } = await supabase.from('books').delete().eq('id', id);
      if (!error) fetchBooks();
    }
  };

  if (loading) return <p style={{textAlign: 'center', marginTop: '50px'}}>Menghubungkan ke database...</p>;

  return (
    <div style={{ padding: '40px 20px', fontFamily: 'sans-serif', maxWidth: '850px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>🌍 My Global Library</h1>
      
      {/* Form Input Tetap Sama Seperti Sebelumnya */}
      <form onSubmit={addBook} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <input placeholder="Judul Buku" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6' }} />
          <input placeholder="Penulis" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button type="button" onClick={() => setUploadMode('file')} style={{ flex: 1, padding: '8px', borderRadius: '5px', border: 'none', backgroundColor: uploadMode === 'file' ? '#0070f3' : '#e9ecef', color: uploadMode === 'file' ? 'white' : '#495057', cursor: 'pointer' }}>Upload File</button>
          <button type="button" onClick={() => setUploadMode('link')} style={{ flex: 1, padding: '8px', borderRadius: '5px', border: 'none', backgroundColor: uploadMode === 'link' ? '#0070f3' : '#e9ecef', color: uploadMode === 'link' ? 'white' : '#495057', cursor: 'pointer' }}>Paste Link URL</button>
        </div>
        
        {uploadMode === 'file' ? (
          <div style={{ marginBottom: '15px' }}>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
        ) : (
          <input placeholder="Masukkan URL Gambar" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '15px', boxSizing: 'border-box' }} />
        )}

        <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan ke Cloud</button>
      </form>

      {/* Grid Tampilan Buku */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '25px' }}>
        {books.map((book) => (
          <div key={book.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }}>
            <img src={book.cover} alt={book.title} style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
            <div style={{ padding: '15px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>{book.title}</h3>
              <p style={{ fontSize: '13px', color: '#7f8c8d' }}>{book.author}</p>
              <button onClick={() => deleteBook(book.id)} style={{ width: '100%', marginTop: '10px', padding: '8px', backgroundColor: '#f8d7da', color: '#721c24', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hapus Selamanya</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
