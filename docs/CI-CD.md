# CI/CD Pipeline Documentation

This document explains the automated CI/CD pipeline for the Remove Emojis VS Code extension.

## Overview

The project uses GitHub Actions for continuous integration and deployment with the following features:

- **Automated Testing**: Multi-platform testing on Ubuntu, Windows, and macOS
- **Security Audits**: Automated vulnerability scanning
- **Auto-versioning**: Automatic version bumping and tagging
- **Automated Publishing**: Direct publishing to VS Code Marketplace and Open VSX Registry
- **Release Management**: Automatic GitHub release creation with VSIX files

## Workflow Jobs

### 1. Test Job
- **Trigger**: All pushes and pull requests
- **Platforms**: Ubuntu, Windows, macOS
- **Node.js Versions**: 22.x, 24.x
- **Actions**:
  - Install dependencies with pnpm
  - Run linting with ESLint
  - Check TypeScript types
  - Compile the extension
  - Run tests with VS Code Test

### 2. Security Job
- **Trigger**: All pushes and pull requests
- **Platform**: Ubuntu
- **Node.js Versions**: 22.x, 24.x
- **Actions**:
  - Run security audit with `pnpm audit`
  - Fail on moderate or higher severity issues

### 3. Build Job
- **Trigger**: After successful test and security jobs
- **Platform**: Ubuntu
- **Actions**:
  - Build and package the extension
  - Create VSIX file
  - Upload as artifact for later use

### 4. Version and Tag Job
- **Trigger**: Only on main branch pushes (not PRs)
- **Actions**:
  - Automatically bump version (patch by default)
  - Update package.json
  - Create git commit and tag
  - Push changes to repository

### 5. Publish Job
- **Trigger**: On tag pushes or manual workflow dispatch
- **Actions**:
  - Publish to VS Code Marketplace
  - Publish to Open VSX Registry (optional)

### 6. Release Job
- **Trigger**: On tag pushes
- **Actions**:
  - Create GitHub release
  - Attach VSIX file
  - Generate release notes

## Release Process

### Automatic Release (Recommended)

1. **Push to main branch**: Automatically triggers a patch version bump and creates a new tag
2. **Manual workflow dispatch**: 
   - Go to Actions tab in GitHub
   - Select "CI/CD Pipeline" workflow
   - Click "Run workflow"
   - Choose version bump type:
     - `patch` (default) - for bug fixes
     - `minor` - for new features
     - `major` - for breaking changes

### Manual Release

Use the provided release script:

```bash
# Patch release (bug fixes)
pnpm run release:patch

# Minor release (new features)
pnpm run release:minor

# Major release (breaking changes)
pnpm run release:major
```

The script will:
1. Bump version in package.json
2. Run all tests and linting
3. Build the extension
4. Create git commit and tag
5. Provide push instructions

## Required Secrets

Configure these secrets in your GitHub repository settings:

### VSCE_PAT
VS Code Marketplace Personal Access Token for publishing extensions.

**How to get it:**
1. Go to https://dev.azure.com
2. Sign in with your Microsoft account
3. Go to Personal Access Tokens
4. Create a new token with "Marketplace (Publish)" scope
5. Copy the token and add it as `VSCE_PAT` secret

### OVSX_PAT (Optional)
Open VSX Registry Personal Access Token for publishing to Open VSX.

**How to get it:**
1. Go to https://open-vsx.org
2. Sign in with your GitHub account
3. Go to your profile settings
4. Create a new Personal Access Token
5. Copy the token and add it as `OVSX_PAT` secret

## Version Management

The project follows semantic versioning (SemVer):

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, backward compatible

### Automatic Version Bumping

- **Main branch push**: Automatic patch bump
- **Manual workflow**: Choose bump type
- **Tag push**: Use version from tag

## Troubleshooting

### Common Issues

1. **Build fails on Windows/macOS**: Check if all dependencies are compatible
2. **Security audit fails**: Update dependencies or review security issues
3. **Publish fails**: Verify VSCE_PAT secret is correct and has proper permissions
4. **Release creation fails**: Check GITHUB_TOKEN permissions

### Debugging

- Check GitHub Actions logs for detailed error messages
- Verify all required secrets are configured
- Ensure package.json version format is correct
- Check if git tags are properly formatted (v1.0.0)

## Best Practices

1. **Always test locally** before pushing to main
2. **Use meaningful commit messages** for better release notes
3. **Update CHANGELOG.md** before releases
4. **Test on multiple platforms** locally when possible
5. **Review security audit results** regularly
6. **Use semantic versioning** appropriately

## Migration from Manual Releases

If migrating from manual releases:

1. Update your local repository
2. Configure required secrets
3. Test the workflow with a small change
4. Update your release process documentation
5. Consider using the release script for local testing 