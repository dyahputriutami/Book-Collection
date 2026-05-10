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
  
  // State Input Form
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
    const { error } = await supabase
      .from('Perpustakaan Putri')
      .update(updates)
      .eq('id', id);
    
    if (!error) {
      setBooks(books.map(b => b.id === id ? { ...b, ...updates } : b));
      if (selectedBook && selectedBook.id === id) {
        setSelectedBook({ ...selectedBook, ...updates });
      }
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return;
    
    const finalCover = coverUrl || 'https://via.placeholder.com/200x300?text=No+Cover';
    
    const { error } = await supabase
      .from('Perpustakaan Putri')
      .insert([{ 
        title, 
        author, 
        cover: finalCover, 
        rating: 0, 
        is_read: false, 
        notes: '' 
      }]);

    if (!error) {
      setTitle(''); setAuthor(''); setCoverUrl('');
      fetchBooks();
    }
  };

  const deleteBook = async (id) => {
    if (confirm('Hapus buku ini secara permanen?')) {
      const { error } = await supabase.from('Perpustakaan Putri').delete().eq('id', id);
      if (!error) {
        setSelectedBook(null);
        fetchBooks();
      }
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif'}}>Menghubungkan ke Perpustakaan Putri...</div>;

  // --- TAMPILAN HALAMAN DETAIL ---
  if (selectedBook) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <button 
          onClick={() => setSelectedBook(null)} 
          style={{ marginBottom: '25px', padding: '10px 20px', cursor: 'pointer', borderRadius: '10px', border: '1px solid #dee2e6', backgroundColor: 'white', fontWeight: '500' }}
        >
          ← Kembali ke Koleksi
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
          <div style={{ textAlign: 'center' }}>
            <img 
              src={selectedBook.cover} 
              onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=Cover+Tidak+Ditemukan'; }}
              style={{ width: '100%', maxWidth: '300px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }} 
            />
          </div>
          
          <div>
            <h1 style={{ margin: '0 0 10px 0', color: '#1a1a1a', fontSize: '28px' }}>{selectedBook.title}</h1>
            <p style={{ color: '#6c757d', fontSize: '18px', marginBottom: '25px' }}>Penulis: {selectedBook.author}</p>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '10px', color: '#495057' }}>Status Membaca:</label>
              <button 
                onClick={() => updateBook(selectedBook.id, { is_read: !selectedBook.is_read })}
                style={{ 
                  padding: '12px 24px', borderRadius: '12px', border: 'none', 
                  backgroundColor: selectedBook.is_read ? '#2ecc71' : '#f1c40f', 
                  color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s'
                }}
              >
                {selectedBook.is_read ? '✓ Sudah Selesai Dibaca' : '📖 Sedang Dibaca'}
              </button>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '10px', color: '#495057' }}>Rating:</label>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[1,2,3,4,5].map(star => (
                  <span 
                    key={star} 
                    onClick={() => updateBook(selectedBook.id, { rating: star })} 
                    style={{ fontSize: '35px', cursor: 'pointer', color: star <= selectedBook.rating ? '#f1c40f' : '#e9ecef', transition: '0.2s' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '10px', color: '#495057' }}>Catatan & Review:</label>
              <textarea 
                value={selectedBook.notes || ''} 
                onChange={(e) => updateBook(selectedBook.id, { notes: e.target.value })}
                placeholder="Apa yang Anda pelajari dari buku ini?"
                style={{ width: '100%', height: '180px', padding: '15px', borderRadius: '15px', border: '1px solid #dee2e6', fontSize: '16px', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: '1.5' }}
              />
            </div>
            
            <button 
              onClick={() => deleteBook(selectedBook.id)} 
              style={{ marginTop: '20px', color: '#fa5252', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
            >
              Hapus buku ini dari perpustakaan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN HALAMAN UTAMA ---
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '10px' }}>📚 Perpustakaan Putri</h1>
        <p style={{ color: '#7f8c8d' }}>Kelola koleksi bacaan dan catatan perkembangan diri.</p>
      </header>
      
      {/* FORM INPUT CEPAT */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', marginBottom: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <form onSubmit={addBook} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <input placeholder="Judul Buku" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '15px', borderRadius: '10px', border: '1px solid #dee2e6', fontSize: '16px' }} />
            <input placeholder="Nama Penulis" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ padding: '15px', borderRadius: '10px', border: '1px solid #dee2e6', fontSize: '16px' }} />
          </div>
          <input 
            placeholder="Link URL Cover Buku (Contoh: https://.../gambar.jpg)" 
            value={coverUrl} 
            onChange={(e) => setCoverUrl(e.target.value)} 
            style={{ padding: '15px', borderRadius: '10px', border: '1px solid #dee2e6', fontSize: '16px' }} 
          />
          <button type="submit" style={{ padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.3s' }}>
            + Tambah Koleksi Baru
          </button>
        </form>
      </div>

      {/* PENCARIAN */}
      <div style={{ marginBottom: '40px' }}>
        <input 
          type="text" 
          placeholder="🔍 Cari judul buku atau penulis..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ width: '100%', padding: '18px 25px', borderRadius: '50px', border: '2px solid #0070f3', fontSize: '16px', boxSizing: 'border-box', boxShadow: '0 5px 15px rgba(0,112,243,0.1)' }} 
        />
      </div>

      {/* GRID DAFTAR BUKU */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px' }}>
        {filteredBooks.map(book => (
          <div 
            key={book.id} 
            onClick={() => setSelectedBook(book)} 
            style={{ 
              backgroundColor: 'white', borderRadius: '18px', overflow: 'hidden', cursor: 'pointer', 
              transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
              position: 'relative'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.12)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
            }}
          >
            <div style={{ position: 'relative', height: '280px' }}>
              <img 
                src={book.cover} 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/200x300?text=Cover+Tidak+Ditemukan'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ 
                position: 'absolute', top: '12px', right: '12px', 
                backgroundColor: book.is_read ? '#2ecc71' : '#f1c40f', 
                color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}>
                {book.is_read ? '✓ SELESAI' : '📖 MEMBACA'}
              </div>
            </div>
            
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', margin: '0 0 5px 0', color: '#2c3e50', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px' }}>
                {book.title}
              </h3>
              <p style={{ fontSize: '12px', color: '#95a5a6', marginBottom: '12px' }}>{book.author}</p>
              <div style={{ color: '#f1c40f', fontSize: '16px' }}>
                {'★'.repeat(book.rating || 0)}{'☆'.repeat(5 - (book.rating || 0))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredBooks.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#95a5a6' }}>
          Tidak ada buku yang ditemukan.
        </div>
      )}
    </div>
  );
}
