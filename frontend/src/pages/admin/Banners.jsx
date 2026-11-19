import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

const emptyForm = { title: '', image_url: '', link: '', is_active: true };

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBanners = async () => {
    try {
      const res = await apiClient.get('/banners/all');
      setBanners(res.data);
      setMessage('');
    } catch (err) {
      setMessage('Could not load banners. Are you logged in as admin?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAdd = async () => {
    if (!form.title || !form.image_url) {
      setMessage('Title and image URL are required.');
      return;
    }
    try {
      await apiClient.post('/banners/', {
        title: form.title,
        image_url: form.image_url,
        link: form.link || null,
        is_active: true,
      });
      setForm(emptyForm);
      setMessage('Banner added.');
      loadBanners();
    } catch (err) {
      setMessage('Could not add banner.');
    }
  };

  const toggleActive = async (b) => {
    try {
      await apiClient.put(`/banners/${b.id}`, {
        title: b.title,
        image_url: b.image_url,
        link: b.link,
        is_active: !b.is_active,
      });
      loadBanners();
    } catch (err) {
      setMessage('Could not update banner.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await apiClient.delete(`/banners/${id}`);
      setMessage('Banner deleted.');
      loadBanners();
    } catch (err) {
      setMessage('Could not delete banner.');
    }
  };

  const box = { border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 16, background: '#fff' };
  const input = { display: 'block', width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box' };
  const btn = { padding: '8px 14px', marginRight: 8, cursor: 'pointer' };

  return (
    <div style={{ maxWidth: 800, margin: '24px auto', padding: '0 16px' }}>
      <h2>Manage Banners</h2>
      {message && <p><strong>{message}</strong></p>}

      <div style={box}>
        <h3>Add new banner</h3>
        <input style={input} name="title" placeholder="Title" value={form.title} onChange={handleChange} />
        <input style={input} name="image_url" placeholder="Image URL (https://...)" value={form.image_url} onChange={handleChange} />
        <input style={input} name="link" placeholder="Link when clicked (optional)" value={form.link} onChange={handleChange} />
        <button style={btn} onClick={handleAdd}>Add Banner</button>
      </div>

      <h3>All banners</h3>
      {loading && <p>Loading...</p>}
      {!loading && banners.length === 0 && <p>No banners yet.</p>}

      {banners.map((b) => (
        <div key={b.id} style={box}>
          <img src={b.image_url} alt={b.title} style={{ maxWidth: '100%', maxHeight: 140, marginBottom: 8 }} />
          <p><strong>{b.title}</strong></p>
          <p>Status: {b.is_active ? 'Active' : 'Hidden'}</p>
          <button style={btn} onClick={() => toggleActive(b)}>
            {b.is_active ? 'Hide' : 'Show'}
          </button>
          <button style={btn} onClick={() => handleDelete(b.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}