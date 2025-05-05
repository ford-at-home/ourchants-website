[![Deploy OurChants via Makefile](https://github.com/<ORG>/<REPO>/actions/workflows/deploy.yml/badge.svg)](https://github.com/<ORG>/<REPO>/actions/workflows/deploy.yml)
# OurChants Website

A modern web application for exploring and listening to sacred chants, built with React and deployed on AWS.

## Features

- Browse and search through a collection of sacred chants
- Play audio files with a Spotify-like interface
- Share songs with timestamps
- Responsive design for all devices
- Progressive Web App capabilities
- Advanced audio playback controls (play, pause, skip, loop modes)
- Resume playback from last position
- Deep linking and URL sharing

## Technical Architecture

### Frontend Architecture

The application is built with a modern React stack:
- **Core**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: 
  - React Context for global audio state
  - React Query for server state
  - Local state for component-specific data
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Testing**: Vitest + React Testing Library

### Key Technical Features

1. **Audio Playback System**
   - Sophisticated audio state management
   - Multiple playback modes (normal, loop one, loop all)
   - Progress tracking and resume functionality
   - Error handling and recovery
   - Cross-browser compatibility

2. **State Management**
   ```typescript
   interface AudioContextType {
     selectedSong: Song | null;
     setSelectedSong: (song: Song | null) => void;
     shouldPlay: boolean;
     setShouldPlay: (shouldPlay: boolean) => void;
     handlePlay: () => void;
     handlePause: () => void;
     handleSkipNext: () => void;
     handleSkipPrevious: () => void;
   }
   ```

3. **API Integration**
   - RESTful API integration with AWS services
   - Presigned URL generation for secure audio access
   - Error handling and retry logic
   - Caching and data invalidation

### Infrastructure

The application is deployed on AWS:
- **Frontend Hosting**: S3 + CloudFront
- **API Layer**: API Gateway + Lambda
- **Security**: WAF + HTTPS
- **CDN**: CloudFront for global distribution
- **DNS**: Route53
- **SSL**: ACM

## Development Setup

1. **Prerequisites**
   - Node.js >= 20.0.0
   - Python 3.x (for infrastructure)
   - AWS CLI configured

2. **Installation**
   ```bash
   # Install dependencies
   npm install

   # Set up Python environment
   cd infrastructure
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Development Commands**
   ```bash
   # Start development server
   npm run dev

   # Run tests
   npm run test
   npm run test:watch

   # Lint code
   npm run lint

   # Build project
   make build
   ```

## Project Structure

```
ourchants-website/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API and external service integrations
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript type definitions
│   └── __tests__/     # Test files
├── infrastructure/    # CDK infrastructure code
├── scripts/          # Utility scripts
├── docs/             # Documentation
└── public/           # Static assets
```

## Key Components

### Audio Player
The application features a sophisticated audio player with:
- Play/pause controls
- Skip next/previous functionality
- Volume control
- Progress tracking
- Loop modes (off, all, one)
- Error handling and recovery
- URL sharing with timestamps

### State Management
- Global audio context for playback control
- React Query for server state
- Local state for UI components
- Memoization for performance optimization

### Error Handling
- Comprehensive error boundaries
- Retry logic for failed operations
- User-friendly error messages
- Graceful degradation

## Testing Strategy

The application includes:
- Unit tests for components
- Integration tests for audio playback
- Error state testing
- Edge case handling
- Accessibility testing

## Performance Optimizations

1. **Code Splitting**
   - Route-based code splitting
   - Lazy loading of components

2. **Caching**
   - React Query for data caching
   - Browser caching for static assets

3. **Resource Management**
   - Proper cleanup of audio resources
   - Memory leak prevention

## Security Considerations

1. **Audio Access**
   - Presigned URLs for secure audio access
   - S3 URI validation
   - Cross-origin resource sharing

2. **API Security**
   - HTTPS enforcement
   - WAF protection
   - Rate limiting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Resources

- [Live Site](https://ourchants.com)
- [Backend API](https://github.com/<ORG>/<REPO>-api)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [API Documentation](docs/API.md)
- [Contributing Guide](docs/CONTRIBUTING.md)
