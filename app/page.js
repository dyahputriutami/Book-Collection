'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oabrworkjhiwyqjbjnrj.supabase.co';
const supabaseKey = 'sb_publishable_njmgfGUnskvboIHDOLOgdw_n25SOZAx';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PerpustakaanPutri() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchingAPI, setSearchingAPI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // State Input Form
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  useEffect(() => { fetchBooks(); }, []);

  // Fungsi Cari di Google Books
  const fetchFromGoogleBooks = async () => {
    if (!title) return alert("Masukkan judul buku terlebih dahulu");
    setSearchingAPI(true);
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=1`);
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        const info = data.items[0].volumeInfo;
        setAuthor(info.authors ? info.authors.join(', ') : 'Penulis Tidak Diketahui');
        // Mengambil gambar dengan resolusi lebih baik jika ada
        const image = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
        setCoverUrl(image.replace('http:', 'https:')); // Pastikan HTTPS agar tidak diblokir
        alert("Data ditemukan! Penulis dan Cover telah terisi otomatis.");
      } else {
        alert("Buku tidak ditemukan di database Google. Silakan isi manual.");
      }
    } catch (err) {
      console.error("Error API:", err);
    } finally {
      setSearchingAPI(false);
    }
  };

  async function fetchBooks() {
    try {
      const { data, error } = await supabase.from('Perpustakaan Putri').select('*').order('id', { ascending: false });
      if (error) throw error;
      setBooks(data || []);
    } catch (err) { console.error(err.message); } 
    finally { setLoading(false); }
  }

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return;
    const { error } = await supabase.from('Perpustakaan Putri').insert([{ 
      title, author, cover: coverUrl || 'https://via.placeholder.com/200x300', 
      rating: 0, status: 'Belum Dibaca', notes: '' 
    }]);
    if (!error) { setTitle(''); setAuthor(''); setCoverUrl(''); fetchBooks(); }
  };

  const updateBook = async (id, updates) => {
    const { error } = await supabase.from('Perpustakaan Putri').update(updates).eq('id', id);
    if (!error) {
      setBooks(books.map(b => b.id === id ? { ...b, ...updates } : b));
      if (selectedBook && selectedBook.id === id) setSelectedBook({ ...selectedBook, ...updates });
      setIsEditing(false);
    }
  };

  const deleteBook = async (id) => {
    if (confirm('Hapus koleksi ini?')) {
      const { error } = await supabase.from('Perpustakaan Putri').delete().eq('id', id);
      if (!error) { setSelectedBook(null); fetchBooks(); }
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', color: '#800000' }}>Memuat Koleksi Putri...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffafa', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#4a0000', marginBottom: '30px' }}>Perpustakaan Putri</h1>

        {/* Form Tambah Buku dengan API */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #f0e0e0' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input placeholder="Ketik Judul Buku..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: '2', padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }} />
            <button onClick={fetchFromGoogleBooks} disabled={searchingAPI} style={{ flex: '1', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>
              {searchingAPI ? 'Mencari...' : '🔍 Cari Data'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input placeholder="Penulis (Auto)" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ flex: '1', padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }} />
            <input placeholder="URL Cover (Auto)" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ flex: '1.5', padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }} />
          </div>
          <button onClick={addBook} style={{ width: '100%', padding: '12px', backgroundColor: '#800000', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            Simpan ke Koleksi Digital
          </button>
        </div>

        {/* Filter Pencarian */}
        <input placeholder="Cari di koleksi pribadi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #f0e0e0', marginBottom: '30px' }} />

        {/* Daftar Buku (Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '25px' }}>
          {filteredBooks.map(book => (
            <div 
              key={book.id} 
              onClick={() => setSelectedBook(book)}
              style={{ 
                backgroundColor: 'white', padding: '15px', borderRadius: '20px', border: '1px solid #f0e0e0', cursor: 'pointer', transition: '0.3s' 
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img src={book.cover} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '10px' }} />
              <h4 style={{ margin: '0', fontSize: '14px', color: '#4a0000' }}>{book.title}</h4>
              <p style={{ fontSize: '12px', color: '#888' }}>{book.author}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay Detail & Edit (Tampil jika selectedBook tidak null) */}
      {selectedBook && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setSelectedBook(null)} style={{ float: 'right', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            <img src={selectedBook.cover} style={{ width: '150px', borderRadius: '10px', marginBottom: '20px' }} />
            <h2 style={{ color: '#4a0000' }}>{selectedBook.title}</h2>
            <p>{selectedBook.author}</p>
            <button onClick={() => deleteBook(selectedBook.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Hapus Koleksi</button>
          </div>
        </div>
      )}
    </div>
  );
}
