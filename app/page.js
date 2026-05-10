const fetchFromGoogleBooks = async () => {
    if (!title) return alert("Masukkan judul buku terlebih dahulu");
    setSearchingAPI(true);
    try {
      // Mencari data buku berdasarkan judul
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=1`);
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        const info = data.items[0].volumeInfo;
        
        // 1. Mengisi Nama Penulis Otomatis
        setAuthor(info.authors ? info.authors.join(', ') : 'Penulis Tidak Diketahui');
        
        // 2. Mengisi URL Foto Otomatis
        // Kita mengambil thumbnail dan memastikan protokolnya HTTPS agar gambar muncul
        let image = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
        if (image) {
          image = image.replace('http:', 'https:');
        }
        
        setCoverUrl(image);
        
        if (image) {
          alert("Data ditemukan! Penulis dan Foto Cover telah terisi otomatis.");
        } else {
          alert("Data ditemukan, namun foto tidak tersedia di database Google. Silakan masukkan link foto secara manual.");
        }
      } else {
        alert("Buku tidak ditemukan. Silakan isi data secara manual.");
      }
    } catch (err) {
      console.error("Error API:", err);
      alert("Gagal mengambil data. Periksa koneksi internet Anda.");
    } finally {
      setSearchingAPI(false);
    }
  };
