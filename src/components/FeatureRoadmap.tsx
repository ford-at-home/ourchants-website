import React from 'react';
import { motion } from 'framer-motion';
import { Lock, UploadCloud, Edit3, MessageCircle, Users, Music, Heart, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

interface Feature {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  icon: React.ReactNode;
}

const roadmap: Feature[] = [
  {
    title: 'Login',
    description: 'Secure user authentication to personalize your chanting journey.',
    status: 'completed',
    icon: <Lock className="w-8 h-8 text-primary" />
  },
  {
    title: 'Upload',
    description: 'Let the community grow—upload your own sacred chants.',
    status: 'in-progress',
    icon: <UploadCloud className="w-8 h-8 text-primary" />
  },
  {
    title: 'Edit',
    description: 'Fine-tune chant details and metadata to keep the vibe accurate.',
    status: 'planned',
    icon: <Edit3 className="w-8 h-8 text-primary" />
  },
  {
    title: 'Comments',
    description: 'Share your thoughts and connect with other chanters.',
    status: 'planned',
    icon: <MessageCircle className="w-8 h-8 text-primary" />
  },
  {
    title: 'Groups',
    description: 'Create and join groups to share chants with specific communities.',
    status: 'planned',
    icon: <Users className="w-8 h-8 text-primary" />
  },
  {
    title: 'Playlists',
    description: 'Curate your favorite chants into themed playlists.',
    status: 'planned',
    icon: <Music className="w-8 h-8 text-primary" />
  },
  {
    title: 'Favorites',
    description: 'Save your most-loved chants for quick access.',
    status: 'planned',
    icon: <Heart className="w-8 h-8 text-primary" />
  },
  {
    title: 'Global Search',
    description: 'Find chants from around the world with advanced search.',
    status: 'planned',
    icon: <Globe className="w-8 h-8 text-primary" />
  }
];

const statusColors = {
  completed: 'bg-primary text-primary-foreground',
  'in-progress': 'bg-yellow-500 text-yellow-900',
  planned: 'bg-muted text-muted-foreground'
};

const FeatureCard: React.FC<{ feature: Feature; index: number }> = ({ feature, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="spotify-card p-4 md:p-6 backdrop-blur-sm bg-secondary/50 hover:bg-secondary/70 transition-all duration-300"
  >
    <div className="mb-4">{feature.icon}</div>
    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
    <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
    <span className={cn(
      'px-2 py-1 rounded-full text-xs font-medium',
      statusColors[feature.status]
    )}>
      {feature.status === 'completed' ? 'Completed' :
       feature.status === 'in-progress' ? 'In Progress' : 'Planned'}
    </span>
  </motion.div>
);

export const FeatureRoadmap: React.FC = () => {
  return (
    <section className="bg-secondary/30 py-8 md:py-16">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12"
        >
          Feature Roadmap
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {roadmap.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}; 