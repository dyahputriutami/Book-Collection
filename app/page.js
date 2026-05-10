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
    const { error } = await supabase.from('Perpustakaan Putri').insert([{ title, author, cover: coverUrl || 'https://via.placeholder.com/200x300', rating: 0, status: 'Belum Dibaca', notes: '' }]);
    if (!error) { setTitle(''); setAuthor(''); setCoverUrl(''); fetchBooks(); }
  };

  const deleteBook = async (id) => {
    if (confirm('Hapus koleksi ini?')) {
      const { error } = await supabase.from('Perpustakaan Putri').delete().eq('id', id);
      if (!error) { setSelectedBook(null); fetchBooks(); }
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()));

  // Fungsi helper untuk warna label status
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Selesai Dibaca': return { bg: '#fff0f0', text: '#800000', border: '#ffdada' };
      case 'Sedang Dibaca': return { bg: '#fff9db', text: '#f59f00', border: '#ffe066' };
      default: return { bg: '#f8f9fa', text: '#868e96', border: '#e9ecef' }; // Belum Dibaca
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#800000' }}>Menyiapkan Perpustakaan...</div>;

  if (selectedBook) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fffafa', padding: '40px 20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <button onClick={() => setSelectedBook(null)} style={{ background: 'none', border: 'none', color: '#800000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', marginBottom: '30px', fontWeight: '600' }}>
            <span>←</span> Kembali
          </button>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '50px', backgroundColor: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(128,0,0,0.05)', border: '1px solid #f0e0e0' }}>
            <img src={selectedBook.cover} onError={(e) => e.target.src = 'https://via.placeholder.com/300x450'} style={{ width: '100%', maxWidth: '320px', borderRadius: '20px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }} />
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', color: '#4a0000' }}>{selectedBook.title}</h1>
              <p style={{ fontSize: '18px', color: '#666', marginBottom: '25px' }}>{selectedBook.author}</p>
              
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#800000', marginBottom: '10px' }}>STATUS BACA</label>
                <select 
                  value={selectedBook.status || 'Belum Dibaca'} 
                  onChange={(e) => updateBook(selectedBook.id, { status: e.target.value })}
                  style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #eee', outline: 'none', cursor: 'pointer', fontWeight: '600' }}
                >
                  <option value="Belum Dibaca">⚪ Belum Dibaca</option>
                  <option value="Sedang Dibaca">📖 Sedang Dibaca</option>
                  <option value="Selesai Dibaca
