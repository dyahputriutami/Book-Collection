'use client';
import React, { useState } from 'react';

export default function BookTracker() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  const addBook = (e) => {
    e.preventDefault();
    if (!title || !author) return;

    // Jika cover kosong, gunakan gambar placeholder otomatis dari Unsplash
    const finalCover = coverUrl || `https://source.unsplash.com/featured/?book,${title}`;
    
    const newBook = { 
      id: Date.now(), 
      title, 
      author, 
      cover: finalCover 
    };

    // Menambahkan buku dan langsung mengurutkan berdasarkan Judul (A-Z)
    const updatedBooks = [...books, newBook].sort((a, b) => 
      a.title.localeCompare(b.title)
    );

    setBooks(updatedBooks);
    setTitle('');
    setAuthor('');
    setCoverUrl('');
  };

  const deleteBook = (id) => {
    setBooks(books.filter(book => book.id !== id));
  };

  return (
    <div style={{ padding: '40px 20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>📚 Koleksi Buku Dinamis</h1>
      
      <form onSubmit={addBook} style={{ 
        backgroundColor: 'white', padding: '20px', borderRadius: '10px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px',
        display: 'flex', flexDirection: 'column', gap: '12px' 
      }}>
        <input 
          placeholder="Judul Buku" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
        />
        <input 
          placeholder="Penulis" 
          value={author} 
          onChange={(e) => setAuthor(e.target.value)} 
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
        />
        <input 
          placeholder="Link Foto Cover (Opsional)" 
          value={coverUrl} 
          onChange={(e) => setCoverUrl(e.target.value)} 
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
        />
        <button type="submit" style={{ 
          padding: '12px', backgroundColor: '#0070f3', color: 'white', 
          border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' 
        }}>
          Tambah ke Koleksi & Urutkan
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
        {books.map((book) => (
          <div key={book.id} style={{ 
            backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative'
          }}>
            <img 
              src={book.cover} 
              alt={book.title} 
              style={{ width: '100%', height: '250px', objectFit: 'cover' }} 
            />
            <div style={{ padding: '10px' }}>
              <h3 style={{ fontSize: '16px', margin: '5px 0' }}>{book.title}</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>{book.author}</p>
              <button 
                onClick={() => deleteBook(book.id)}
                style={{ 
                  marginTop: '10px', width: '100%', padding: '5px', 
                  backgroundColor: '#ff4d4f', color: 'white', border: 'none', 
                  borderRadius: '4px', cursor: 'pointer', fontSize: '12px' 
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {books.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>Belum ada buku. Tambahkan satu untuk memulai!</p>}
    </div>
  );
}
