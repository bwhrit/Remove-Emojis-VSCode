# Change Log

All notable changes to the "Remove Emojis" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added
- Automated CI/CD pipeline with GitHub Actions
- Auto-versioning and release management
- Security audit integration
- Multi-platform testing (Ubuntu, Windows, macOS)
- Automated publishing to VS Code Marketplace and Open VSX Registry

### Changed
- Updated to pnpm 10.13.1
- Enhanced build process with better error handling

## [1.0.0] - 2025-01-18

### Added
- Initial release of Remove Emojis extension
- Comprehensive emoji detection supporting all Unicode emoji ranges
- Multiple file selection options:
  - Remove from current file
  - Remove from selected files
  - Remove from folder (non-recursive)
  - Remove from folder (recursive)
- Smart formatting preservation
- Preview mode to see changes before applying
- Progress indicators for large operations
- Context menu integration in editor and explorer
- Configurable exclusion patterns
- Support for all text-based file formats
- Automatic binary file detection and skipping