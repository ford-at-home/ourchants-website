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
API_ENDPOINT=your_api_url
```

4. Start the development server:
```bash
make dev
```

## Available Commands

We use Make for common operations. Here are the available commands:

### Development
```bash
make install     # Install dependencies
make dev        # Start development server
make build      # Build the project
make lint       # Run linter
```

### Testing
```bash
make test       # Run unit tests
make test-build # Verify build
make test-all   # Run all tests (unit + build verification)
```

### Deployment
```bash
make setup-env  # Set up environment variables
make update-api # Update API configuration
make deploy-s3  # Deploy to S3
make configure-cors # Configure CORS for API Gateway
make deploy     # Full deployment (test + deploy)
make deploy-prod # Production deployment (includes CORS)
make boom      # Complete deployment process
```

### Infrastructure
```bash
make setup-infra # Set up AWS infrastructure
make clean      # Clean build files and dependencies
```

## Deployment Process

The deployment process is broken down into stages that can be run independently or as part of a complete deployment:

1. **Environment Setup** (`make setup-env`)
   - Verifies and sets up environment variables
   - Ensures API endpoint is configured

2. **API Configuration** (`make update-api`)
   - Updates the API client with the correct endpoint
   - Configures API request headers and methods

3. **Build and Test** (`make test-all`)
   - Runs unit tests
   - Verifies the build
   - Ensures code quality

4. **S3 Deployment** (`make deploy-s3`)
   - Builds the application
   - Syncs files to S3 bucket
   - Configures static website hosting

5. **CORS Configuration** (`make configure-cors`)
   - Configures API Gateway CORS settings
   - Updates deployment
   - Ensures frontend can communicate with API

### Complete Deployment Options

- `make deploy` - Basic deployment (tests + API update + S3)
- `make deploy-prod` - Production deployment (includes CORS configuration)
- `make boom` - Complete deployment (everything)

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
│   ├── deploy.sh      # Main infrastructure deployment script
│   └── lambda/        # Lambda function code
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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
