# OurChants

A platform for preserving and sharing sacred indigenous chants from various cultures.

## Project Overview

OurChants is a web application dedicated to preserving and sharing sacred indigenous chants while maintaining their cultural significance and authenticity. The platform provides a respectful and accessible way to experience these cultural treasures.

## Features

- Browse and search sacred chants
- Play audio recordings with a Spotify-inspired interface
- View detailed information about each chant
- Learn about the cultural significance and history
- Responsive design for all devices

## Tech Stack

- **Frontend**: 
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
  - shadcn/ui components
- **Backend**:
  - AWS API Gateway
  - AWS Lambda
  - DynamoDB
  - S3

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ourchants-app.git
cd ourchants-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_API_URL=your_api_url
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
ourchants-app/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   └── pages/          # Page components
├── infrastructure/     # AWS CDK infrastructure
├── public/            # Static assets
└── dist/              # Build output
```

## Documentation

- [API Specification](SPECIFICATION.md)
- [Infrastructure Documentation](infrastructure/README.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
