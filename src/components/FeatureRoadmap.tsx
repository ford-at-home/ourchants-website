import React from 'react';
import { motion } from 'framer-motion';
import { Lock, UploadCloud, Edit3, MessageCircle, Users, Music, Heart, Globe, Github } from 'lucide-react';
import { cn } from '../lib/utils';

interface Feature {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  icon: React.ReactNode;
  issueUrl: string;
}

const roadmap: Feature[] = [
  {
    title: 'Playback',
    description: 'High-quality audio playback with controls and progress tracking.',
    status: 'completed',
    icon: <Music className="w-5 h-5 text-primary" />,
    issueUrl: 'https://github.com/ford-at-home/ourchants-website'
  },
  {
    title: 'Search',
    description: 'Find chants from around the world with advanced search capabilities.',
    status: 'completed',
    icon: <Globe className="w-5 h-5 text-primary" />,
    issueUrl: 'https://github.com/ford-at-home/ourchants-website'
  },
  {
    title: 'Login',
    description: 'Secure user authentication to personalize your chanting journey.',
    status: 'in-progress',
    icon: <Lock className="w-5 h-5 text-primary" />,
    issueUrl: 'https://github.com/ford-at-home/ourchants-website'
  },
  {
    title: 'Upload',
    description: 'Let the community grow—upload your own sacred chants.',
    status: 'planned',
    icon: <UploadCloud className="w-5 h-5 text-primary" />,
    issueUrl: 'https://github.com/ford-at-home/ourchants-website'
  },
  {
    title: 'Edit',
    description: 'Fine-tune chant details and metadata to keep the vibe accurate.',
    status: 'planned',
    icon: <Edit3 className="w-5 h-5 text-primary" />,
    issueUrl: 'https://github.com/ford-at-home/ourchants-website'
  },
  {
    title: 'Comments',
    description: 'Share your thoughts and connect with other chanters.',
    status: 'planned',
    icon: <MessageCircle className="w-5 h-5 text-primary" />,
    issueUrl: 'https://github.com/ford-at-home/ourchants-website'
  },
  {
    title: 'Groups',
    description: 'Create and join groups to share chants with specific communities.',
    status: 'planned',
    icon: <Users className="w-5 h-5 text-primary" />,
    issueUrl: 'https://github.com/ford-at-home/ourchants-website'
  },
  {
    title: 'Playlists',
    description: 'Curate your favorite chants into themed playlists.',
    status: 'planned',
    icon: <Music className="w-5 h-5 text-primary" />,
    issueUrl: 'https://github.com/ford-at-home/ourchants-website'
  },
  {
    title: 'Favorites',
    description: 'Save your most-loved chants for quick access.',
    status: 'planned',
    icon: <Heart className="w-5 h-5 text-primary" />,
    issueUrl: 'https://github.com/ford-at-home/ourchants-website'
  }
];

const statusColors = {
  completed: 'bg-primary text-primary-foreground',
  'in-progress': 'bg-yellow-500 text-yellow-900',
  planned: 'bg-muted text-muted-foreground'
};

const FeatureItem: React.FC<{ feature: Feature; index: number }> = ({ feature, index }) => (
  <motion.li
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="flex items-start gap-4 p-4 backdrop-blur-sm bg-secondary/50 hover:bg-secondary/70 transition-all duration-300 rounded-lg"
  >
    <div className="flex-shrink-0 mt-1">{feature.icon}</div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-lg font-semibold">{feature.title}</h3>
        <a 
          href={feature.issueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
          aria-label={`View ${feature.title} issue on GitHub`}
        >
          <Github className="w-4 h-4" />
        </a>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
      <span className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        statusColors[feature.status]
      )}>
        {feature.status === 'completed' ? 'Completed' :
         feature.status === 'in-progress' ? 'In Progress' : 'Planned'}
      </span>
    </div>
  </motion.li>
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
        
        <ul className="max-w-3xl mx-auto space-y-4">
          {roadmap.map((feature, index) => (
            <FeatureItem key={feature.title} feature={feature} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}; 