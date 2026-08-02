import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { EditIcon, TrashIcon } from '../components/icons';
import { api } from '../api';
import { useAuth } from '../auth';
import { useConfirm } from '../hooks/useConfirm';

const emptyForm = {
  name: '',
  username: '',
  password: '',
  role: 'driver',
  vehicles: [],
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { confirm } = useConfirm();
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [userList, vehicleList] = await Promise.all([
        api.getUsers(),
        api.getVehicles(),
      ]);
      setUsers(userList);
      setVehicles(vehicleList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleVehicle(id) {
    setForm((prev) => ({
      ...prev,
      vehicles: prev.vehicles.includes(id)
        ? prev.vehicles.filter((v) => v !== id)
        : [...prev.vehicles, id],
    }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  }

  function startEdit(user) {
    setEditingId(user._id);
    setForm({
      name: user.name,
      username: user.username,
      password: '',
      role: user.role,
      vehicles: (user.vehicles || []).map((v) => v._id || v),
    });
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        role: form.role,
        vehicles: form.role === 'driver' ? form.vehicles : [],
      };
      if (form.password) payload.password = form.password;

      if (editingId) {
        await api.updateUser(editingId, payload);
      } else {
        if (!form.password) throw new Error('Password is required for a new user');
        await api.createUser(payload);
      }
      closeForm();
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    const ok = await confirm({
      title: `Delete ${user.name}?`,
      message: 'They will lose access immediately. This cannot be undone.',
      confirmLabel: 'Delete user',
    });
    if (!ok) return;
    try {
      await api.deleteUser(user._id);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <Layout role="admin">
      <div className="page-header row">
        <div>
          <h1>Users</h1>
          <p className="muted">
            Add admins and drivers, and choose which vehicles each driver can see.
          </p>
        </div>
        <button type="button" className="btn primary" onClick={startCreate}>
          Add user
        </button>
      </div>

      {showForm && (
        <form className="panel user-form" onSubmit={handleSubmit}>
          <h3 className="form-section-title">{editingId ? 'Edit user' : 'New user'}</h3>
          {formError && <p className="error">{formError}</p>}

          <div className="form-grid">
            <label>
              Full name
              <input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Sunil Perera"
                required
              />
            </label>
            <label>
              Username
              <input
                value={form.username}
                onChange={(e) => update('username', e.target.value)}
                placeholder="e.g. sunil"
                autoCapitalize="none"
                required
              />
            </label>
            <label>
              {editingId ? 'New password (optional)' : 'Password'}
              <input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder={editingId ? 'Leave blank to keep current' : 'At least 4 characters'}
                autoComplete="new-password"
              />
            </label>
            <label>
              User type
              <select value={form.role} onChange={(e) => update('role', e.target.value)}>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>

          {form.role === 'driver' ? (
            <div className="vehicle-access">
              <p className="vehicle-access-label">Vehicle access</p>
              {vehicles.length === 0 ? (
                <p className="muted">Add vehicles first, then assign them here.</p>
              ) : (
                <div className="vehicle-access-grid">
                  {vehicles.map((v) => (
                    <label key={v._id} className="vehicle-check">
                      <input
                        type="checkbox"
                        checked={form.vehicles.includes(v._id)}
                        onChange={() => toggleVehicle(v._id)}
                      />
                      <span>{v.numberPlate}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="muted vehicle-access-note">
              Admins can see every vehicle and both views.
            </p>
          )}

          <div className="form-actions">
            <button type="button" className="btn ghost" onClick={closeForm}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </form>
      )}

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrap panel users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th className="col-name">Name</th>
                <th className="col-username">Username</th>
                <th className="col-type">Type</th>
                <th className="col-actions" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted">
                    No users yet.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                  <tr key={u._id}>
                    <td className="col-name">
                      <span className="name-text">{u.name}</span>
                      {u._id === currentUser?._id && <span className="you-tag">you</span>}
                    </td>
                    <td className="col-username">{u.username}</td>
                    <td className="col-type">
                      <span className={`role-badge ${u.role}`}>
                        {u.role === 'admin' ? 'Admin' : 'Driver'}
                      </span>
                    </td>
                    <td className="col-actions">
                      <div className="user-actions-inner">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit user"
                          aria-label={`Edit ${u.name}`}
                          onClick={() => startEdit(u)}
                        >
                          <EditIcon />
                        </button>
                        {u._id !== currentUser?._id && (
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="Delete user"
                            aria-label={`Delete ${u.name}`}
                            onClick={() => handleDelete(u)}
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
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
