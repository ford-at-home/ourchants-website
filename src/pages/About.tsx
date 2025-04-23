import React, { useEffect } from 'react';
import { Music, Heart, Globe, Users, ArrowRight, Github, History } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { FeatureRoadmap } from "../components/FeatureRoadmap";

const About: React.FC = () => {
  useEffect(() => {
    console.log('About page rendered');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/20">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-blue-500/30 to-green-500/20 z-10" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center px-4"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 text-white drop-shadow-lg">
            About OurChants
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-md px-4">
            Join us in creating a world where voices unite in harmony
          </p>
        </motion.div>
      </div>

      {/* Mission Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="container mx-auto px-4 py-8 md:py-16"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Our Mission</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed px-2">
            We are all about singing together: making it easy to learn and share circle songs; 
            to join hearts and raise our vibration for a healthier, more compassionate, 
            loving, thriving planet Earth.
          </p>
        </div>
      </motion.div>

      {/* Feature Roadmap Section */}
      <FeatureRoadmap />

      {/* Site Features Section */}
      <div className="bg-secondary/30 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12"
          >
            Site Features
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
            <motion.a
              href="https://github.com/ford-at-home/ourchants-website"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="spotify-card text-center p-4 md:p-6 backdrop-blur-sm bg-secondary/50 hover:bg-secondary/70 transition-all duration-300"
            >
              <Github className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-primary" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Frontend Code</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                View the source code for this website
              </p>
            </motion.a>

            <motion.a
              href="https://github.com/ford-at-home/ourchants-api"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              className="spotify-card text-center p-4 md:p-6 backdrop-blur-sm bg-secondary/50 hover:bg-secondary/70 transition-all duration-300"
            >
              <Github className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-primary" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Backend Code</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                View the API source code
              </p>
            </motion.a>

            <motion.a
              href="https://ourchants.org"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              whileHover={{ scale: 1.05 }}
              className="spotify-card text-center p-4 md:p-6 backdrop-blur-sm bg-secondary/50 hover:bg-secondary/70 transition-all duration-300 sm:col-span-2 md:col-span-1"
            >
              <History className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-primary" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Legacy App</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Visit the original OurChants website
              </p>
            </motion.a>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="container mx-auto px-4 py-8 md:py-16"
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Join Our Journey</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 px-2">
            Be part of our growing community of chanters and music lovers
          </p>
          <Button className="spotify-button group hover:scale-105 transition-transform duration-300 text-base md:text-lg px-6 py-3">
            Explore Songs
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </motion.div>

      {/* Footer Note */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="container mx-auto px-4 py-6 md:py-8 text-center"
      >
        <p className="text-sm md:text-base text-muted-foreground">
          Our song forest is open for browsing. Thanks for your input!
        </p>
      </motion.div>
    </div>
  );
};

export default About;
