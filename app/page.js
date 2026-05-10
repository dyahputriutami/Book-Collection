'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const { data, error } = await supabase
        .from('Perpustakaan Putri')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      if (data) setBooks(data);
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // FUNGSI BARU: Update Rating atau Status langsung ke Supabase
  const updateBookStatus = async (id, updates) => {
    const { error } = await supabase
      .from('Perpustakaan Putri')
      .update(updates)
      .eq('id', id);
    
    if (!error) {
      // Update data di tampilan lokal tanpa reload seluruh halaman
      setBooks(books.map(b => b.id === id ? { ...b, ...updates } : b));
    } else {
      alert("Gagal memperbarui: " + error.message);
    }
  };

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
      : (coverUrl || `https://via.placeholder.com/150?text=${title}`);

    // Default saat tambah: Rating 0 dan Belum Dibaca
    const { error } = await supabase
      .from('Perpustakaan Putri')
      .insert([{ title, author, cover: finalCover, rating: 0, is_read: false }]);

    if (!error) {
      setTitle(''); setAuthor(''); setCoverImage(null); setCoverUrl('');
      fetchBooks(); 
    }
  };

  const deleteBook = async (id) => {
    if (confirm('Hapus buku ini?')) {
      const { error } = await supabase.from('Perpustakaan Putri').delete().eq('id', id);
      if (!error) fetchBooks();
    }
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif'}}>Menghubungkan database...</div>;

  return (
    <div style={{ padding: '40px 20px', fontFamily: 'sans-serif', maxWidth: '950px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>Perpustakaan Putri</h1>
      
      {/* INPUT FORM (Hanya Judul, Penulis, Cover) */}
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
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '15px' }} />
        ) : (
          <input placeholder="URL Gambar Sampul" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '15px', boxSizing: 'border-box' }} />
        )}

        <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan ke Cloud</button>
      </form>

      <div style={{ marginBottom: '30px' }}>
        <input type="text" placeholder="🔍 Cari koleksi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #0070f3', fontSize: '16px', boxSizing: 'border-box' }} />
      </div>

      {/* GRID DAFTAR BUKU */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
        {filteredBooks.map((book) => (
          <div key={book.id} style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
            <img src={book.cover} alt={book.title} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
            
            <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 5px 0', color: '#2c3e50' }}>{book.title}</h3>
              <p style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '15px' }}>{book.author}</p>
              
              {/* STATUS BACA (Klik untuk Ubah) */}
              <button 
                onClick={() => updateBookStatus(book.id, { is_read: !book.is_read })}
                style={{ 
                  backgroundColor: book.is_read ? '#e6fcf5' : '#fff9db', 
                  color: book.is_read ? '#0ca678' : '#f08c00',
                  border: `1px solid ${book.is_read ? '#63e6be' : '#ffe066'}`,
                  padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px'
                }}
              >
                {book.is_read ? '✓ SUDAH DIBACA' : '📖 SEDANG DIBACA'}
              </button>

              {/* RATING BINTANG (Klik Bintang untuk Update) */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginBottom: '15px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    onClick={() => updateBookStatus(book.id, { rating: star })}
                    style={{ cursor: 'pointer', fontSize: '22px', color: star <= (book.rating || 0) ? '#f1c40f' : '#dee2e6' }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <button onClick={() => deleteBook(book.id)} style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', color: '#fa5252', border: '1px solid #ffc9c9', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
