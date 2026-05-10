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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#666' }}>Menyiapkan Perpustakaan Pribadi...</div>;

  // --- TAMPILAN DETAIL (MODERN & CLEAN) ---
  if (selectedBook) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fdfdfd', padding: '40px 20px', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <button onClick={() => setSelectedBook(null)} style={{ background: 'none', border: 'none', color: '#2d3436', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', marginBottom: '30px', fontWeight: '600' }}>
            <span>←</span> Kembali ke Galeri
          </button>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '50px' }}>
            <img src={selectedBook.cover} onError={(e) => e.target.src = 'https://via.placeholder.com/300x450'} style={{ width: '100%', maxWidth: '350px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', color: '#2d3436', letterSpacing: '-1px' }}>{selectedBook.title}</h1>
              <p style={{ fontSize: '20px', color: '#636e72', marginBottom: '30px' }}>{selectedBook.author}</p>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#b2bec3', marginBottom: '10px' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1,2,3,4,5].map(s => <span key={s} onClick={() => updateBook(selectedBook.id, { rating: s })} style={{ fontSize: '28px', cursor: 'pointer', color: s <= selectedBook.rating ? '#fdcb6e' : '#dfe6e9' }}>★</span>)}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#b2bec3', marginBottom: '10px' }}>Status</label>
                  <button onClick={() => updateBook(selectedBook.id, { is_read: !selectedBook.is_read })} style={{ padding: '8px 20px', borderRadius: '100px', border: 'none', backgroundColor: selectedBook.is_read ? '#55efc4' : '#ffeaa7', color: '#2d3436', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                    {selectedBook.is_read ? 'SELESAI' : 'DIBACA'}
                  </button>
                </div>
              </div>

              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#b2bec3', marginBottom: '10px' }}>Catatan Pembelajaran</label>
              <textarea value={selectedBook.notes || ''} onChange={(e) => updateBook(selectedBook.id, { notes: e.target.value })} placeholder="Apa insight menarik dari buku ini?" style={{ width: '100%', height: '200px', padding: '20px', borderRadius: '20px', border: '1px solid #eee', backgroundColor: '#f9f9f9', fontSize: '16px', lineHeight: '1.6', color: '#2d3436', outline: 'none' }} />
              
              <button onClick={() => deleteBook(selectedBook.id)} style={{ marginTop: '40px', color: '#fab1a0', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}>Hapus dari database pribadi</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN UTAMA (GALLERY STYLE) ---
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#2d3436' }}>
      {/* Header Elegan */}
      <div style={{ padding: '80px 20px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-2px' }}>Perpustakaan Putri</h1>
        <p style={{ color: '#636e72', fontSize: '18px' }}>Arsip pengetahuan dan jejak literasi digital.</p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        {/* Form Tambah - Minimalist Card */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginBottom: '50px' }}>
          <form onSubmit={addBook} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            <input placeholder="Judul Buku" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: '1', minWidth: '200px', padding: '15px 20px', borderRadius: '15px', border: '1px solid #f0f0f0', outline: 'none', fontSize: '15px' }} />
            <input placeholder="Penulis" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ flex: '1', minWidth: '200px', padding: '15px 20px', borderRadius: '15px', border: '1px solid #f0f0f0', outline: 'none', fontSize: '15px' }} />
            <input placeholder="Link URL Cover" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ flex: '2', minWidth: '300px', padding: '15px 20px', borderRadius: '15px', border: '1px solid #f0f0f0', outline: 'none', fontSize: '15px' }} />
            <button type="submit" style={{ backgroundColor: '#2d3436', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '15px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}>Simpan</button>
          </form>
        </div>

        {/* Search Bar - Round Minimalist */}
        <div style={{ position: 'relative', marginBottom: '60px' }}>
          <input type="text" placeholder="Cari buku..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '20px 30px', borderRadius: '100px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', fontSize: '16px', outline: 'none' }} />
        </div>

        {/* Grid Buku - Aesthetic Gallery */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '40px', paddingBottom: '100px' }}>
          {filteredBooks.map(book => (
            <div key={book.id} onClick={() => setSelectedBook(book)} style={{ cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', height: '320px', marginBottom: '20px' }}>
                <img src={book.cover} onError={(e) => e.target.src = 'https://via.placeholder.com/200x300'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '20px', color: 'white' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', marginBottom: '5px' }}>{book.is_read ? 'SELESAI' : 'SEDANG DIBACA'}</div>
                  <div style={{ fontSize: '14px', color: '#fdcb6e' }}>{'★'.repeat(book.rating || 0)}</div>
                </div>
              </div>
              <h3 style={{ fontSize: '18px', margin: '0 0 5px 0', fontWeight: '700' }}>{book.title}</h3>
              <p style={{ fontSize: '14px', color: '#636e72', margin: '0' }}>{book.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
