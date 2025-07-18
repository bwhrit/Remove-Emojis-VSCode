# Contributing to Remove Emojis

Thank you for your interest in contributing to the Remove Emojis VS Code extension! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please note that this project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, please include:

- A clear and descriptive title
- Exact steps to reproduce the problem
- Expected vs actual behavior
- VS Code and extension versions
- Sample files that demonstrate the issue

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:

- Use a clear and descriptive title
- Provide a detailed description of the proposed feature
- Explain why this enhancement would be useful
- Include examples of how it would work

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `pnpm install`
3. **Make your changes** following our coding standards
4. **Add tests** for your changes
5. **Run tests**: `pnpm test`
6. **Run linting**: `pnpm run lint`
7. **Update documentation** if needed
8. **Commit your changes** using descriptive commit messages
9. **Push to your fork** and submit a pull request

## Development Setup

1. **Prerequisites**:
   - Node.js 18+ 
   - pnpm (`npm install -g pnpm`)
   - VS Code

2. **Clone and install**:
   ```bash
   git clone https://github.com/your-username/remove-emojis.git
   cd remove-emojis
   pnpm install
   ```

3. **Development workflow**:
   ```bash
   # Run in watch mode
   pnpm run watch
   
   # Open VS Code
   code .
   
   # Press F5 to launch extension in debug mode
   ```

## Coding Standards

### TypeScript Guidelines

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Testing

- Write tests for all new features
- Maintain test coverage above 80%
- Test edge cases and error conditions
- Use descriptive test names

### Commit Messages

Follow conventional commits format:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

Example: `feat: add support for custom emoji patterns`

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a pull request
4. After merge, create a tag: `git tag v0.0.2`
5. Push tag: `git push origin v0.0.2`
6. CI/CD will handle the rest

## Questions?

Feel free to open an issue or start a discussion if you have questions!