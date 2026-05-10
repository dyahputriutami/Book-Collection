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
  const [isEditing, setIsEditing] = useState(false);
  
  // State Input
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
      setIsEditing(false);
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return;
    const { error } = await supabase.from('Perpustakaan Putri').insert([{ 
      title, author, cover: coverUrl || 'https://via.placeholder.com/200x300', 
      rating: 0, status: 'Belum Dibaca', notes: '' 
    }]);
    if (!error) { setTitle(''); setAuthor(''); setCoverUrl(''); fetchBooks(); }
  };

  const deleteBook = async (id) => {
    if (confirm('Hapus koleksi ini secara permanen?')) {
      const { error } = await supabase.from('Perpustakaan Putri').delete().eq('id', id);
      if (!error) { setSelectedBook(null); fetchBooks(); }
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Selesai Dibaca': return { bg: '#fff0f0', text: '#800000', border: '#ffdada' };
      case 'Sedang Dibaca': return { bg: '#fff9db', text: '#f59f00', border: '#ffe066' };
      default: return { bg: '#f8f9fa', text: '#868e96', border: '#e9ecef' };
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#800000' }}>Menyiapkan Perpustakaan...</div>;

  // --- HALAMAN DETAIL & EDIT ---
  if (selectedBook) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fffafa', padding: '40px 20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <button onClick={() => { setSelectedBook(null); setIsEditing(false); }} style={{ background: 'none', border: 'none', color: '#800000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', marginBottom: '30px', fontWeight: '600' }}>
            <span>←</span> Kembali
          </button>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '50px', backgroundColor: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(128,0,0,0.05)', border: '1px solid #f0e0e0' }}>
            <div style={{ textAlign: 'center' }}>
              <img src={selectedBook.cover} onError={(e) => e.target.src = 'https://via.placeholder.com/300x450'} style={{ width: '100%', maxWidth: '320px', borderRadius: '20px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)', marginBottom: '20px' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => setIsEditing(!isEditing)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #800000', backgroundColor: isEditing ? '#800000' : 'white', color: isEditing ? 'white' : '#800000', cursor: 'pointer', fontWeight: '600' }}>
                  {isEditing ? 'Batal Edit' : '✎ Edit Info Buku'}
                </button>
                <button onClick={() => deleteBook(selectedBook.id)} style={{ padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#fff0f0', color: '#e03131', cursor: 'pointer', fontWeight: '600' }}>
                  🗑 Hapus Buku
                </button>
              </div>
            </div>

            <div style={{ flex: '1', minWidth: '300px' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                  <label style={{ fontWeight: '800', fontSize: '12px', color: '#800000' }}>EDIT INFORMASI DASAR</label>
                  <input value={selectedBook.title} onChange={(e) => setSelectedBook({...selectedBook, title: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} placeholder="Judul Buku" />
                  <input value={selectedBook.author} onChange={(e) => setSelectedBook({...selectedBook, author: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} placeholder="Penulis" />
                  <input value={selectedBook.cover} onChange={(e) => setSelectedBook({...selectedBook, cover: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} placeholder="URL Cover" />
                  <button onClick={() => updateBook(selectedBook.id, { title: selectedBook.title, author: selectedBook.author, cover: selectedBook.cover })} style={{ padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#800000', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                    Simpan Perubahan
                  </button>
                </div>
              ) : (
                <>
                  <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', color: '#4a0000' }}>{selectedBook.title}</h1>
                  <p style={{ fontSize: '18px', color: '#666', marginBottom: '25px' }}>{selectedBook.author}</p>
                </>
              )}
              
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#800000', marginBottom: '10px' }}>STATUS BACA</label>
                <select 
                  value={selectedBook.status || 'Belum Dibaca'} 
                  onChange={(e) => updateBook(selectedBook.id, { status: e.target.value })}
                  style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #eee', outline: 'none', cursor: 'pointer', fontWeight: '600' }}
                >
                  <option value="Belum Dibaca">⚪ Belum Dibaca</option>
                  <option value="Sedang Dibaca">📖 Sedang Dibaca</option>
                  <option value="Selesai Dibaca">✅ Selesai Dibaca</option>
                </select>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#800000', marginBottom: '10px' }}>RATING ANDA</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[1,2,3,4,5].map(s => <span key={s} onClick={() => updateBook(selectedBook.id, { rating: s })} style={{ fontSize: '32px', cursor: 'pointer', color: s <= selectedBook.rating ? '#ffd700' : '#eee' }}>★</span>)}
                </div>
              </div>

              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#800000', marginBottom: '10px' }}>CATATAN REVIEW</label>
              <textarea value={selectedBook.notes || ''} onChange={(e) => updateBook(selectedBook.id, { notes: e.target.value })} style={{ width: '100%', height: '180px', padding: '15px', borderRadius: '15px', border: '1px solid #eee', fontSize: '16px', outline: 'none' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN UTAMA ---
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffafa', fontFamily: 'sans-serif', color: '#2d3436' }}>
      <div style={{ padding: '60px 20px 30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '800', margin: '0', color: '#4a0000' }}>Perpustakaan Putri</h1>
        <p style={{ color: '#804040', fontSize: '16px', marginTop: '10px' }}>Arsip pengetahuan dan jejak literasi digital.</p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(128,0,0,0.04)', marginBottom: '20px', border: '1px solid #f0e0e0' }}>
          <form onSubmit={addBook} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <input placeholder="Judul Buku" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: '1', padding: '12px 18px', borderRadius: '12px', border: '1px solid #f0e0e0', outline: 'none' }} />
            <input placeholder="Penulis" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ flex: '1', padding: '12px 18px', borderRadius: '12px', border: '1px solid #f0e0e0', outline: 'none' }} />
            <input placeholder="Link URL Cover" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ flex: '1.5', padding: '12px 18px', borderRadius: '12px', border: '1px solid #f0e0e0', outline: 'none' }} />
            <button type="submit" style={{ backgroundColor: '#800000', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Simpan</button>
          </form>
        </div>

        <div style={{ marginBottom: '50px' }}>
          <input type="text" placeholder="🔍 Cari koleksi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '14px 20px', borderRadius: '14px', border: '1px solid #f0e0e0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '35px', paddingBottom: '80px' }}>
          {filteredBooks.map(book => {
            const statusStyle = getStatusStyle(book.status);
            return (
              <div 
                key={book.id} 
                onClick={() => setSelectedBook(book)} 
                style={{ 
                  cursor: 'pointer', transition: 'all 0.3s ease', padding: '15px', borderRadius: '24px', backgroundColor: 'white', border: '1px solid #f0e0e0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(128,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#ffdada';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = '#f0e0e0';
                }}
              >
                <div style={{ overflow: 'hidden', borderRadius: '15px', height: '260px', marginBottom: '15px' }}>
                  <img src={book.cover} onError={(e) => e.target.src = 'https://via.placeholder.com/200x300'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', fontWeight: '700', color: '#4a0000', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px' }}>{book.title}</h3>
                <p style={{ fontSize: '13px', color: '#888', margin: '0 0 10px 0' }}>{book.author}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ alignSelf: 'flex-start', fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', backgroundColor: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}`, textTransform: 'uppercase' }}>
                    {book.status || 'Belum Dibaca'}
                  </span>
                  <div style={{ fontSize: '14px', color: '#ffd700' }}>
                    {'★'.repeat(book.rating || 0)}{'☆'.repeat(5 - (book.rating || 0))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
