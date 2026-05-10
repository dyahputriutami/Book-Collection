'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Konfigurasi Supabase
const supabaseUrl = 'https://oabrworkjhiwyqjbjnrj.supabase.co';
const supabaseKey = 'sb_publishable_njmgfGUnskvboIHDOLOgdw_n25SOZAx';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PerpustakaanPutriApp() {
  // 1. STATE UNTUK QUOTE & GREETING
  const [quoteIndex, setQuoteIndex] = useState(0); // Memperbaiki error 'quoteIndex is not defined'
  const [showGreeting, setShowGreeting] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // 2. STATE UNTUK DATA BUKU
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchingAPI, setSearchingAPI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // DAFTAR QUOTE PILIHAN ANDA
  const quotes = [
    { text: "“Buku adalah sihir portabel yang unik.”", author: "Stephen King" },
    { text: "“Satu anak, satu guru, satu buku dan satu pena dapat mengubah dunia.”", author: "Malala Yousafzai" },
    { text: "“Aku rela dipenjara asalkan bersama buku, karena dengan buku aku bebas.”", author: "Mohammad Hatta" }
  ];

  useEffect(() => {
    fetchBooks();

    // Timer untuk Splash Screen (Tampil 4 detik)
    const splashTimer = setTimeout(() => {
      setFadeOut(true); 
      setTimeout(() => setShowGreeting(false), 1000);
    }, 4000);

    // Timer untuk mengganti quote setiap 3 detik di Header
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 3000);

    return () => {
      clearTimeout(splashTimer);
      clearInterval(quoteTimer);
    };
  }, []);

  // --- FUNGSI UTAMA ---
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
    } catch (err) { console.error(err); } finally { setSearchingAPI(false); }
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return alert("Isi judul dan penulis");
    const { error } = await supabase.from('Perpustakaan Putri').insert([{ 
      title, author, cover: coverUrl || 'https://via.placeholder.com/200x300', 
      status: 'Belum Dibaca', rating: 0, notes: ''
    }]);
    if (!error) { setTitle(''); setAuthor(''); setCoverUrl(''); fetchBooks(); }
    else { alert("Error: " + error.message); }
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
    if (confirm('Hapus buku?')) {
      const { error } = await supabase.from('Perpustakaan Putri').delete().eq('id', id);
      if (!error) { setSelectedBook(null); fetchBooks(); }
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffafa', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* GREETING PAGE (EFEK ASAP) */}
      {showGreeting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(74, 0, 0, 0.5)', backdropFilter: 'blur(10px)',
          color: 'white', zIndex: 9999, display: 'flex', flexDirection: 'column', 
          justifyContent: 'center', alignItems: 'center', textAlign: 'center', 
          padding: '40px', opacity: fadeOut ? 0 : 1, transition: 'opacity 1s ease-in-out'
        }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', fontWeight: '800' }}>Selamat Datang di Perpustakaan Putri</h1>
          <p style={{ fontSize: '1.2rem', fontStyle: 'italic', maxWidth: '600px' }}>{quotes[quoteIndex].text}</p>
          <p style={{ fontSize: '1rem', marginTop: '10px', fontWeight: 'bold' }}>— {quotes[quoteIndex].author}</p>
        </div>
      )}

      {/* LANDING PAGE */}
      <div style={{ paddingBottom: '50px' }}>
        <div style={{ padding: '60px 20px 30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '40px', fontWeight: '800', margin: '0', color: '#4a0000' }}>Perpustakaan Putri</h1>
          
          {/* Quote Area yang berganti otomatis */}
          <div style={{ minHeight: '60px', marginTop: '15px' }}>
            <p style={{ color: '#804040', fontSize: '16px', fontStyle: 'italic', transition: 'all 0.5s' }}>
              {quotes[quoteIndex].text}
            </p>
            <p style={{ color: '#a06060', fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>
              — {quotes[quoteIndex].author}
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          {/* Form Input */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #f0e0e0' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <input placeholder="Ketik Judul Buku..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: '2', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
              <button onClick={fetchFromGoogleBooks} disabled={searchingAPI} style={{ flex: '1', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                {searchingAPI ? 'Mencari...' : '🔍 Cari Data'}
              </button>
            </div>
            <button onClick={addBook} style={{ width: '100%', backgroundColor: '#800000', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              Simpan ke Koleksi Digital
            </button>
          </div>

          <input type="text" placeholder="🔍 Cari koleksi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #f0e0e0', marginBottom: '30px' }} />

          {/* Grid Buku */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px' }}>
            {filteredBooks.map(book => (
              <div key={book.id} onClick={() => setSelectedBook(book)} style={{ cursor: 'pointer', padding: '15px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f0e0e0' }}>
                <img src={book.cover} style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '15px' }} />
                <h3 style={{ fontSize: '15px', color: '#4a0000', marginTop: '10px' }}>{book.title}</h3>
                <p style={{ fontSize: '12px', color: '#888' }}>{book.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Modal Detail sederhana */}
      {selectedBook && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', maxWidth: '500px', width: '90%' }}>
            <button onClick={() => setSelectedBook(null)} style={{ float: 'right' }}>✕</button>
            <h2>{selectedBook.title}</h2>
            <button onClick={() => deleteBook(selectedBook.id)} style={{ color: 'red', marginTop: '20px' }}>Hapus Buku</button>
          </div>
        </div>
      )}
    </div>
  );
}
