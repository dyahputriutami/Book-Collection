'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIG SUPABASE ---
const supabaseUrl = 'https://oabrworkjhiwyqjbjnrj.supabase.co';
const supabaseKey = 'sb_publishable_njmgfGUnskvboIHDOLOgdw_n25SOZAx';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PerpustakaanPutriApp() {
  // --- 1. STATE MANAGEMENT ---
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showGreeting, setShowGreeting] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [books, setBooks] = useState([]);
  const [searchingAPI, setSearchingAPI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [status, setStatus] = useState('Belum Dibaca'); // State status baru untuk form input

  // --- 2. DATA QUOTES ---
  const quotes = [
    { text: "“Buku adalah sihir portabel yang unik.”", author: "Stephen King" },
    { text: "“Satu anak, satu guru, satu buku dan satu pena dapat mengubah dunia.”", author: "Malala Yousafzai" },
    { text: "“Aku rela dipenjara asalkan bersama buku, karena dengan buku aku bebas.”", author: "Mohammad Hatta" }
  ];

  // --- 3. EFFECTS & RESPONSIVENESS ---
  useEffect(() => {
    fetchBooks();
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

  // --- 4. CORE FUNCTIONS ---
  async function fetchBooks() {
    const { data } = await supabase.from('Perpustakaan Putri').select('*').order('id', { ascending: false });
    setBooks(data || []);
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

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
    } finally { setSearchingAPI(false); }
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return alert("Isi judul dan penulis");
    const { error } = await supabase.from('Perpustakaan Putri').insert([{ 
      title, author, cover: coverUrl || 'https://via.placeholder.com/200x300', 
      status: status, rating: 0, notes: ''
    }]);
    if (!error) { 
      setTitle(''); setAuthor(''); setCoverUrl(''); setStatus('Belum Dibaca');
      fetchBooks(); 
    }
  };

  const updateBook = async (id, updates) => {
    const { error } = await supabase.from('Perpustakaan Putri').update(updates).eq('id', id);
    if (!error) {
      setBooks(books.map(b => b.id === id ? { ...b, ...updates } : b));
      if (selectedBook?.id === id) setSelectedBook({ ...selectedBook, ...updates });
    }
  };

  const deleteBook = async (id) => {
    if (confirm('Hapus buku dari koleksi?')) {
      await supabase.from('Perpustakaan Putri').delete().eq('id', id);
      setSelectedBook(null); fetchBooks();
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Selesai Dibaca': return { color: '#2f9e44', bg: '#ebfbee', label: '✅ Selesai' };
      case 'Sedang Dibaca': return { color: '#1971c2', bg: '#e7f5ff', label: '📖 Sedang Baca' };
      case 'Wishlist': return { color: '#7048e8', bg: '#f3f0ff', label: '✨ Wishlist' };
      default: return { color: '#868e96', bg: '#f8f9fa', label: '⚪ Belum Baca' };
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- 5. RENDER ---
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffafa', fontFamily: 'sans-serif' }}>
      
      {/* SPLASH SCREEN */}
      {showGreeting && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(74, 0, 0, 0.5)', backdropFilter: 'blur(10px)', color: 'white', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px', opacity: fadeOut ? 0 : 1, transition: 'opacity 1s ease-in-out' }}>
          <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem' }}>Selamat Datang di Perpustakaan Putri</h1>
          <p style={{ fontStyle: 'italic', marginTop: '20px', fontSize: isMobile ? '1rem' : '1.2rem' }}>{quotes[quoteIndex].text}</p>
          <p style={{ fontWeight: 'bold', marginTop: '10px' }}>— {quotes[quoteIndex].author}</p>
        </div>
      )}

      <div style={{ paddingBottom: '80px' }}>
        {/* HEADER */}
        <div style={{ padding: isMobile ? '40px 15px' : '60px 20px 30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: isMobile ? '32px' : '45px', fontWeight: '800', color: '#4a0000', margin: 0 }}>Perpustakaan Putri</h1>
          <div style={{ minHeight: '60px', marginTop: '15px' }}>
            <p style={{ color: '#804040', fontStyle: 'italic', fontSize: isMobile ? '14px' : '16px', margin: 0 }}>{quotes[quoteIndex].text}</p>
            <p style={{ color: '#a06060', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '5px' }}>— {quotes[quoteIndex].author}</p>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '0 15px' : '0 20px' }}>
          
          {/* INPUT FORM SECTION */}
          <div style={{ backgroundColor: 'white', padding: isMobile ? '20px' : '30px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', marginBottom: '35px', border: '1px solid #f0e0e0' }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', marginBottom: '12px' }}>
              <input placeholder="Judul Buku..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: '2', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
              <button onClick={fetchFromGoogleBooks} style={{ flex: '1', backgroundColor: '#4a90e2', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold' }}>{searchingAPI ? 'Mencari...' : '🔍 Cari Data'}</button>
            </div>
            
            <input placeholder="Nama Penulis" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '12px', boxSizing: 'border-box' }} />
            
            {/* INPUT STATUS BUKU SAAT MENAMBAH */}
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#fff' }}>
              <option value="Belum Dibaca">⚪ Belum Dibaca</option>
              <option value="Sedang Dibaca">📖 Sedang Dibaca</option>
              <option value="Selesai Dibaca">✅ Selesai Dibaca</option>
              <option value="Wishlist">✨ Wishlist</option>
            </select>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
              <input placeholder="URL Foto Cover..." value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ flex: '1', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' }} />
              <span style={{ fontSize: '12px', color: '#999', fontWeight: 'bold' }}>ATAU</span>
              <label style={{ flex: '0.8', backgroundColor: '#f0f0f0', padding: '14px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', border: '1px dashed #bbb', width: '100%', boxSizing: 'border-box' }}>
                📸 Upload File
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <button onClick={addBook} style={{ width: '100%', backgroundColor: '#800000', color: 'white', border: 'none', padding: '18px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px' }}>Simpan ke Koleksi Digital</button>
          </div>

          {/* SEARCH BAR */}
          <input type="text" placeholder="🔍 Cari koleksi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '16px 20px', borderRadius: '14px', border: '1px solid #f0e0e0', marginBottom: '40px', boxSizing: 'border-box' }} />

          {/* GRID BUKU */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: isMobile ? '20px' : '35px' }}>
            {filteredBooks.map(book => {
              const s = getStatusStyle(book.status);
              return (
                <div key={book.id} onClick={() => setSelectedBook(book)} style={{ cursor: 'pointer', padding: '14px', borderRadius: '24px', backgroundColor: 'white', border: '1px solid #f0e0e0', display: 'flex', flexDirection: 'column', height: '100%', marginBottom: '10px' }}>
                  <div style={{ overflow: 'hidden', borderRadius: '16px', height: isMobile ? '200px' : '280px', marginBottom: '12px', backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', boxSizing: 'border-box' }}>
                    <img src={book.cover} onError={(e) => e.target.src = 'https://via.placeholder.com/200x300'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ minHeight: '42px' }}>
                    <h3 style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '700', color: '#4a0000', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>{book.title}</h3>
                  </div>
                  <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 8px' }}>{book.author}</p>
                  
                  <div style={{ color: '#ffd700', fontSize: '13px', marginBottom: '6px' }}>
                    {'★'.repeat(book.rating || 0)}{'☆'.repeat(5 - (book.rating || 0))}
                  </div>

                  {/* LABEL STATUS DI HALAMAN DEPAN */}
                  <div style={{ 
                    fontSize: '11px', fontWeight: '600', color: s.color, backgroundColor: s.bg,
                    padding: '4px 8px', borderRadius: '6px', display: 'inline-block', marginTop: 'auto', width: 'fit-content'
                  }}>
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedBook && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(74, 0, 0, 0.3)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'white', padding: isMobile ? '25px' : '40px', borderRadius: '35px', maxWidth: '800px', width: '100%', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '20px' : '40px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setSelectedBook(null)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: '#f5f5f5', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            <div style={{ width: isMobile ? '100%' : '240px', textAlign: 'center' }}>
              <img src={selectedBook.cover} style={{ width: isMobile ? '160px' : '100%', borderRadius: '20px', marginBottom: '20px', objectFit: 'contain', maxHeight: '300px' }} />
              <button onClick={() => deleteBook(selectedBook.id)} style={{ width: '100%', padding: '12px', backgroundColor: '#fff0f0', color: '#e03131', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>🗑 Hapus Buku</button>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#4a0000', margin: 0 }}>{selectedBook.title}</h2>
              <p style={{ color: '#888', marginBottom: '20px' }}>{selectedBook.author}</p>
              
              <select value={selectedBook.status} onChange={(e) => updateBook(selectedBook.id, { status: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }}>
                <option value="Belum Dibaca">⚪ Belum Dibaca</option>
                <option value="Sedang Dibaca">📖 Sedang Dibaca</option>
                <option value="Selesai Dibaca">✅ Selesai Dibaca</option>
                <option value="Wishlist">✨ Wishlist</option>
              </select>

              <div style={{ marginTop: '20px' }}>
                {[1,2,3,4,5].map(s => <span key={s} onClick={() => updateBook(selectedBook.id, { rating: s })} style={{ fontSize: '35px', cursor: 'pointer', color: s <= (selectedBook.rating || 0) ? '#ffd700' : '#eee' }}>★</span>)}
              </div>
              <textarea value={selectedBook.notes || ''} onChange={(e) => setSelectedBook({...selectedBook, notes: e.target.value})} onBlur={() => updateBook(selectedBook.id, { notes: selectedBook.notes })} style={{ width: '100%', height: '120px', marginTop: '20px', padding: '15px', borderRadius: '15px', border: '1px solid #eee', resize: 'none' }} placeholder="Review singkat Anda..." />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
