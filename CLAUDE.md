# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

CodeChart (formerly Covalent) is a code visualization tool that creates interactive diagrams from codebases. The monorepo contains multiple components for different platforms and deployment targets.

## Key Packages

- **`packages/api/`** - Node.js/TypeScript backend service (main application) - runs locally on client computer
- **`packages/ui/`** - Angular frontend for the web interface - in production, served as static HTML from api 
- **`packages/vscode-plugin/`** - VS Code extension
- **`packages/intellij-plugin/`** - IntelliJ IDEA plugin (Java/Gradle)
- **`packages/landing-page/`** - React landing page with Vite/Tailwind
- **`packages/license-api/`** - Go microservice for license management
- **`packages/infrastructure/`** - Pulumi infrastructure-as-code
- **`packages/docs/`** - MkDocs documentation

## Essential Commands

### API (Node.js Backend)
```bash
cd packages/api
npm run build          # TypeScript compilation
npm run dev           # Development with watch mode
npm run serve         # Start production server
npm run test          # Run tests with Mocha
npm run lint          # ESLint validation
tsc --noEmit          # Type checking without compilation
```

### UI (Angular Frontend)
```bash
cd packages/ui
ng build --base-href .  # Production build
ng serve --live-reload=false --port=4300  # Development server
ng test               # Unit tests
ng lint               # Angular linting
ng e2e                # End-to-end tests
```

### VS Code Plugin
```bash
cd packages/vscode-plugin
npm run package       # Webpack build
npx vsce package      # Create .vsix extension file
npm run lint          # ESLint validation
npm test              # Run tests
```

### Landing Page (React/Vite)
```bash
cd packages/landing-page
npm run dev           # Development server
npm run build         # Production build
npm run build:dev     # Development build
npm run lint          # ESLint validation
```

### License API (Go)
```bash
cd packages/license-api
go build              # Compile binary
go run .              # Run development server
```

### Infrastructure (Pulumi)
```bash
cd packages/infrastructure
pulumi up             # Deploy infrastructure
pulumi preview        # Preview changes
```

## Build Process

The repository uses a multi-stage Docker build process defined in the root `Dockerfile`. Each component is built in isolation:

1. **UI Build**: Angular build → copy to API's public folder
2. **API Build**: TypeScript compilation + UI assets
3. **Plugin Builds**: Extensions for VS Code and IntelliJ
4. **Packaging**: Creates distribution packages and downloads

Complete build sequence from `packages/how-to-build.md`:
```bash
# UI and API
cd packages/ui && npm run build
cp -r dist/* ../api/public/
cd ../api && npm run build
pkg . --targets windows --out-path dist-runnables  # Create executable

# VS Code Extension
cd packages/vscode-plugin
npm run package && npx vsce package

# IntelliJ Plugin
# In IntelliJ: Run gradle buildPlugin task
```

## Architecture

### Core Application (API + UI)
- **Backend**: Express.js server with TypeScript, serves both API and static files
- **Frontend**: Angular SPA with visualization components using vis.js
- **Communication**: RESTful API + WebSocket for real-time updates
- **Storage**: NeDB (embedded database) for lightweight data persistence
- **Git Integration**: Uses simple-git for repository operations

### Plugin Architecture
- **VS Code**: WebView-based extension communicating via message passing
- **IntelliJ**: Java plugin using JCEF (Java Chromium Embedded Framework)
- Both plugins communicate with the main application via HTTP API

### Deployment
- **Containerized**: Multi-stage Docker builds for each component
- **Infrastructure**: Kubernetes deployment managed by Pulumi
- **Distribution**: Static binaries for desktop, container images for server deployment

## Important Notes

- Always run `tsc --noEmit` after TypeScript changes to catch type errors
- UI changes require rebuilding and copying to API's public folder for full-stack testing
- Plugin development requires building and installing via IDE package managers
- The codebase uses "Covalent" as the primary brand name (legacy "CodeChart" references exist)
- Configuration files in `packages/api/config/` are essential for runtime behavior

## Covalent Diagram Generation

When generating Covalent diagrams, follow the two-step process defined in `.github/copilot-instructions.md`:
1. **Step 1**: Build main code flow using only CODE nodes (CODE → CODE relationships)
2. **Step 2**: Add optional TODO nodes for planning (TODO → CODE connections only)

Connection rules:
- ✅ CODE → CODE (main flow)
- ✅ TODO → CODE (planning annotations)
- ❌ CODE → TODO (forbidden)
- ❌ TODO → TODO (forbidden)