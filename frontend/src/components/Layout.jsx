import { Link, NavLink, useNavigate } from 'react-router-dom';
import BrandMark from './BrandMark';
import { useAuth } from '../auth';

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

function CompanyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20V8.5A1.5 1.5 0 0 1 5.5 7H10v13H4Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M10 20V4.5A1.5 1.5 0 0 1 11.5 3h7A1.5 1.5 0 0 1 20 4.5V20"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M13 7h3M13 10h3M13 13h3M6.5 11H8M6.5 14H8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 19.5c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 5.5a2.8 2.8 0 0 1 0 5.4M17.5 14.6c2 .6 3.2 2.1 3.2 4.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const ADMIN_LINKS = [
  { to: '/admin', end: true, label: 'Dashboard', Icon: DashboardIcon, className: 'dashboard' },
  { to: '/admin/vehicles', label: 'Vehicles', Icon: VehicleIcon, className: 'vehicles', hint: 'Add, edit, or remove vehicles' },
  { to: '/admin/companies', label: 'Companies', Icon: CompanyIcon, className: 'companies', hint: 'Add company names for tours' },
  { to: '/admin/tours', label: 'Tours', Icon: TourIcon, className: 'tours', hint: 'Create, edit, and assign trips' },
  { to: '/admin/users', label: 'Users', Icon: UsersIcon, className: 'users', hint: 'Add admins and drivers' },
];

export default function Layout({ role, children }) {
  const isAdmin = role === 'admin';
  const navigate = useNavigate();
  const { user, isAdmin: canSwitchViews, signOut } = useAuth();

  function handleSignOut() {
    signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className={`app-shell ${isAdmin ? 'with-sidebar admin-theme' : 'driver-theme'}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to={isAdmin ? '/admin' : '/driver'} className="brand">
            <BrandMark size="sm" />
          </Link>
          <nav className="nav">
            {isAdmin ? (
              <NavLink to="/admin" end className="nav-tab dashboard topbar-dashboard">
                Dashboard
              </NavLink>
            ) : (
              <NavLink to="/driver" end className="nav-tab vehicles">
                Vehicles
              </NavLink>
            )}
          </nav>
          <div className="topbar-user">
            {canSwitchViews && (
              <Link to="/" className="nav-tab switch-view">
                Switch view
              </Link>
            )}
            <span className={`role-badge ${isAdmin ? 'admin' : 'driver'}`}>
              {user?.name || (isAdmin ? 'Admin' : 'Driver')}
            </span>
            <button type="button" className="btn ghost signout-btn" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>

        {isAdmin && (
          <nav className="admin-menubar" aria-label="Admin menu">
            {ADMIN_LINKS.map(({ to, end, label, Icon, className }) => (
              <NavLink key={to} to={to} end={end} className={`menu-item ${className}`}>
                <Icon />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <div className="app-body">
        {isAdmin && (
          <aside className="side-pane">
            <p className="side-pane-label">Manage</p>
            {ADMIN_LINKS.filter((link) => link.to !== '/admin').map(
              ({ to, label, Icon, className, hint }) => (
                <NavLink key={to} to={to} className={`side-link ${className}`}>
                  <span className="side-link-icon">
                    <Icon />
                  </span>
                  <span className="side-link-text">
                    <strong>{label}</strong>
                    <small>{hint}</small>
                  </span>
                </NavLink>
              )
            )}
          </aside>
        )}
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
