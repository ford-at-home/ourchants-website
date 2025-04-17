
import { MusicNotes } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-spotify-dark to-black pb-24">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <MusicNotes className="w-16 h-16 mx-auto text-spotify-green mb-6" />
          <h1 className="text-4xl font-bold text-white mb-6">About Sacred Chants</h1>
          <div className="space-y-6 text-spotify-lightgray">
            <p className="text-lg">
              Mellow Tune Hub is dedicated to preserving and sharing sacred indigenous chants 
              from diverse cultures around the world. These ancient melodies carry centuries 
              of wisdom, healing, and spiritual connection.
            </p>
            <p className="text-lg">
              Our mission is to create a respectful space where these sacred traditions can 
              be appreciated and studied, while honoring their cultural significance and origins.
            </p>
            <p className="text-lg">
              Each chant in our collection has been carefully documented with permission 
              from indigenous elders and knowledge keepers, ensuring that we maintain the 
              integrity and authenticity of these powerful spiritual expressions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
