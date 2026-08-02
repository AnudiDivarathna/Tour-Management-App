import { Link, Navigate, useNavigate } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import { ArrowRightIcon, BusIcon, CalendarIcon } from '../components/icons';
import { useAuth } from '../auth';

export default function Home() {
  const navigate = useNavigate();
  const { isAdmin, signOut } = useAuth();

  if (!isAdmin) return <Navigate to="/driver" replace />;

  function handleSignOut() {
    signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="home-gate gate-home">
      <div className="home-card">
        <BrandMark size="lg" />
        <p className="muted gate-lead">Choose a view to continue.</p>

        <div className="home-options">
          <Link to="/admin" className="home-option admin">
            <span className="home-option-icon">
              <CalendarIcon />
            </span>
            <span className="home-option-text">
              <strong>Admin view</strong>
              <small>Manage vehicles, tours, and finances</small>
            </span>
            <ArrowRightIcon className="cta-arrow" />
          </Link>

          <Link to="/driver" className="home-option driver">
            <span className="home-option-icon">
              <BusIcon />
            </span>
            <span className="home-option-text">
              <strong>Driver view</strong>
              <small>View schedules and record bills</small>
            </span>
            <ArrowRightIcon className="cta-arrow" />
          </Link>
        </div>

        <button type="button" className="btn ghost home-signout" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}
