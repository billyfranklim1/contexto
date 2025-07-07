# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome Extension (Manifest V3) called "IA Context Menu - Reescritor" that provides AI-powered text rewriting capabilities through context menus. It's written in vanilla JavaScript without any build tools or frameworks.

## Development Commands

Since this is a vanilla JavaScript project with no build tools:

- **Install/Setup**: No installation needed - just load the unpacked extension in Chrome
- **Development**: Edit files directly and reload the extension in Chrome Extensions page
- **Testing**: No test framework - manual testing only
- **Linting**: No linting tools configured
- **Build**: No build step required

## Architecture

### Core Files
- `background.js`: Service worker that handles all Chrome Extension API interactions, including:
  - Context menu creation and management
  - OpenAI API calls for text processing
  - Message passing between extension components
  - Keyboard shortcuts handling
  - Storage management

- `popup.js` / `popup.html`: Extension popup interface that provides:
  - API key configuration
  - Model selection (GPT-3.5/GPT-4)
  - Theme switching
  - Custom prompts management
  - History viewing
  - Usage statistics

### Key Patterns
1. **Message Passing**: Background script communicates with popup via Chrome runtime messages
2. **Storage**: All data persisted using Chrome Storage API (`chrome.storage.local`)
3. **API Integration**: Direct OpenAI API calls from background script with streaming support
4. **Event-Driven**: Context menus trigger background script events that process selected text

### Important Implementation Details
- Uses Manifest V3 service workers (not persistent background pages)
- Implements streaming responses from OpenAI API
- Handles multiple text transformation types (rewrite, summarize, translate, etc.)
- Supports custom user-defined prompts with template variables
- Implements usage tracking and statistics
- Dark/light theme support with CSS variables

## Chrome Extension Development

When making changes:
1. Edit files directly in the project directory
2. Go to Chrome Extensions page (chrome://extensions/)
3. Click "Reload" on the extension card to apply changes
4. Test context menus on any webpage with selectable text
5. Check service worker logs in Chrome Extensions page for debugging

## Key Features to Maintain

- Context menu items dynamically created based on saved prompts
- Keyboard shortcuts (configurable in Chrome)
- Modal preview before copying results
- History tracking with timestamps
- Custom prompt system with {text} placeholder
- Usage statistics per operation type
- Onboarding flow for new users
- Theme persistence