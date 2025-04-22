# Contributing to OurChants

Thank you for your interest in contributing to OurChants! This document provides guidelines and instructions for contributing.

## Development Workflow

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/ourchants-website.git
   cd ourchants-website
   ```

2. **Set Up Environment**
   ```bash
   # Install dependencies
   npm install

   # Set up Python environment
   cd infrastructure
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes**
   - Follow the code style guidelines
   - Write tests for new features
   - Update documentation as needed

5. **Test Changes**
   ```bash
   # Run tests
   npm run test

   # Run linter
   npm run lint

   # Build project
   make build
   ```

6. **Submit Pull Request**
   - Create a PR from your feature branch
   - Include a clear description of changes
   - Reference any related issues

## Code Style

### TypeScript/React
- Use TypeScript for type safety
- Follow React best practices
- Use functional components
- Implement proper error handling
- Add comments for complex logic

### Python (CDK)
- Follow PEP 8 style guide
- Use type hints
- Document functions and classes
- Keep functions small and focused

## Testing

### Frontend Tests
- Write unit tests for components
- Test error cases
- Mock API calls
- Test responsive design

### Infrastructure Tests
- Test CDK constructs
- Verify resource configurations
- Test error handling
- Validate security settings

## Documentation

- Update README.md for major changes
- Document new features
- Update API documentation
- Add comments to complex code

## Pull Request Process

1. **Before Submitting**
   - Run all tests
   - Check linting
   - Update documentation
   - Test in different browsers

2. **PR Description**
   - Describe changes
   - Link related issues
   - Include screenshots if UI changes
   - List any breaking changes

3. **Review Process**
   - Address review comments
   - Keep PR focused and small
   - Update PR as needed

## Infrastructure Changes

When making infrastructure changes:
1. Test changes locally
2. Review CloudFormation template
3. Check security implications
4. Update deployment documentation

## Questions?

Feel free to:
- Open an issue
- Contact the maintainers
- Check existing documentation 