'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Konfigurasi Supabase
const supabaseUrl = 'https://oabrworkjhiwyqjbjnrj.supabase.co';
const supabaseKey = 'sb_publishable_njmgfGUnskvboIHDOLOgdw_n25SOZAx';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PerpustakaanPutriApp() {
  // State untuk Greeting & Animasi
  const [showGreeting, setShowGreeting] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [randomQuote, setRandomQuote] = useState("");

  // State Aplikasi Utama
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

  // Daftar Quote Inspiratif
  const quotes = [
    "“Buku adalah jendela dunia di mana kita bisa melihat masa lalu dan merancang masa depan.”",
    "“Membaca satu buku berarti memberi satu nyawa tambahan bagi imajinasi kita.”",
    "“Perpustakaan adalah tempat di mana waktu berhenti, namun pengetahuan terus mengalir.”",
    "“Ada lebih banyak harta karun di dalam buku daripada di semua jarahan bajak laut di Pulau Harta.” — Walt Disney",
    "“Buku adalah teman yang paling setia dan guru yang paling sabar.”"
  ];

  useEffect(() => {
    // Pilih quote acak saat pertama kali load
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    // Ambil data dari Supabase
    fetchBooks();

    // Timer Greeting Page: Tampil 2.5 detik, lalu mulai memudar
    const timer = setTimeout(() => {
      setFadeOut(true); // Mulai animasi memudar
      setTimeout(() => setShowGreeting(false), 800); // Hapus elemen setelah benar-benar pudar
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // --- FUNGSI AUTO-FILL GOOGLE BOOKS ---
  const fetchFromGoogleBooks = async () => {
    if (!title) return alert("Masukkan judul buku terlebih dahulu");
    setSearchingAPI(true);
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=1`);
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        const info = data.items[0].volumeInfo;
        setAuthor(info.authors ? info.authors.join(', ') : 'Penulis Tidak Diketahui');
        
        let image = "";
        if (info.imageLinks) {
          image = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || "";
        }
        if (image) image = image.replace('http:', 'https:');
        setCoverUrl(image);
        
        alert("Data ditemukan! Penulis dan Foto Cover telah terisi.");
      } else {
        alert("Buku tidak ditemukan.");
      }
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setSearchingAPI(false);
    }
  };

  // --- FUNGSI SUPABASE (TABEL: Perpustakaan Putri) ---
  async function fetchBooks() {
    try {
      const { data, error } = await supabase
        .from('Perpustakaan Putri')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      setBooks(data || []);
    } catch (err) { 
      console.error("Fetch error:", err.message); 
    } finally { 
      setLoading(false); 
    }
  }

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return alert("Judul dan Penulis wajib diisi");

    const { error } = await supabase
      .from('Perpustakaan Putri')
      .insert([{ 
        title, 
        author, 
        cover: coverUrl || 'https://via.placeholder.com/200x300', 
        status: 'Belum Dibaca', 
        rating: 0,
        notes: ''
      }]);

    if (error) {
      alert("Gagal simpan: " + error.message);
    } else {
      alert("Berhasil disimpan!");
      setTitle(''); setAuthor(''); setCoverUrl('');
      fetchBooks();
    }
  };

  const updateBook = async (id, updates) => {
    const { error } = await supabase
      .from('Perpustakaan Putri')
      .update(updates)
      .eq('id', id);
    if (!error) {
      setBooks(books.map(b => b.id === id ? { ...b, ...updates } : b));
      if (selectedBook && selectedBook.id === id) setSelectedBook({ ...selectedBook, ...updates });
      setIsEditing(false);
    }
  };

  const deleteBook = async (id) => {
    if (confirm('Hapus buku ini dari Perpustakaan Putri?')) {
      const { error } = await supabase
        .from('Perpustakaan Putri')
        .delete()
        .eq('id', id);
      if (!error) { setSelectedBook(null); fetchBooks(); }
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Selesai Dibaca': return { bg: '#fff0f0', text: '#800000', border: '#ffdada' };
      case 'Sedang Dibaca': return { bg: '#fff9db', text: '#f59f00', border: '#ffe066' };
      default: return { bg: '#f8f9fa', text: '#868e96', border: '#e9ecef' };
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffafa', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* 1. GREETING PAGE OVERLAY */}
      {showGreeting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#4a0000', color: 'white', zIndex: 9999,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          textAlign: 'center', padding: '40px',
          opacity: fadeOut ? 0 : 1,
          transition: 'opacity 0.8s ease-in-out'
        }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', fontWeight: '800' }}>Selamat Datang di Perpustakaan Putri</h1>
          <p style={{ fontSize: '1.2rem', fontStyle: 'italic', maxWidth: '600px', opacity: 0.9 }}>
            {randomQuote}
          </p>
        </div>
      )}

      {/* 2. MAIN CONTENT (LANDING PAGE) */}
      <div style={{ 
        opacity: showGreeting ? 0 : 1, 
        transition: 'opacity 1s ease-in',
        visibility: showGreeting && !fadeOut ? 'hidden' : 'visible'
      }}>
        
        {/* Header */}
        <div style={{ padding: '60px 20px 30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '40px', fontWeight: '800', margin: '0', color: '#4a0000' }}>Perpustakaan Putri</h1>
          <p style={{ color: '#804040', fontSize: '16px', marginTop: '10px' }}>Arsip pengetahuan dan jejak literasi digital.</p>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Form Input */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(128,0,0,0.04)', marginBottom: '20px', border: '1px solid #f0e0e0' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <input placeholder="Ketik Judul Buku..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: '2', padding: '12px 18px', borderRadius: '12px', border: '1px solid #f0e0e0', outline: 'none' }} />
              <button onClick={fetchFromGoogleBooks} disabled={searchingAPI} style={{ flex: '1', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                {searchingAPI ? 'Mencari...' : '🔍 Cari Data'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <input placeholder="Penulis" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ flex: '1', padding: '12px 18px', borderRadius: '12px', border: '1px solid #f0e0e0', outline: 'none' }} />
              <input placeholder="URL Cover" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ flex: '1.5', padding: '12px 18px', borderRadius: '12px', border: '1px solid #f0e0e0', outline: 'none' }} />
            </div>
            <button onClick={addBook} style={{ width: '100%', backgroundColor: '#800000', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
              Simpan ke Koleksi Digital
            </button>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '50px' }}>
            <input type="text" placeholder="🔍 Cari di koleksi pribadi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '14px 20px', borderRadius: '14px', border: '1px solid #f0e0e0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Grid Buku */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px' }}>
            {filteredBooks.map(book => {
              const statusStyle = getStatusStyle(book.status);
              return (
                <div key={book.id} onClick={() => { setSelectedBook(book); setIsEditing(false); }} style={{ cursor: 'pointer', transition: 'all 0.3s ease', padding: '15px', borderRadius: '24px', backgroundColor: 'white', border: '1px solid #f0e0e0' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ overflow: 'hidden', borderRadius: '15px', height: '260px', marginBottom: '15px' }}>
                    <img src={book.cover} onError={(e) => e.target.src = 'https://via.placeholder.com/200x300'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h3 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: '700', color: '#4a0000' }}>{book.title}</h3>
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 10px 0' }}>{book.author}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ alignSelf: 'flex-start', fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', backgroundColor: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}>{book.status}</span>
                    <div style={{ fontSize: '13px', color: '#ffd700' }}>{'★'.repeat(book.rating || 0)}{'☆'.repeat(5 - (book.rating || 0))}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedBook && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(74, 0, 0, 0.1)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '30px', maxWidth: '800px', width: '100%', display: 'flex', flexWrap: 'wrap', gap: '40px', position: 'relative' }}>
            <button onClick={() => setSelectedBook(null)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            <div style={{ textAlign: 'center' }}>
              <img src={selectedBook.cover} style={{ width: '220px', borderRadius: '15px', marginBottom: '20px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => setIsEditing(!isEditing)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #800000', cursor: 'pointer' }}>{isEditing ? 'Batal' : '✎ Edit'}</button>
                <button onClick={() => deleteBook(selectedBook.id)} style={{ padding: '10px', border: 'none', backgroundColor: '#fff0f0', color: '#e03131', cursor: 'pointer', borderRadius: '10px' }}>🗑 Hapus</button>
              </div>
            </div>
            <div style={{ flex: '1' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input value={selectedBook.title} onChange={(e) => setSelectedBook({...selectedBook, title: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                  <input value={selectedBook.author} onChange={(e) => setSelectedBook({...selectedBook, author: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                  <button onClick={() => updateBook(selectedBook.id, { title: selectedBook.title, author: selectedBook.author })} style={{ backgroundColor: '#800000', color: 'white', border: 'none', padding: '10px', borderRadius: '8px' }}>Simpan</button>
                </div>
              ) : (
                <><h2 style={{ color: '#4a0000' }}>{selectedBook.title}</h2><p>{selectedBook.author}</p></>
              )}
              <div style={{ marginTop: '20px' }}>
                <select value={selectedBook.status} onChange={(e) => updateBook(selectedBook.id, { status: e.target.value })} style={{ padding: '8px', borderRadius: '10px' }}>
                  <option value="Belum Dibaca">Belum Dibaca</option>
                  <option value="Sedang Dibaca">Sedang Dibaca</option>
                  <option value="Selesai Dibaca">Selesai Dibaca</option>
                </select>
                <div style={{ marginTop: '15px', display: 'flex', gap: '5px' }}>
                  {[1,2,3,4,5].map(s => <span key={s} onClick={() => updateBook(selectedBook.id, { rating: s })} style={{ fontSize: '24px', cursor: 'pointer', color: s <= selectedBook.rating ? '#ffd700' : '#eee' }}>★</span>)}
                </div>
                <textarea value={selectedBook.notes || ''} onChange={(e) => updateBook(selectedBook.id, { notes: e.target.value })} style={{ width: '100%', height: '100px', marginTop: '15px', padding: '10px', borderRadius: '10px', border: '1px solid #eee' }} placeholder="Catatan review..." />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
