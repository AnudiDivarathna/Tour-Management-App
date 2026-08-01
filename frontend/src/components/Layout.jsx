import { Link, NavLink } from 'react-router-dom';

function VehicleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 13h18v5a1 1 0 0 1-1 1h-1.5a2 2 0 0 1-4 0H9.5a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M5 13 6.4 7.8A2 2 0 0 1 8.3 6.5h7.4a2 2 0 0 1 1.9 1.3L19 13"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="7.5" cy="19" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="19" r="1.2" fill="currentColor" />
    </svg>
  );
}

function TourIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 14h3M13 14h3M8 17h8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function Layout({ role, children }) {
  const isAdmin = role === 'admin';

  return (
    <div className={`app-shell ${isAdmin ? 'with-sidebar admin-theme' : 'driver-theme'}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to={isAdmin ? '/admin' : '/driver'} className="brand">
            Tour Management
          </Link>
          <nav className="nav">
            {isAdmin ? (
              <NavLink to="/admin" end className="nav-tab dashboard">
                Dashboard
              </NavLink>
            ) : (
              <NavLink to="/driver" end className="nav-tab vehicles">
                Vehicles
              </NavLink>
            )}
          </nav>
          <span className={`role-badge ${isAdmin ? 'admin' : 'driver'}`}>
            {isAdmin ? 'Admin' : 'Driver'}
          </span>
        </div>
      </header>

      <div className="app-body">
        {isAdmin && (
          <aside className="side-pane">
            <p className="side-pane-label">Manage</p>
            <NavLink to="/admin/vehicles" className="side-link vehicles">
              <span className="side-link-icon">
                <VehicleIcon />
              </span>
              <span className="side-link-text">
                <strong>Vehicle management</strong>
                <small>Add, edit, or remove vehicles</small>
              </span>
            </NavLink>
            <NavLink to="/admin/tours" className="side-link tours">
              <span className="side-link-icon">
                <TourIcon />
              </span>
              <span className="side-link-text">
                <strong>Tour management</strong>
                <small>Create, edit, and assign tours</small>
              </span>
            </NavLink>
          </aside>
        )}
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
