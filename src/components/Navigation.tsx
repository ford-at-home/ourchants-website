import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Info, ClipboardList } from 'lucide-react';

const Navigation: React.FC = () => {
  return (
    <nav className="bg-spotify-darkgray text-white p-4">
      <div className="container mx-auto flex justify-center space-x-8">
        <Link to="/" className="flex items-center space-x-2 hover:text-spotify-green transition-colors">
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link to="/about" className="flex items-center space-x-2 hover:text-spotify-green transition-colors">
          <Info className="w-5 h-5" />
          <span>About</span>
        </Link>
        <Link to="/survey" className="flex items-center space-x-2 hover:text-spotify-green transition-colors">
          <ClipboardList className="w-5 h-5" />
          <span>Survey</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation; 