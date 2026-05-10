'use client';
import React, { useState, useEffect } from 'react';

export default function BookTracker() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' atau 'link'
  const [coverImage, setCoverImage] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedBooks = localStorage.getItem('my_digital_library');
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my_digital_library', JSON.stringify(books));
    }
  }, [books, isLoaded]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addBook = (e) => {
    e.preventDefault();
    if (!title || !author) return;

    // Menentukan cover mana yang dipakai berdasarkan mode aktif
    const finalCover = uploadMode === 'file' 
      ? (coverImage || 'https://via.placeholder.com/150?text=No+Cover')
      : (coverUrl || `https://source.unsplash.com/featured/?book,${title}`);

    const newBook = { id: Date.now(), title, author, cover: finalCover };

    const updatedBooks = [...books, newBook].sort((a, b) => 
      a.title.localeCompare(b.title)
    );

    setBooks(updatedBooks);
    setTitle('');
    setAuthor('');
    setCoverImage(null);
    setCoverUrl('');
    if(document.getElementById('fileInput')) document.getElementById('fileInput').value = "";
  };

  if (!isLoaded) return null;

  return (
    <div style={{ padding: '40px 20px', fontFamily: 'sans-serif', maxWidth: '850px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>📖 My Digital Library</h1>
      
      <form onSubmit={addBook} style={{ 
        backgroundColor: 'white', padding: '25px', borderRadius: '15px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '40px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <input placeholder="Judul Buku" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6' }} />
          <input placeholder="Penulis" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6' }} />
        </div>

        {/* Pilihan Mode Cover */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button type="button" onClick={() => setUploadMode('file')} style={{ flex: 1, padding: '8px', borderRadius: '5px', border: 'none', backgroundColor: uploadMode === 'file' ? '#0070f3' : '#e9ecef', color: uploadMode === 'file' ? 'white' : '#495057', cursor: 'pointer' }}>Upload File</button>
          <button type="button" onClick={() => setUploadMode('link')} style={{ flex: 1, padding: '8px', borderRadius: '5px', border: 'none', backgroundColor: uploadMode === 'link' ? '#0070f3' : '#e9ecef', color: uploadMode === 'link' ? 'white' : '#495057', cursor: 'pointer' }}>Paste Link URL</button>
        </div>
        
        {uploadMode === 'file' ? (
          <div style={{ marginBottom: '15px' }}>
            <input id="fileInput" type="file" accept="image/*" onChange={handleImageUpload} />
            {coverImage && <img src={coverImage} alt="Preview" style={{ display: 'block', marginTop: '10px', width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />}
          </div>
        ) : (
          <input placeholder="Masukkan URL Gambar (Contoh: https://...)" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '15px', boxSizing: 'border-box' }} />
        )}

        <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan & Urutkan</button>
      </form>

      {/* Grid Buku Tetap Sama */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '25px' }}>
        {books.map((book) => (
          <div key={book.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }}>
            <img src={book.cover} alt={book.title} style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
            <div style={{ padding: '15px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>{book.title}</h3>
              <p style={{ fontSize: '13px', color: '#7f8c8d' }}>{book.author}</p>
              <button onClick={() => setBooks(books.filter(b => b.id !== book.id))} style={{ width: '100%', marginTop: '10px', padding: '8px', backgroundColor: '#f8d7da', color: '#721c24', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
