'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oabrworkjhiwyqjbjnrj.supabase.co';
const supabaseKey = 'sb_publishable_njmgfGUnskvboIHDOLOgdw_n25SOZAx';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BookTracker() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [isRead, setIsRead] = useState(false);
  const [uploadMode, setUploadMode] = useState('file');
  const [coverImage, setCoverImage] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const { data, error } = await supabase
        .from('Perpustakaan Putri')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      if (data) setBooks(data);
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return;

    const finalCover = uploadMode === 'file' 
      ? (coverImage || 'https://via.placeholder.com/150?text=No+Cover')
      : (coverUrl || `https://via.placeholder.com/150?text=${title}`);

    const { error } = await supabase
      .from('Perpustakaan Putri')
      .insert([{ title, author, cover: finalCover, rating: parseInt(rating), is_read: isRead }]);

    if (!error) {
      setTitle('');
      setAuthor('');
      setRating(5);
      setIsRead(false);
      setCoverImage(null);
      setCoverUrl('');
      fetchBooks(); 
    } else {
      alert("Gagal menyimpan: " + error.message);
    }
  };

  const deleteBook = async (id) => {
    if (confirm('Hapus buku ini?')) {
      const { error } = await supabase.from('Perpustakaan Putri').delete().eq('id', id);
      if (!error) fetchBooks();
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif'}}>Menghubungkan ke database...</div>;

  return (
    <div style={{ padding: '40px 20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>Perpustakaan Putri</h1>
      
      <form onSubmit={addBook} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <input placeholder="Judul Buku" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6' }} />
          <input placeholder="Penulis" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6' }} />
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <label style={{ fontSize: '14px', marginRight: '10px' }}>Rating:</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ padding: '8px', borderRadius: '5px' }}>
              {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Bintang</option>)}
            </select>
          </div>
          <label style={{ fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={isRead} onChange={(e) => setIsRead(e.target.checked)} style={{ marginRight: '8px' }} />
            Sudah Selesai Dibaca
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button type="button" onClick={() => setUploadMode('file')} style={{ flex: 1, padding: '8px', borderRadius: '5px', border: 'none', backgroundColor: uploadMode === 'file' ? '#0070f3' : '#e9ecef', color: uploadMode === 'file' ? 'white' : '#495057', cursor: 'pointer' }}>Upload File</button>
          <button type="button" onClick={() => setUploadMode('link')} style={{ flex: 1, padding: '8px', borderRadius: '5px', border: 'none', backgroundColor: uploadMode === 'link' ? '#0070f3' : '#e9ecef', color: uploadMode === 'link' ? 'white' : '#495057', cursor: 'pointer' }}>Paste Link URL</button>
        </div>
        
        {uploadMode === 'file' ? (
          <div style={{ marginBottom: '15px' }}>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
        ) : (
          <input placeholder="URL Gambar Sampul" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '15px', boxSizing: 'border-box' }} />
        )}

        <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan ke Cloud</button>
      </form>

      <div style={{ marginBottom: '30px' }}>
        <input type="text" placeholder="🔍 Cari judul atau penulis..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #0070f3', fontSize: '16px', boxSizing: 'border-box' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' }}>
        {filteredBooks.map((book) => (
          <div key={book.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.08)', position: 'relative' }}>
            <img src={book.cover} alt={book.title} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
            
            {/* Label Status Baca */}
            <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: book.is_read ? '#2ecc71' : '#f1c40f', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' }}>
              {book.is_read ? '✓ SELESAI' : '📖 SEDANG DIBACA'}
            </div>

            <div style={{ padding: '15px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>{book.title}</h3>
              <p style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '10px' }}>{book.author}</p>
              
              {/* Tampilan Rating */}
              <div style={{ color: '#f1c40f', marginBottom: '15px' }}>
                {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
              </div>

              <button onClick={() => deleteBook(book.id)} style={{ width: '100%', padding: '8px', backgroundColor: '#fff5f5', color: '#e03131', border: '1px solid #ffa8a8', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
