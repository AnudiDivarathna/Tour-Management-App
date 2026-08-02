import { Link } from 'react-router-dom';
import { ArrowRightIcon, BusIcon, CoachIcon, TrashIcon, VanIcon } from './icons';
import { vehicleTypeLabel } from '../utils/format';

const TYPE_ICONS = {
  van: VanIcon,
  long_coach: CoachIcon,
  bus: BusIcon,
};

export default function VehicleList({ vehicles, basePath, loading, error, onDelete }) {
  if (loading) {
    return (
      <div className="card-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="vehicle-card skeleton" />
        ))}
      </div>
    );
  }

  if (error) return <p className="error">{error}</p>;

  if (!vehicles.length) {
    return (
      <div className="empty-state">
        <BusIcon className="empty-icon" />
        <p>No vehicles yet.</p>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {vehicles.map((v) => {
        const Icon = TYPE_ICONS[v.type] || BusIcon;
        return (
          <div key={v._id} className={`vehicle-card ${v.type}${onDelete ? ' has-actions' : ''}`}>
            {onDelete && (
              <button
                type="button"
                className="icon-btn danger vehicle-delete"
                title="Delete vehicle"
                aria-label={`Delete ${v.numberPlate}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(v._id);
                }}
              >
                <TrashIcon />
              </button>
            )}
            <Link to={`${basePath}/${v._id}/calendar`} className="vehicle-card-link">
              <span className="vehicle-card-top">
                <span className="vehicle-icon">
                  <Icon />
                </span>
                <span className={`type-chip ${v.type}`}>{vehicleTypeLabel(v.type)}</span>
              </span>
              <span className="plate">{v.numberPlate}</span>
              <span className="vehicle-card-cta">
                View calendar
                <ArrowRightIcon className="cta-arrow" />
              </span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
