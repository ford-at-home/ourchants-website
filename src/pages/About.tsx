import React from 'react';
import { Music } from "lucide-react";

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About OurChants</h1>
      <div className="prose prose-invert max-w-none">
        <p className="text-lg mb-4">
          We are all about singing together: making it easy to learn and share circle songs; to join hearts and raise our vibration for a healthier, more compassionate, loving, thriving planet Earth.
        </p>
        <p className="text-lg mb-4">
          Our song forest is open for browsing.
        </p>
        <p className="text-lg">
          Thanks for your input!
        </p>
      </div>
    </div>
  );
};

export default About;
