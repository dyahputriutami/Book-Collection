'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oabrworkjhiwyqjbjnrj.supabase.co';
const supabaseKey = 'sb_publishable_njmgfGUnskvboIHDOLOgdw_n25SOZAx';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PerpustakaanPutriApp() {
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
  const [isbn, setIsbn] = useState(''); 
  const [coverUrl, setCoverUrl] = useState('');
  const [status, setStatus] = useState('Belum Dibaca');

  const [isLocked, setIsLocked] = useState(true);
  const correctPasscode = "1234"; 

  // DATA KUTIPAN DENGAN PENULISNYA
  const quotes = [
    { text: "“Buku adalah sihir portabel yang unik.”", writer: "STEPHEN KING" },
    { text: "“Satu anak, satu guru, satu buku dan satu pena dapat mengubah dunia.”", writer: "MALALA YOUSAFZAI" },
    { text: "“Aku rela dipenjara asalkan bersama buku, karena dengan buku aku bebas.”", writer: "MOHAMMAD HATTA" }
  ];

  useEffect(() => {
    fetchBooks();
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Timer splash screen
    const splashTimer = setTimeout(() => { 
      setFadeOut(true); 
      setTimeout(() => setShowGreeting(false), 1000); 
    }, 4000);

    // Timer ganti kutipan
    const quoteTimer = setInterval(() => { 
      setQuoteIndex((prev) => (prev + 1) % quotes.length); 
    }, 5000);

    return () => { 
      clearTimeout(splashTimer); 
      clearInterval(quoteTimer); 
      window.removeEventListener('resize', checkMobile); 
    };
  }, []);

  async function fetchBooks() {
    const { data } = await supabase.from('Perpustakaan Putri').select('*').order('id', { ascending: false });
    setBooks(data || []);
  }

  const handleUnlock = () => {
    const pass = prompt("Masukkan Passcode untuk Mode Admin:");
    if (pass === correctPasscode) setIsLocked(false);
    else alert("Passcode Salah!");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // FUNGSI CARI COVER TER-OPTIMASI
  const fetchCoverOnly = async () => {
    if (!title || !author) {
      return alert("Judul dan Penulis wajib diisi untuk mencari cover.");
    }
    
    setSearchingAPI(true);
    const cleanIsbn = isbn.replace(/[- ]/g, "");
    
    // Gunakan parameter q yang lebih umum agar peluang ketemu lebih besar
    const searchQuery = `intitle:${title} inauthor:${author}${cleanIsbn ? ' isbn:' + cleanIsbn : ''}`;
    
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1`);
      const data = await res.json();
      
      if (data.items?.[0]?.volumeInfo?.imageLinks) {
        const info = data.items[0].volumeInfo;
        let img = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail;
        setCoverUrl(img.replace('http:', 'https:'));
      } else {
        alert("Cover spesifik tidak ditemukan. Coba masukkan judul yang lebih singkat atau gunakan upload manual.");
      }
    } catch (err) {
      alert("Gagal menghubungi server pencarian.");
    } finally {
      setSearchingAPI(false);
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return alert("Isi judul dan penulis sebelum menyimpan.");
    const { error } = await supabase.from('Perpustakaan Putri').insert([{ 
      title, author, cover: coverUrl || 'https://via.placeholder.com/200x300', 
      status: status, rating: 0, notes: ''
    }]);
    if (!error) { 
      setTitle(''); setAuthor(''); setIsbn(''); setCoverUrl(''); setStatus('Belum Dibaca');
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

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffafa', fontFamily: 'sans-serif' }}>
      
      {/* TOMBOL GEMBOK ADMIN */}
      <div onClick={isLocked ? handleUnlock : () => setIsLocked(true)} style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, cursor: 'pointer', padding: '12px', backgroundColor: isLocked ? '#fff0f0' : '#ebfbee', borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: isLocked ? '1px solid #ffc9c9' : '1px solid #b2f2bb', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isLocked ? '🔒' : '🔓'}
      </div>

      {showGreeting && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(74, 0, 0, 0.5)', backdropFilter: 'blur(10px)', color: 'white', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px', opacity: fadeOut ? 0 : 1, transition: 'opacity 1s ease-in-out' }}>
          <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem' }}>Selamat Datang di Perpustakaan Putri</h1>
          <p style={{ fontStyle: 'italic', marginTop: '20px' }}>{quotes[quoteIndex].text}</p>
          <p style={{ fontSize: '14px', marginTop: '10px', letterSpacing: '2px' }}>— {quotes[quoteIndex].writer}</p>
        </div>
      )}

      <div style={{ paddingBottom: '80px' }}>
        <div style={{ padding: isMobile ? '40px 15px' : '60px 20px 30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: isMobile ? '32px' : '45px', fontWeight: '800', color: '#4a0000', margin: 0 }}>Perpustakaan Putri</h1>
          <p style={{ color: '#804040', fontStyle: 'italic', marginTop: '15px', marginBottom: '5px' }}>{quotes[quoteIndex].text}</p>
          <p style={{ color: '#804040', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>— {quotes[quoteIndex].writer}</p>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '0 15px' : '0 20px' }}>
          <input type="text" placeholder="🔍 Cari koleksi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '16px 20px', borderRadius: '14px', border: '1px solid #f0e0e0', marginBottom: isLocked ? '40px' : '20px', boxSizing: 'border-box', fontSize: '16px', outline: 'none' }} />

          {!isLocked && (
            <div style={{ backgroundColor: 'white', padding: isMobile ? '20px' : '30px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', marginBottom: '35px', border: '1px solid #f0e0e0' }}>
              
              <input placeholder="Judul Buku (Wajib)" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', boxSizing: 'border-box', marginBottom: '12px' }} />
              
              <input placeholder="Nama Penulis (Wajib)" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '12px', boxSizing: 'border-box' }} />
              
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', marginBottom: '12px' }}>
                <input placeholder="ISBN (Opsional)" value={isbn} onChange={(e) => setIsbn(e.target.value)} style={{ flex: '2', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
                <button onClick={fetchCoverOnly} style={{ flex: '1', backgroundColor: '#800000', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {searchingAPI ? 'Mencari...' : '🔍 Cari Cover'}
                </button>
              </div>
              
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '12px', boxSizing: 'border-box' }}>
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

              <button onClick={addBook} style={{ width: '100%', backgroundColor: '#800000', color: 'white', border: 'none', padding: '18px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>Simpan ke Koleksi Digital</button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: isMobile ? '20px' : '35px' }}>
            {filteredBooks.map(book => (
                <div key={book.id} onClick={() => setSelectedBook(book)} style={{ cursor: 'pointer', padding: '14px', borderRadius: '24px', backgroundColor: 'white', border: '1px solid #f0e0e0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ overflow: 'hidden', borderRadius: '16px', height: isMobile ? '200px' : '280px', marginBottom: '12px', backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src={book.cover} onError={(e) => e.target.src = 'https://via.placeholder.com/200x300'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <h3 style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '700', color: '#4a0000', margin: '0 0 4px' }}>{book.title}</h3>
                  <p style={{ fontSize: '12px', color: '#888', margin: '0' }}>{book.author}</p>
                </div>
            ))}
          </div>
        </div>
      </div>

      {selectedBook && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(74, 0, 0, 0.3)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'white', padding: isMobile ? '25px' : '40px', borderRadius: '35px', maxWidth: '800px', width: '100%', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '20px' : '40px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setSelectedBook(null)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: '#f5f5f5', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            <div style={{ width: isMobile ? '100%' : '240px', textAlign: 'center' }}>
              <img src={selectedBook.cover} style={{ width: '100%', borderRadius: '20px', marginBottom: '20px' }} />
              {!isLocked && <button onClick={() => deleteBook(selectedBook.id)} style={{ width: '100%', padding: '12px', backgroundColor: '#fff0f0', color: '#e03131', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>🗑 Hapus Buku</button>}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#4a0000', margin: 0 }}>{selectedBook.title}</h2>
              <p style={{ color: '#888', marginBottom: '20px' }}>{selectedBook.author}</p>
              <select disabled={isLocked} value={selectedBook.status} onChange={(e) => updateBook(selectedBook.id, { status: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }}>
                <option value="Belum Dibaca">⚪ Belum Dibaca</option>
                <option value="Sedang Dibaca">📖 Sedang Dibaca</option>
                <option value="Selesai Dibaca">✅ Selesai Dibaca</option>
                <option value="Wishlist">✨ Wishlist</option>
              </select>
              <textarea disabled={isLocked} value={selectedBook.notes || ''} onChange={(e) => setSelectedBook({...selectedBook, notes: e.target.value})} onBlur={() => updateBook(selectedBook.id, { notes: selectedBook.notes })} style={{ width: '100%', height: '120px', marginTop: '20px', padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} placeholder="Review singkat Anda..." />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
