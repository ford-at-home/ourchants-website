# OurChants Website

A modern web application for exploring and listening to sacred chants, built with React and deployed on AWS.

## Features

- Browse and search through a collection of sacred chants
- Play audio files with a Spotify-like interface
- Share songs with timestamps
- Responsive design for all devices
- Progressive Web App capabilities

## Infrastructure

The application is deployed on AWS using:
- S3 for static website hosting
- CloudFront for global content delivery
- WAF for security
- API Gateway for backend services

### CloudFront Distribution

The site is served through a CloudFront distribution with the following configuration:
- S3 REST endpoint as origin
- HTTPS-only access
- SPA routing support
- Global edge locations
- WAF protection

Access the site at: `https://d21wmvl5q9ujuy.cloudfront.net`

## Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- AWS CLI configured
- CDK CLI installed

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Python virtual environment:
   ```bash
   cd infrastructure
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

### Running Locally

```bash
npm run dev
```

### Deployment

Deploy the infrastructure:
```bash
make cdk
```

Deploy the frontend:
```bash
make deploy
```

## Documentation

- [Development Guide](DEVELOPMENT.md)
- [CloudFront Specification](SPEC_CD.md)
- [API Documentation](API.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
