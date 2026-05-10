'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// KONFIGURASI SUPABASE
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

  // AMBIL DATA DARI TABEL "Perpustakaan Putri"
  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const { data, error } = await supabase
        .from('Perpustakaan Putri') // Nama tabel disesuaikan
        .select('*')
        .order('id', { ascending: false }); // Urutkan dari yang terbaru
      
      if (error) throw error;
      if (data) setBooks(data);
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
    } finally {
      setLoading(false);
    }
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
      : (coverUrl || `https://via.placeholder.com/150?text=${title}`);

    // SIMPAN KE TABEL "Perpustakaan Putri"
    const { error } = await supabase
      .from('Perpustakaan Putri') // Nama tabel disesuaikan
      .insert([{ title, author, cover: finalCover }]);

    if (!error) {
      setTitle('');
      setAuthor('');
      setCoverImage(null);
      setCoverUrl('');
      fetchBooks(); // Refresh daftar buku
    } else {
      alert("Gagal menyimpan: " + error.message);
    }
  };

  const deleteBook = async (id) => {
    if (confirm('Hapus buku ini dari semua perangkat?')) {
      const { error } = await supabase
        .from('Perpustakaan Putri') // Nama tabel disesuaikan
        .delete()
        .eq('id', id);
      
      if (!error) fetchBooks();
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif'}}>Menghubungkan ke Perpustakaan Putri...</div>;

  return (
    <div style={{ padding: '40px 20px', fontFamily: 'sans-serif', maxWidth: '850px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>🌍 My Global Library</h1>
      
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
          <input placeholder="Masukkan URL Gambar (Contoh: https://gambar.com/buku.jpg)" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '15px', boxSizing: 'border-box' }} />
        )}

        <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan ke Cloud</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '25px' }}>
        {books.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#7f8c8d' }}>Belum ada koleksi buku. Silakan tambahkan!</p>
        ) : (
          books.map((book) => (
            <div key={book.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
              <img src={book.cover} alt={book.title} style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
              <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '16px', margin: '0 0 5px 0', color: '#2c3e50' }}>{book.title}</h3>
                  <p style={{ fontSize: '13px', color: '#7f8c8d', margin: 0 }}>{book.author}</p>
                </div>
                <button onClick={() => deleteBook(book.id)} style={{ width: '100%', marginTop: '15px', padding: '8px', backgroundColor: '#fff5f5', color: '#e03131', border: '1px solid #ffa8a8', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
