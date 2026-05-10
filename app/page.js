'use client';
import React, { useState, useEffect } from 'react';

export default function BookTracker() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. MENGAMBIL DATA: Saat halaman pertama kali dibuka
  useEffect(() => {
    const savedBooks = localStorage.getItem('Perpustakaan_Putri');
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    }
    setIsLoaded(true); // Tandai bahwa data sudah berhasil dimuat
  }, []);

  // 2. MENYIMPAN DATA: Setiap kali daftar 'books' berubah
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('Perpustakaan_Putri', JSON.stringify(books));
    }
  }, [books, isLoaded]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addBook = (e) => {
    e.preventDefault();
    if (!title || !author) return;

    const newBook = { 
      id: Date.now(), 
      title, 
      author, 
      cover: coverImage || 'https://via.placeholder.com/150?text=No+Cover' 
    };

    const updatedBooks = [...books, newBook].sort((a, b) => 
      a.title.localeCompare(b.title)
    );

    setBooks(updatedBooks);
    setTitle('');
    setAuthor('');
    setCoverImage(null);
    document.getElementById('fileInput').value = "";
  };

  const deleteBook = (id) => {
    if (confirm('Hapus buku ini dari koleksi?')) {
      setBooks(books.filter(book => book.id !== id));
    }
  };

  // Jangan tampilkan apa pun sebelum data dari localStorage dimuat agar tidak "berkedip"
  if (!isLoaded) return null;

  return (
    <div style={{ padding: '40px 20px', fontFamily: 'sans-serif', maxWidth: '850px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>📖 Perpustakaan Putri</h1>
      
      <form onSubmit={addBook} style={{ 
        backgroundColor: 'white', padding: '25px', borderRadius: '15px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '40px',
        display: 'flex', flexDirection: 'column', gap: '15px' 
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input 
            placeholder="Judul Buku" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6' }}
          />
          <input 
            placeholder="Penulis" 
            value={author} 
            onChange={(e) => setAuthor(e.target.value)} 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '14px', color: '#666' }}>Upload Cover:</label>
          <input 
            id="fileInput"
            type="file" 
            accept="image/*"
            onChange={handleImageUpload} 
            style={{ fontSize: '14px' }}
          />
        </div>

        {coverImage && (
          <img src={coverImage} alt="Preview" style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '5px', border: '2px solid #2ecc71' }} />
        )}

        <button type="submit" style={{ 
          padding: '15px', backgroundColor: '#2ecc71', color: 'white', 
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
        }}>
          Simpan Buku & Urutkan A-Z
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '25px' }}>
        {books.map((book) => (
          <div key={book.id} style={{ 
            backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
          }}>
            <img 
              src={book.cover} 
              alt={book.title} 
              style={{ width: '100%', height: '260px', objectFit: 'cover' }} 
            />
            <div style={{ padding: '15px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 5px 0', color: '#2c3e50' }}>{book.title}</h3>
              <p style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '15px' }}>{book.author}</p>
              <button 
                onClick={() => deleteBook(book.id)}
                style={{ 
                  width: '100%', padding: '8px', backgroundColor: '#f8d7da', color: '#721c24', 
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {books.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#bdc3c7' }}>
          <p>Belum ada buku di rak Anda.</p>
        </div>
      )}
    </div>
  );
}
