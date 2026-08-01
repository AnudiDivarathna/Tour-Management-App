import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../api';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setCompanies(await api.getCompanies());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.createCompany({ name: name.trim() });
      setName('');
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingId) return;
    setFormError('');
    setSaving(true);
    try {
      await api.updateCompany(editingId, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this company? Existing tours keep the company name.')) return;
    try {
      await api.deleteCompany(id);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <Layout role="admin">
      <div className="page-header row">
        <div>
          <h1>Companies</h1>
          <p className="muted">Add company names for the tour company dropdown.</p>
        </div>
        <button type="button" className="btn primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close' : 'Add company'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form panel" onSubmit={handleCreate}>
          {formError && !editingId && <p className="error">{formError}</p>}
          <label>
            Company name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Estiaco Holidays"
              required
            />
          </label>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving && !editingId ? 'Saving…' : 'Create'}
          </button>
        </form>
      )}

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && companies.length === 0 && (
        <p className="muted panel">No companies yet. Add one to use it on tours.</p>
      )}

      {!loading && companies.length > 0 && (
        <div className="table-wrap panel">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company._id}>
                  <td>
                    {editingId === company._id ? (
                      <form className="inline-form compact" onSubmit={handleUpdate}>
                        {formError && editingId && <p className="error">{formError}</p>}
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                          autoFocus
                        />
                        <button type="submit" className="btn primary" disabled={saving}>
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => {
                            setEditingId(null);
                            setEditName('');
                            setFormError('');
                          }}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      company.name
                    )}
                  </td>
                  <td className="right">
                    {editingId !== company._id && (
                      <>
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => {
                            setEditingId(company._id);
                            setEditName(company.name);
                            setFormError('');
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn danger ghost"
                          onClick={() => handleDelete(company._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
