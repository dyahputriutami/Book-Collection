'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oabrworkjhiwyqjbjnrj.supabase.co';
const supabaseKey = 'sb_publishable_njmgfGUnskvboIHDOLOgdw_n25SOZAx';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PerpustakaanPutri() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

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
      setBooks(data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const updateBook = async (id, updates) => {
    const { error } = await supabase.from('Perpustakaan Putri').update(updates).eq('id', id);
    if (!error) {
      setBooks(books.map(b => b.id === id ? { ...b, ...updates } : b));
      if (selectedBook && selectedBook.id === id) setSelectedBook({ ...selectedBook, ...updates });
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return;
    const { error } = await supabase.from('Perpustakaan Putri').insert([{ title, author, cover: coverUrl || 'https://via.placeholder.com/200x300', rating: 0, is_read: false, notes: '' }]);
    if (!error) { setTitle(''); setAuthor(''); setCoverUrl(''); fetchBooks(); }
  };

  const deleteBook = async (id) => {
    if (confirm('Hapus koleksi ini?')) {
      const { error } = await supabase.from('Perpustakaan Putri').delete().eq('id', id);
      if (!error) { setSelectedBook(null); fetchBooks(); }
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#800000' }}>Menyiapkan Perpustakaan...</div>;

  if (selectedBook) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fff5f5', padding: '40px 20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <button onClick={() => setSelectedBook(null)} style={{ background: 'none', border: 'none', color: '#800000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', marginBottom: '30px', fontWeight: '600' }}>
            <span>←</span> Kembali
          </button>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '50px', backgroundColor: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(128,0,0,0.05)' }}>
            <img src={selectedBook.cover} onError={(e) => e.target.src = 'https://via.placeholder.com/300x450'} style={{ width: '100%', maxWidth: '320px', borderRadius: '20px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }} />
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', color: '#4a0000' }}>{selectedBook.title}</h1>
              <p style={{ fontSize: '18px', color: '#666', marginBottom: '25px' }}>{selectedBook.author}</p>
              
              <div style={{ marginBottom: '30px' }}>
                <button onClick={() => updateBook(selectedBook.id, { is_read: !selectedBook.is_read })} style={{ padding: '10px 25px', borderRadius: '100px', border: 'none', backgroundColor: selectedBook.is_read ? '#800000' : '#f0f0f0', color: selectedBook.is_read ? 'white' : '#666', fontWeight: '700', cursor: 'pointer' }}>
                  {selectedBook.is_read ? '✓ SUDAH SELESAI' : '📖 SEDANG DIBACA'}
                </button>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#800000', marginBottom: '10px' }}>RATING ANDA</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[1,2,3,4,5].map(s => <span key={s} onClick={() => updateBook(selectedBook.id, { rating: s })} style={{ fontSize: '32px', cursor: 'pointer', color: s <= selectedBook.rating ? '#ffd700' : '#eee' }}>★</span>)}
                </div>
              </div>

              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#800000', marginBottom: '10px' }}>CATATAN REVIEW</label>
              <textarea value={selectedBook.notes || ''} onChange={(e) => updateBook(selectedBook.id, { notes: e.target.value })} style={{ width: '100%', height: '180px', padding: '15px', borderRadius: '15px', border: '1px solid #eee', fontSize: '16px', outline: 'none' }} />
              
              <button onClick={() => deleteBook(selectedBook.id)} style={{ marginTop: '30px', color: '#ff7675', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>Hapus buku ini</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffafa', fontFamily: 'sans-serif', color: '#2d3436' }}>
      {/* Header */}
      <div style={{ padding: '60px 20px 30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '800', margin: '0', color: '#4a0000' }}>Perpustakaan Putri</h1>
        <p style={{ color: '#804040', fontSize: '16px', marginTop: '10px' }}>Arsip pengetahuan dan jejak literasi digital.</p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        {/* Form Container */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(128,0,0,0.04)', marginBottom: '20px' }}>
          <form onSubmit={addBook} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <input placeholder="Judul Buku" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: '1', padding: '12px 18px', borderRadius: '12px', border: '1px solid #f0e0e0', outline: 'none' }} />
            <input placeholder="Penulis" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ flex: '1', padding: '12px 18px', borderRadius: '12px', border: '1px solid #f0e0e0', outline: 'none' }} />
            <input placeholder="Link URL Cover" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ flex: '1.5', padding: '12px 18px', borderRadius: '12px', border: '1px solid #f0e0e0', outline: 'none' }} />
            <button type="submit" style={{ backgroundColor: '#800000', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Simpan</button>
          </form>
        </div>

        {/* Search Bar - Sekarang Presisi dengan Lebar Form di Atas */}
        <div style={{ marginBottom: '50px' }}>
          <input type="text" placeholder="🔍 Cari koleksi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '14px 20px', borderRadius: '14px', border: '1px solid #f0e0e0', fontSize: '15px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }} />
        </div>

        {/* Gallery Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '30px', paddingBottom: '80px' }}>
          {filteredBooks.map(book => (
            <div key={book.id} onClick={() => setSelectedBook(book)} style={{ cursor: 'pointer', transition: 'all 0.3s' }}>
              <div style={{ overflow: 'hidden', borderRadius: '18px', boxShadow: '0 10px 20px rgba(0,0,0,0.08)', height: '260px', marginBottom: '15px' }}>
                <img src={book.cover} onError={(e) => e.target.src = 'https://via.placeholder.com/200x300'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              {/* Penataan Baru: Label & Stars di Bawah Judul */}
              <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', fontWeight: '700', color: '#4a0000' }}>{book.title}</h3>
              <p style={{ fontSize: '13px', color: '#888', margin: '0 0 8px 0' }}>{book.author}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', backgroundColor: book.is_read ? '#fff0f0' : '#f0f0f0', color: book.is_read ? '#800000' : '#888', border: `1px solid ${book.is_read ? '#ffdada' : '#eee'}` }}>
                  {book.is_read ? 'SELESAI' : 'DIBACA'}
                </span>
              </div>
              
              <div style={{ fontSize: '14px', color: '#ffd700' }}>
                {'★'.repeat(book.rating || 0)}{'☆'.repeat(5 - (book.rating || 0))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
