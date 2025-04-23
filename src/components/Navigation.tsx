import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Info, ClipboardList } from 'lucide-react';

const Navigation: React.FC = () => {
  return (
    <nav className="spotify-sidebar">
      <div className="container mx-auto flex flex-col space-y-4">
        <Link to="/" className="spotify-nav-item flex items-center space-x-2">
          <Home className="w-5 h-5" />
          <span>Songs</span>
        </Link>
        <Link to="/about" className="spotify-nav-item flex items-center space-x-2">
          <Info className="w-5 h-5" />
          <span>About</span>
        </Link>
        <Link to="/survey" className="spotify-nav-item flex items-center space-x-2">
          <ClipboardList className="w-5 h-5" />
          <span>Survey</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation; 