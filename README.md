# Remove Emojis - VS Code Extension

A powerful VS Code extension that removes emojis and emoticons from any type of file while preserving the original formatting.

## Features

- **Comprehensive Emoji Detection**: Detects and removes all Unicode emojis including:
  - Standard emoticons
  - Symbols and pictographs
  - Flags and regional indicators
  - Skin tone modifiers
  - Zero-width joiner sequences
  - Combined emoji sequences

- **Multiple Selection Options**:
  - Remove from current file
  - Remove from selected files
  - Remove from folder (non-recursive)
  - Remove from folder (recursive with subdirectories)
  - Preview changes before applying

- **Smart Formatting Preservation**:
  - Maintains exact file formatting
  - Intelligently handles spaces around removed emojis
  - Preserves line breaks and indentation
  - Supports all text encodings

- **File Type Support**:
  - Works with any text-based file format
  - Automatically skips binary files
  - Configurable exclusion patterns

## Usage

### Smart Command
The extension now uses a single intelligent command that adapts to your context:

- **`Remove Emojis`** - Automatically detects what you want to process:
  - Current file (if editor is active)
  - Selected files/folders (if selected in explorer)
  - Specific file/folder (if right-clicked)
  - File picker (if no context available)

### Quick Preview
- **`Preview Emoji Removal`** - Quickly preview changes for the current file

### Context Menu
- **Editor**: Right-click in any open file for emoji removal options
- **Explorer**: Right-click on files or folders to process them

### Smart Features
- **Context Detection**: Automatically understands what you want to process
- **Confirmation Dialogs**: Safe operation with preview options
- **Progress Feedback**: Real-time progress with cancellable operations
- **Smart Folder Processing**: Automatically suggests recursive processing for large folders

### Examples

Before:
```
🎨 Generating PNG assets...
✨ Feature: New component added
🐛 Fix: Resolved crash issue
```

After:
```
Generating PNG assets...
Feature: New component added
Fix: Resolved crash issue
```

## Configuration

### Settings
- `removeEmojis.excludePatterns`: Array of patterns to exclude when processing folders (default: `["node_modules", ".git", "dist", "out", ".vscode-test"]`)
- `removeEmojis.showPreviewBeforeRemoval`: Show preview of changes before removing emojis (default: `false`)
- `removeEmojis.autoConfirmSingleFile`: Skip confirmation dialog for single file operations (default: `false`)
- `removeEmojis.showProgressInStatusBar`: Show progress in status bar during operations (default: `true`)
- `removeEmojis.autoOpenResults`: Automatically open results output channel after processing (default: `true`)

## How It Works

The extension uses comprehensive Unicode regex patterns to detect emojis across all Unicode blocks, including:
- Emoticons (U+1F600-U+1F64F)
- Miscellaneous Symbols and Pictographs (U+1F300-U+1F5FF)
- Transport and Map Symbols (U+1F680-U+1F6FF)
- And many more Unicode ranges...

When an emoji is removed, the extension intelligently handles surrounding whitespace:
- Removes extra spaces when emoji is between words
- Cleans up leading spaces when emoji starts a line
- Preserves intentional formatting and indentation

## Development

### Building
```bash
pnpm install
pnpm run compile
```

### Testing
```bash
pnpm test
```

### Running in Development
1. Open the project in VS Code
2. Press `F5` to launch a new VS Code window with the extension loaded
3. Test the commands on sample files

### Release Process

This project uses automated CI/CD with GitHub Actions for releases. The workflow includes:

#### Automatic Release (Recommended)
1. **Push to main branch**: Automatically triggers version bump (patch) and creates a new tag
2. **Manual workflow dispatch**: Go to Actions tab and manually trigger with version bump type:
   - `patch` (default) - for bug fixes
   - `minor` - for new features
   - `major` - for breaking changes

#### Manual Release Script
For local releases, use the provided release script:

```bash
# Patch release (bug fixes)
pnpm run release:patch

# Minor release (new features)
pnpm run release:minor

# Major release (breaking changes)
pnpm run release:major

# Or specify type manually
pnpm run release [patch|minor|major]
```

The release script will:
1. Bump the version in `package.json`
2. Run all tests and linting
3. Build the extension
4. Create a git commit and tag
5. Provide instructions for pushing

#### CI/CD Pipeline
The GitHub Actions workflow automatically:
- Runs tests on multiple platforms (Ubuntu, Windows, macOS)
- Performs security audits
- Builds and packages the extension
- Publishes to VS Code Marketplace
- Creates GitHub releases with VSIX files
- Publishes to Open VSX Registry (if configured)

#### Required Secrets
Configure these secrets in your GitHub repository:
- `VSCE_PAT`: VS Code Marketplace Personal Access Token
- `OVSX_PAT`: Open VSX Registry Personal Access Token (optional)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the MIT License.