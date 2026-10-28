import React from 'react';
import { Clapperboard, Plus, Sparkles } from 'lucide-react';

const Navbar = ({ onOpenAddModal, onOpenWatchNextModal }) => {
  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-icon">🎬</span>
        <div>
          <h1 className="brand-title">Movie Watchlist Manager</h1>
          <p className="brand-subtitle">Plan, track, and rate your favourite movies</p>
        </div>
      </div>
      <div className="nav-actions">
        <button
          className="btn btn-watch-next"
          onClick={onOpenWatchNextModal}
          id="btn-watch-next"
        >
          <Sparkles size={16} />
          What should I watch next?
        </button>
        <button
          className="btn btn-primary"
          onClick={onOpenAddModal}
          id="btn-add-movie"
        >
          <Plus size={16} />
          Add Movie
        </button>
      </div>
    </header>
  );
};

export default Navbar;
