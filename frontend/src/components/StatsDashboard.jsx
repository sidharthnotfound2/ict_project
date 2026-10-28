import React from 'react';
import { Clock, Star, Film, Eye, CheckCircle2, ListTodo } from 'lucide-react';

const StatsDashboard = ({ stats }) => {
  if (!stats) return null;

  const { statusCounts = {}, totalHoursWatched = 0, averageRating = 0, topWatchedGenre = null } = stats;

  return (
    <section className="stats-grid" aria-label="Watchlist Statistics">
      <div className="stat-card">
        <div className="stat-icon" style={{ color: '#fbbf24' }}>
          <ListTodo size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">To Watch</span>
          <span className="stat-value">{statusCounts['To Watch'] ?? 0}</span>
          <span className="stat-subtext">Pending in queue</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ color: '#38bdf8' }}>
          <Eye size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Watching</span>
          <span className="stat-value">{statusCounts['Watching'] ?? 0}</span>
          <span className="stat-subtext">Currently in progress</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ color: '#34d399' }}>
          <CheckCircle2 size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Watched</span>
          <span className="stat-value">{statusCounts['Watched'] ?? 0}</span>
          <span className="stat-subtext">Completed movies</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ color: '#a78bfa' }}>
          <Clock size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Hours Watched</span>
          <span className="stat-value">{totalHoursWatched} hrs</span>
          <span className="stat-subtext">Total runtime watched</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ color: '#f59e0b' }}>
          <Star size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Average Rating</span>
          <span className="stat-value">{averageRating ? `${averageRating} / 10` : 'N/A'}</span>
          <span className="stat-subtext">For finished movies</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ color: '#ec4899' }}>
          <Film size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Top Genre</span>
          <span className="stat-value">{topWatchedGenre || 'None'}</span>
          <span className="stat-subtext">Most watched genre</span>
        </div>
      </div>
    </section>
  );
};

export default StatsDashboard;
