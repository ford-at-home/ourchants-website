# OurChants

A platform for making it easy to learn and share circle songs, joining hearts and raising our vibration for a healthier, more compassionate, loving, thriving planet Earth.

## Project Overview

OurChants is a web application dedicated to preserving and sharing sacred songs. Our song forest is open for browsing, providing a respectful and accessible way to experience these cultural treasures.

## Features

- Browse and search songs
- Play audio recordings with a Spotify-inspired interface
- View detailed information about each song
- Responsive design for all devices
- Blog section for updates and community engagement

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
  - S3 for static hosting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- AWS CLI configured with appropriate credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ourchants-app.git
cd ourchants-app
```

2. Install dependencies:
```bash
make install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_API_URL=your_api_url
```

4. Start the development server:
```bash
make dev
```

## Available Commands

We use Make for common operations. Here are the available commands:

```bash
make install     # Install dependencies
make dev        # Start development server
make build      # Build the project
make lint       # Run linter
make deploy     # Build and deploy to S3
make setup-infra # Set up AWS infrastructure
make clean      # Clean build files and dependencies
```

## Project Structure

```
ourchants-app/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── pages/          # Page components
│   └── content/        # Blog posts and static content
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
