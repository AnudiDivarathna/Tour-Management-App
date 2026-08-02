import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { EditIcon, TrashIcon } from '../components/icons';
import { api } from '../api';
import { useConfirm } from '../hooks/useConfirm';

export default function AdminCompanies() {
  const { confirm } = useConfirm();
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

  async function handleDelete(company) {
    const ok = await confirm({
      title: `Delete ${company.name}?`,
      message: 'Existing tours keep the company name. This cannot be undone.',
      confirmLabel: 'Delete company',
    });
    if (!ok) return;
    try {
      await api.deleteCompany(company._id);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  function startEdit(company) {
    setEditingId(company._id);
    setEditName(company.name);
    setFormError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setFormError('');
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

      {!loading && !error && (
        <div className="table-wrap panel companies-table-wrap">
          <table className="companies-table">
            <thead>
              <tr>
                <th className="col-company">Company</th>
                <th className="col-actions" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 && (
                <tr>
                  <td colSpan={2} className="muted">
                    No companies yet. Add one to use it on tours.
                  </td>
                </tr>
              )}
              {companies.map((company) => (
                <tr key={company._id}>
                  <td className="col-company">
                    {editingId === company._id ? (
                      <form className="inline-form compact company-edit-form" onSubmit={handleUpdate}>
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
                        <button type="button" className="btn ghost" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <span className="company-text">{company.name}</span>
                    )}
                  </td>
                  <td className="col-actions">
                    {editingId !== company._id && (
                      <div className="company-actions-inner">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit company"
                          aria-label={`Edit ${company.name}`}
                          onClick={() => startEdit(company)}
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title="Delete company"
                          aria-label={`Delete ${company.name}`}
                          onClick={() => handleDelete(company)}
                        >
                          <TrashIcon />
                        </button>
                      </div>
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
