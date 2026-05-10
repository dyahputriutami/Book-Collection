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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Koleksi Buku Saya</h1>
        
        {/* Form Input */}
        <form onSubmit={addBook} className="flex flex-col gap-4 mb-8">
          <input 
            className="border p-2 rounded" 
            placeholder="Judul Buku" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input 
            className="border p-2 rounded" 
            placeholder="Penulis" 
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Tambah ke Koleksi
          </button>
        </form>

        {/* Daftar Buku */}
        <ul className="divide-y divide-gray-200">
          {books.map((book) => (
            <li key={book.id} className="py-4">
              <p className="font-semibold text-lg">{book.title}</p>
              <p className="text-gray-600">{book.author}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
