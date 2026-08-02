import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { formatDateRange } from '../utils/format';
import { resolveTourStatus } from '../utils/tourStatus';

function toursOnDay(tours, day) {
  return tours.filter((tour) => {
    const start = new Date(tour.startDate);
    const end = new Date(tour.endDate);
    return isWithinInterval(day, { start, end }) || isSameDay(day, start) || isSameDay(day, end);
  });
}

export default function TourCalendar({ tours, onSelectTour }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  const monthTours = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return tours.filter((tour) => {
      const start = new Date(tour.startDate);
      const end = new Date(tour.endDate);
      return start <= monthEnd && end >= monthStart;
    });
  }, [tours, currentMonth]);

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" className="btn ghost" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
          ←
        </button>
        <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
        <button type="button" className="btn ghost" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
          →
        </button>
      </div>

      <div className="calendar-legend">
        <span><i className="legend-dot scheduled" /> Scheduled</span>
        <span><i className="legend-dot ongoing" /> Ongoing</span>
        <span><i className="legend-dot payment_pending" /> Payment pending</span>
        <span><i className="legend-dot payment_received" /> Payment received</span>
      </div>

      <div className="calendar-weekdays">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day) => {
          const dayTours = toursOnDay(tours, day);
          const inMonth = isSameMonth(day, currentMonth);
          return (
            <div
              key={day.toISOString()}
              className={`calendar-day ${inMonth ? '' : 'outside'} ${
                dayTours.length ? 'has-tour' : ''
              } ${isToday(day) ? 'today' : ''}`}
            >
              <span className="day-num">{format(day, 'd')}</span>
              <div className="day-tours">
                {dayTours.slice(0, 2).map((tour) => (
                  <button
                    key={tour._id}
                    type="button"
                    className={`tour-pill ${resolveTourStatus(tour)}`}
                    title={`${tour.company || 'Tour'} · ${formatDateRange(tour.startDate, tour.endDate)}`}
                    onClick={() => onSelectTour(tour)}
                  >
                    {tour.tourNo || tour.company || 'Tour'}
                  </button>
                ))}
                {dayTours.length > 2 && (
                  <span className="more-tours">+{dayTours.length - 2}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {monthTours.length > 0 && (
        <div className="month-tour-list">
          <h3>Schedules this month</h3>
          <div className="month-tour-items">
            {monthTours.map((tour) => (
              <button
                key={tour._id}
                type="button"
                className={`month-tour-item ${resolveTourStatus(tour)}`}
                onClick={() => onSelectTour(tour)}
              >
                <span className="month-tour-dates">
                  {formatDateRange(tour.startDate, tour.endDate)}
                </span>
                <span className="month-tour-name">
                  {tour.tourNo || tour.company || 'Untitled tour'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!tours.length && (
        <div className="empty-state calendar-empty">
          <p>No tours assigned to this vehicle yet.</p>
        </div>
      )}
    </div>
  );
}
