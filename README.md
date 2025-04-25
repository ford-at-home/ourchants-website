[![Deploy OurChants via Makefile](https://github.com/<ORG>/<REPO>/actions/workflows/deploy.yml/badge.svg)](https://github.com/<ORG>/<REPO>/actions/workflows/deploy.yml)
# OurChants Website

A modern web application for exploring and listening to sacred chants, built with React and deployed on AWS.

## Features

- Browse and search through a collection of sacred chants
- Play audio files with a Spotify-like interface
- Share songs with timestamps
- Responsive design for all devices
- Progressive Web App capabilities

## Architecture

The application is built with:
- **Frontend**: React + TypeScript
- **Infrastructure**: AWS CDK (Python)
- **Hosting**: S3 + CloudFront
- **API**: API Gateway + Lambda
- **Security**: WAF + HTTPS

### Key Components

1. **Frontend**
   - React for UI
   - TypeScript for type safety
   - Vite for build tooling
   - PWA capabilities

2. **Infrastructure**
   - S3 for static hosting
   - CloudFront for CDN
   - API Gateway for backend
   - Route53 for DNS
   - ACM for SSL

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Python environment:
   ```bash
   cd infrastructure
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
4. Build the project:
   ```bash
   make build
   ```

## Development

- Run tests: `npm run test`
- Run linter: `npm run lint`
- Build project: `make build`
- Deploy changes: `make deploy`

## Project Structure

```
ourchants-website/
├── docs/              # Documentation
│   ├── DEPLOYMENT.md
│   ├── DEVELOPMENT.md
│   ├── API.md
│   └── CONTRIBUTING.md
├── infrastructure/    # CDK infrastructure code
│   ├── ourchants_stack.py
│   ├── domain_config.py
│   └── deploy-cdk.sh
├── scripts/          # Utility scripts
│   ├── bootstrap_domain.sh  # Domain setup verification
│   ├── deploy_frontend.sh   # Frontend deployment
│   ├── build-blog.ts        # Blog build process
│   ├── check_cloudfront.sh  # CloudFront status check
│   └── test-integration.ts  # Integration tests
├── data/            # Configuration and data files
│   ├── current-config.json
│   ├── distribution-config.json
│   └── other config files
├── logs/            # Log files
│   ├── mime_fix_*.log
│   └── cloudfront_debug_*.log
├── src/             # Frontend source code
├── dist/            # Built frontend files
├── cloudfront-config.json  # Main CloudFront config
├── s3-cors.json     # S3 CORS configuration
├── bucket-policy.json # S3 bucket policy
└── Makefile        # Build and deployment commands
```

## Documentation

- [Development Guide](docs/DEVELOPMENT.md) - Detailed development workflow
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [API Documentation](docs/API.md) - Backend API specifications
- [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute

## Blog Posts

The website includes a blog section where we share insights about sacred chants, cultural traditions, and spiritual practices. To add new blog posts:

1. Create a new markdown file in `src/content/blog/` using kebab-case naming (e.g., `my-new-post.md`)
2. Add the required frontmatter at the top of the file:
   ```markdown
   ---
   title: "Your Post Title"
   slug: "your-post-slug"
   date: "YYYY-MM-DD"
   summary: "A short summary of your post."
   published: true
   ---
   ```
3. Write your content using standard markdown syntax
4. Build the project as normal (`make build`) and the post will appear in the blog section

For more detailed instructions, see our [Blog Post Guide](BLOG.md).

## Related Resources

- [Live Site](https://ourchants.com) - See the application in action
- [Backend API](https://github.com/<ORG>/<REPO>-api) - Backend service implementation
- [Deployment Guide](docs/DEPLOYMENT.md) - For deployment and debugging instructions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
