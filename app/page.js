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
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Koleksi Buku Saya</h1>
      <form onSubmit={addBook}>
        <input placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Penulis" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <button type="submit">Tambah</button>
      </form>
      <ul>
        {books.map((book) => (
          <li key={book.id}>{book.title} - {book.author}</li>
        ))}
      </ul>
    </div>
  );
}
}
