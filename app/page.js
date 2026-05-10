'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oabrworkjhiwyqjbjnrj.supabase.co';
const supabaseKey = 'sb_publishable_njmgfGUnskvboIHDOLOgdw_n25SOZAx';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function MyLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null); // State untuk halaman detail
  
  // State Input Form
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [uploadMode, setUploadMode] = useState('file');
  const [coverImage, setCoverImage] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');

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
      setBooks(data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const updateBook = async (id, updates) => {
    const { error } = await supabase.from('Perpustakaan Putri').update(updates).eq('id', id);
    if (!error) {
      setBooks(books.map(b => b.id === id ? { ...b, ...updates } : b));
      if (selectedBook && selectedBook.id === id) {
        setSelectedBook({ ...selectedBook, ...updates });
      }
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return;
    const finalCover = uploadMode === 'file' ? (coverImage || 'https://via.placeholder.com/150') : (coverUrl || 'https://via.placeholder.com/150');
    const { error } = await supabase.from('Perpustakaan Putri').insert([{ title, author, cover: finalCover, rating: 0, is_read: false, notes: '' }]);
    if (!error) {
      setTitle(''); setAuthor(''); setCoverImage(null); setCoverUrl('');
      fetchBooks();
    }
  };

  const deleteBook = async (id) => {
    if (confirm('Hapus buku ini?')) {
      const { error } = await supabase.from('Perpustakaan Putri').delete().eq('id', id);
      if (!error) {
        setSelectedBook(null);
        fetchBooks();
      }
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Memuat Koleksi...</div>;

  // --- TAMPILAN HALAMAN DETAIL ---
  if (selectedBook) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <button onClick={() => setSelectedBook(null)} style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: 'white' }}>
          ← Kembali ke Koleksi
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px', backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <img src={selectedBook.cover} style={{ width: '100%', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
          
          <div>
            <h1 style={{ margin: '0 0 10px 0' }}>{selectedBook.title}</h1>
            <p style={{ color: '#666', fontSize: '18px', marginBottom: '20px' }}>Oleh: {selectedBook.author}</p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>Status:</label>
              <button 
                onClick={() => updateBook(selectedBook.id, { is_read: !selectedBook.is_read })}
                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: selectedBook.is_read ? '#2ecc71' : '#f1c40f', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {selectedBook.is_read ? '✓ Sudah Selesai' : '📖 Sedang Dibaca'}
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>Rating Anda:</label>
              {[1,2,3,4,5].map(star => (
                <span key={star} onClick={() => updateBook(selectedBook.id, { rating: star })} style={{ fontSize: '30px', cursor: 'pointer', color: star <= selectedBook.rating ? '#f1c40f' : '#ddd' }}>★</span>
              ))}
            </div>

            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>Catatan / Review:</label>
            <textarea 
              value={selectedBook.notes || ''} 
              onChange={(e) => updateBook(selectedBook.id, { notes: e.target.value })}
              placeholder="Tulis apa yang Anda pelajari dari buku ini..."
              style={{ width: '100%', height: '150px', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            
            <button onClick={() => deleteBook(selectedBook.id)} style={{ marginTop: '30px', color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Hapus dari Koleksi</button>
          </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN HALAMAN UTAMA ---
  return (
    <div style={{ padding: '40px 20px', maxWidth: '950px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>🌍 My Global Library</h1>
      
      <form onSubmit={addBook} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', marginBottom: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <input placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <input placeholder="Penulis" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
        </div>
        <input placeholder="URL Cover" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px', boxSizing: 'border-box' }} />
        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>+ Tambah Buku</button>
      </form>

      <input type="text" placeholder="🔍 Cari judul atau penulis..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #0070f3', marginBottom: '30px', boxSizing: 'border-box' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {filteredBooks.map(book => (
          <div key={book.id} onClick={() => setSelectedBook(book)} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            <img src={book.cover} style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
            <div style={{ padding: '15px' }}>
              <h3 style={{ fontSize: '14px', margin: '0 0 5px 0' }}>{book.title}</h3>
              <p style={{ fontSize: '12px', color: '#7f8c8d', margin: '0 0 10px 0' }}>{book.author}</p>
              <div style={{ color: '#f1c40f', fontSize: '14px' }}>{'★'.repeat(book.rating || 0)}{'☆'.repeat(5 - (book.rating || 0))}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
