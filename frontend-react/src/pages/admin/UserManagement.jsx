import { useEffect, useState } from 'react'
import { getUsers, deleteUser } from '../../api/api'
import { toast } from 'react-toastify'
import { UsersIcon, SearchIcon, TrashIcon } from '../../components/Icons'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    getUsers().then(r => setUsers(r.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete citizen account "${name}"? This action cannot be undone.`)) return
    try {
      await deleteUser(id)
      toast.success(`Citizen ${name} deleted successfully`)
      setUsers(users.filter(u => u.id !== id))
    } catch { 
      toast.error('Failed to delete user') 
    }
  }

  const filtered = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.citizen_id?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <h1>
          <UsersIcon size={24} color="var(--indigo)" /> Citizen Accounts Management
        </h1>
        <p>{users.length} registered citizen accounts across Karachi</p>
      </div>

      <div className="search-row">
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: 360}}>
          <input 
            className="form-input" 
            placeholder="Search by name, Citizen ID, or email..."
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{paddingLeft: 36}} 
          />
          <div style={{position: 'absolute', left: 12, display: 'flex', pointerEvents: 'none'}}>
            <SearchIcon size={16} color="var(--gray-400)" />
          </div>
        </div>
        <span style={{alignSelf:'center', fontSize:'.82rem', color:'var(--gray-400)'}}>
          Showing {filtered.length} of {users.length} citizens
        </span>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <UsersIcon size={36} color="var(--gray-300)" />
            <p style={{fontWeight: 600, color: 'var(--gray-600)'}}>No citizen accounts found</p>
            <p style={{fontSize: '0.8rem', marginTop: 4}}>Try clearing or adjusting your search term.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Citizen ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Complaints</th>
                <th>Registered</th>
                <th style={{textAlign: 'right'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td><span className="id-pill">{u.citizen_id}</span></td>
                  <td><strong>{u.full_name}</strong></td>
                  <td style={{color: 'var(--gray-600)'}}>{u.email}</td>
                  <td style={{color: 'var(--gray-600)'}}>{u.phone || '—'}</td>
                  <td><span className="badge badge-verified">{u.complaint_count} filed</span></td>
                  <td style={{color: 'var(--gray-500)', fontSize: '0.8rem'}}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{textAlign: 'right'}}>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => handleDelete(u.id, u.full_name)} 
                      style={{color: 'var(--rose)', borderColor: 'var(--rose-light)'}}
                      title="Delete account"
                    >
                      <TrashIcon size={13} color="var(--rose)" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
