import React from 'react';
import { Music, Heart, Globe, Users, ArrowRight, Github, History } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/20">
      {/* Hero Section */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-blue-500/30 to-green-500/20 z-10" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
            About OurChants
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Join us in creating a world where voices unite in harmony
          </p>
        </motion.div>
      </div>

      {/* Mission Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are all about singing together: making it easy to learn and share circle songs; 
            to join hearts and raise our vibration for a healthier, more compassionate, 
            loving, thriving planet Earth.
          </p>
        </div>
      </motion.div>

      {/* Site Features Section */}
      <div className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            Site Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.a
              href="https://github.com/ford-at-home/ourchants-website"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="spotify-card text-center p-6 backdrop-blur-sm bg-secondary/50 hover:bg-secondary/70 transition-all duration-300"
            >
              <Github className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Frontend Code</h3>
              <p className="text-muted-foreground">
                View the source code for this website
              </p>
            </motion.a>

            <motion.a
              href="https://github.com/ford-at-home/ourchants-api"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="spotify-card text-center p-6 backdrop-blur-sm bg-secondary/50 hover:bg-secondary/70 transition-all duration-300"
            >
              <Github className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Backend Code</h3>
              <p className="text-muted-foreground">
                View the API source code
              </p>
            </motion.a>

            <motion.a
              href="https://ourchants.org"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="spotify-card text-center p-6 backdrop-blur-sm bg-secondary/50 hover:bg-secondary/70 transition-all duration-300"
            >
              <History className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Legacy App</h3>
              <p className="text-muted-foreground">
                Visit the original OurChants website
              </p>
            </motion.a>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Journey</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Be part of our growing community of chanters and music lovers
          </p>
          <Button className="spotify-button group hover:scale-105 transition-transform duration-300">
            Explore Songs
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </motion.div>

      {/* Footer Note */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 py-8 text-center"
      >
        <p className="text-muted-foreground">
          Our song forest is open for browsing. Thanks for your input!
        </p>
      </motion.div>
    </div>
  );
};

export default About;
