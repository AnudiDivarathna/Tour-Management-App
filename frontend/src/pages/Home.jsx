import { Link } from 'react-router-dom';
import { ArrowRightIcon, BusIcon, CalendarIcon } from '../components/icons';

export default function Home() {
  return (
    <div className="home-gate">
      <div className="home-card">
        <h1>Tour Management</h1>
        <p className="muted">Choose a view to continue. No login required.</p>

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
      </div>
    </div>
  );
}
