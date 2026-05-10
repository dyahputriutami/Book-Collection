'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Konfigurasi Supabase
const supabaseUrl = 'https://oabrworkjhiwyqjbjnrj.supabase.co';
const supabaseKey = 'sb_publishable_njmgfGUnskvboIHDOLOgdw_n25SOZAx';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PerpustakaanPutriApp() {
  // --- 1. STATE MANAGEMENT ---
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showGreeting, setShowGreeting] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // State baru untuk responsivitas
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchingAPI, setSearchingAPI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // --- 2. DATA QUOTES PILIHAN ---
  const quotes = [
    { text: "“Buku adalah sihir portabel yang unik.”", author: "Stephen King" },
    { text: "“Satu anak, satu guru, satu buku dan satu pena dapat mengubah dunia.”", author: "Malala Yousafzai" },
    { text: "“Aku rela dipenjara asalkan bersama buku, karena dengan buku aku bebas.”", author: "Mohammad Hatta" }
  ];

  // --- 3. EFFECTS & TIMERS ---
  useEffect(() => {
    fetchBooks();

    // Cek ukuran layar saat load & resize
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const splashTimer = setTimeout(() => {
      setFadeOut(true); 
      setTimeout(() => setShowGreeting(false), 1000);
    }, 4000);

    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 3000);

    return () => {
      clearTimeout(splashTimer);
      clearInterval(quoteTimer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // --- 4. FUNGSI DATABASE & API ---
  async function fetchBooks() {
    try {
      const { data, error } = await supabase.from('Perpustakaan Putri').select('*').order('id', { ascending: false });
      if (error) throw error;
      setBooks(data || []);
    } catch (err) { console.error(err.message); } 
    finally { setLoading(false); }
  }

  const fetchFromGoogleBooks = async () => {
    if (!title) return alert("Masukkan judul buku");
    setSearchingAPI(true);
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=1`);
      const data = await res.json();
      if (data.items?.[0]) {
        const info = data.items[0].volumeInfo;
        setAuthor(info.authors?.join(', ') || 'Penulis Tidak Diketahui');
        let img = info.imageLinks?.thumbnail || "";
        setCoverUrl(img.replace('http:', 'https:'));
      }
    } catch (err) { console.error(err); } 
    finally { setSearchingAPI(false); }
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return alert("Isi judul dan penulis");
    const { error } = await supabase.from('Perpustakaan Putri').insert([{ 
      title, author, cover: coverUrl || 'https://via.placeholder.com/200x300', 
      status: 'Belum Dibaca', rating: 0, notes: ''
    }]);
    if (!error) { setTitle(''); setAuthor(''); setCoverUrl(''); fetchBooks(); }
  };

  const updateBook = async (id, updates) => {
    const { error } = await supabase.from('Perpustakaan Putri').update(updates).eq('id', id);
    if (!error) {
      setBooks(books.map(b => b.id === id ? { ...b, ...updates } : b));
      if (selectedBook?.id === id) setSelectedBook({ ...selectedBook, ...updates });
      setIsEditing(false);
    }
  };

  const deleteBook = async (id) => {
    if (confirm('Hapus koleksi buku ini?')) {
      const { error } = await supabase.from('Perpustakaan Putri').delete().eq('id', id);
      if (!error) { setSelectedBook(null); fetchBooks(); }
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffafa', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* --- GREETING PAGE --- */}
      {showGreeting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(74, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)', 
          color: 'white', zIndex: 9999, display: 'flex', flexDirection: 'column', 
          justifyContent: 'center', alignItems: 'center', textAlign: 'center', 
          padding: '40px', opacity: fadeOut ? 0 : 1, transition: 'opacity 1s ease-in-out'
        }}>
          <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', marginBottom: '20px', fontWeight: '800' }}>Selamat Datang di Perpustakaan Putri</h1>
          <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', fontStyle: 'italic', maxWidth: '600px' }}>{quotes[quoteIndex].text}</p>
          <p style={{ fontSize: '1rem', marginTop: '10px', fontWeight: 'bold' }}>— {quotes[quoteIndex].author}</p>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div style={{ paddingBottom: '50px' }}>
        <div style={{ padding: isMobile ? '40px 20px 20px' : '60px 20px 30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: isMobile ? '30px' : '40px', fontWeight: '800', margin: '0', color: '#4a0000' }}>Perpustakaan Putri</h1>
          <div style={{ minHeight: '60px', marginTop: '15px' }}>
            <p style={{ color: '#804040', fontSize: isMobile ? '14px' : '16px', fontStyle: 'italic', transition: 'all 0.5s', margin: 0 }}>
              {quotes[quoteIndex].text}
            </p>
            <p style={{ color: '#a06060', fontSize: '11px', fontWeight: 'bold', marginTop: '5px', textTransform: 'uppercase' }}>
              — {quotes[quoteIndex].author}
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          {/* Form Input Adaptif */}
          <div style={{ backgroundColor: 'white', padding: isMobile ? '20px' : '25px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #f0e0e0' }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', marginBottom: '12px' }}>
              <input placeholder="Ketik Judul Buku..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: '2', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }} />
              <button onClick={fetchFromGoogleBooks} disabled={searchingAPI} style={{ flex: '1', backgroundColor: '#4a90e2', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                {searchingAPI ? 'Mencari...' : '🔍 Cari Data'}
              </button>
            </div>
            {!isMobile && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input placeholder="Penulis" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ flex: '1', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                <input placeholder="URL Cover" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ flex: '1.5', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
              </div>
            )}
            <button onClick={addBook} style={{ width: '100%', backgroundColor: '#800000', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              Simpan ke Koleksi Digital
            </button>
          </div>

          <input type="text" placeholder="🔍 Cari koleksi pribadi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '14px 20px', borderRadius: '14px', border: '1px solid #f0e0e0', marginBottom: '30px', boxSizing: 'border-box' }} />

          {/* GRID BUKU RESPONSIF */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: isMobile ? '15px' : '30px' 
          }}>
            {filteredBooks.map(book => (
              <div key={book.id} onClick={() => { setSelectedBook(book); setIsEditing(false); }} style={{ cursor: 'pointer', padding: '12px', borderRadius: '20px', backgroundColor: 'white', border: '1px solid #f0e0e0' }}>
                <div style={{ overflow: 'hidden', borderRadius: '12px', height: isMobile ? '180px' : '260px', marginBottom: '10px' }}>
                  <img src={book.cover} onError={(e) => e.target.src = 'https://via.placeholder.com/200x300'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: '700', color: '#4a0000', margin: '0' }}>{book.title}</h3>
                <p style={{ fontSize: '11px', color: '#888', margin: '3px 0' }}>{book.author}</p>
                <div style={{ color: '#ffd700', fontSize: '10px' }}>{'★'.repeat(book.rating || 0)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODAL DETAIL RESPONSIF --- */}
      {selectedBook && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(74, 0, 0, 0.2)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', zIndex: 10000 }}>
          <div style={{ 
            backgroundColor: 'white', padding: isMobile ? '25px' : '40px', borderRadius: '30px', 
            maxWidth: '800px', width: '100%', display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            gap: isMobile ? '20px' : '40px', position: 'relative',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button onClick={() => setSelectedBook(null)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: '#eee', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            
            <div style={{ width: isMobile ? '100%' : '220px', textAlign: 'center' }}>
              <img src={selectedBook.cover} style={{ width: isMobile ? '140px' : '100%', borderRadius: '15px', marginBottom: '15px' }} />
              <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setIsEditing(!isEditing)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #800000', fontWeight: 'bold' }}>{isEditing ? 'Batal' : '✎ Edit'}</button>
                <button onClick={() => deleteBook(selectedBook.id)} style={{ flex: 1, padding: '10px', backgroundColor: '#fff0f0', color: '#e03131', borderRadius: '10px', fontWeight: 'bold', border: 'none' }}>🗑 Hapus</button>
              </div>
            </div>

            <div style={{ flex: '1' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input value={selectedBook.title} onChange={(e) => setSelectedBook({...selectedBook, title: e.target.value})} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #eee' }} />
                  <input value={selectedBook.author} onChange={(e) => setSelectedBook({...selectedBook, author: e.target.value})} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #eee' }} />
                  <button onClick={() => updateBook(selectedBook.id, { title: selectedBook.title, author: selectedBook.author })} style={{ backgroundColor: '#4a90e2', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold' }}>Simpan</button>
                </div>
              ) : (
                <><h2 style={{ color: '#4a0000', margin: '0', fontSize: isMobile ? '20px' : '24px' }}>{selectedBook.title}</h2><p style={{ color: '#888' }}>{selectedBook.author}</p></>
              )}

              <div style={{ marginTop: '20px' }}>
                <select value={selectedBook.status} onChange={(e) => updateBook(selectedBook.id, { status: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #eee' }}>
                  <option value="Belum Dibaca">⚪ Belum Dibaca</option>
                  <option value="Sedang Dibaca">📖 Sedang Dibaca</option>
                  <option value="Selesai Dibaca">✅ Selesai Dibaca</option>
                </select>
                <div style={{ marginTop: '15px', display: 'flex', gap: '5px' }}>
                  {[1,2,3,4,5].map(s => <span key={s} onClick={() => updateBook(selectedBook.id, { rating: s })} style={{ fontSize: '28px', cursor: 'pointer', color: s <= (selectedBook.rating || 0) ? '#ffd700' : '#eee' }}>★</span>)}
                </div>
                <textarea value={selectedBook.notes || ''} onChange={(e) => setSelectedBook({...selectedBook, notes: e.target.value})} onBlur={() => updateBook(selectedBook.id, { notes: selectedBook.notes })} style={{ width: '100%', height: '80px', marginTop: '15px', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} placeholder="Tulis catatan..." />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
