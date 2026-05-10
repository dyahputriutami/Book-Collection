'use client';
import React, { useState } from 'react';

export default function BookTracker() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  const addBook = (e) => {
    e.preventDefault();
    if (!title || !author) return;
    const newBook = { id: Date.now(), title, author };
    setBooks([...books, newBook]);
    setTitle('');
    setAuthor('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Koleksi Buku Saya</h1>
      
      <form onSubmit={addBook} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          placeholder="Judul Buku" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          style={{ padding: '8px' }}
        />
        <input 
          placeholder="Penulis" 
          value={author} 
          onChange={(e) => setAuthor(e.target.value)} 
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}>
          Tambah ke Koleksi
        </button>
      </form>

      <hr />

      <ul style={{ listStyle: 'none', padding: '0' }}>
        {books.map((book) => (
          <li key={book.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
            <strong>{book.title}</strong> - {book.author}
          </li>
        ))}
      </ul>
      {books.length === 0 && <p>Belum ada buku di koleksi.</p>}
    </div>
  );
}
