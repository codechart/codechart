# Covalent → Cochart Rename Plan

## Overview
Systematic rename from "Covalent" brand to "Cochart" with domain change from `use-covalent.com` to `cochart.dev`.

## Phase 1: Critical User-Facing Changes

### 1.1 Domain Configuration
**Target:** All `use-covalent.com` → `cochart.dev`

```bash
# API Configuration
packages/api/config/config.json
packages/api/src/defaultConfig.ts
packages/api/src/App.ts

# Landing Page
packages/landing-page/src/App.tsx
packages/landing-page/src/components/Navbar.tsx

# Infrastructure
packages/infrastructure/linode.ts
packages/infrastructure/kubernetes/apps/cert-manager.ts
packages/infrastructure/Pulumi.dev.yaml
```

### 1.2 Brand Name Updates
**Target:** All "Covalent" → "Cochart"

```bash
# VS Code Plugin
packages/vscode-plugin/package.json          # name, displayName, publisher, commands
packages/vscode-plugin/webview/vscode-plugin.html
packages/vscode-plugin/src/panelWebviewProvider.ts

# UI Components  
packages/ui/src/index.html                   # page title
packages/ui/src/app/app.component.html
packages/ui/src/app/app.component.ts

# Landing Page Components
packages/landing-page/src/App.tsx
packages/landing-page/src/pages/Index.tsx
packages/landing-page/src/pages/HowToUse.tsx
packages/landing-page/src/data/howToUseSections.ts
packages/landing-page/src/components/Navbar.tsx
packages/landing-page/src/components/IntroOverlay.tsx
packages/landing-page/src/components/FeatureSuggest.tsx
packages/landing-page/src/components/VideoShowcase.tsx
packages/landing-page/src/components/Hero.tsx
packages/landing-page/src/components/WhyCovalent.tsx  # Rename component too
packages/landing-page/src/components/Downloads.tsx

# IntelliJ Plugin
packages/intellij-plugin/src/main/resources/META-INF/plugin.xml
packages/intellij-plugin/src/main/resources/webview/js/ij-plugin-bridge.js
packages/intellij-plugin/src/main/java/ua/haltentech/plugin/webview/ide/IdeService.java
packages/intellij-plugin/build.gradle.kts
```

### 1.3 Artifact/File Names
**Target:** All build outputs and downloadable files

```bash
# Dockerfile - executable names
covalent-linux → cochart-linux
covalent-macos → cochart-macos  
covalent-win.exe → cochart-win.exe

# Archive names
covalent-linux.tar.gz → cochart-linux.tar.gz
covalent-mac.tar.gz → cochart-mac.tar.gz
covalent-win.zip → cochart-win.zip
covalent-js.tar.gz → cochart-js.tar.gz

# Plugin packages
covalent-vscode-plugin-1.0.0.vsix → cochart-vscode-plugin-1.0.0.vsix
Covalent-IJ-Plugin.zip → Cochart-IJ-Plugin.zip
```

## Phase 2: Documentation & Configuration

### 2.1 Core Documentation
```bash
CLAUDE.md                                    # Project description, diagram instructions
packages/api/readme.md
packages/api/pkg-readme.md
packages/how-to-build.md
packages/docs/docs/index.md
.github/copilot-instructions.md             # Update diagram instructions
```

### 2.2 Component Renames
```bash
# React component that needs renaming
packages/landing-page/src/components/WhyCovalent.tsx → WhyCochart.tsx

# Directory that may need renaming  
packages/api/Covalent-llm-instructions/ → Cochart-llm-instructions/

# Workspace file references
packages/vscode-plugin/src/WebviewMdFile.ts  # covalent-group.md → cochart-group.md
```

### 2.3 Claude Commands
```bash
.claude/commands/read-covalent.md → read-cochart.md
.claude/commands/write-covalent.md → write-cochart.md
```

## Phase 3: Infrastructure & Deployment

### 3.1 CI/CD Updates
```bash
.github/workflows/build-artifacts.yml        # Update artifact paths
```

### 3.2 Migration Documentation
**Action:** Archive existing migration docs, create new ones for cochart deployment

## Phase 4: Clean-up (Optional)
```bash
# Discussion files - update for future reference only
discussions/railway-migrate/
discussions/linode-deployment/

# Git history/logs - LEAVE AS-IS (historical record)
```

## Execution Strategy

### Step 1: Backup
```bash
git checkout -b rename-to-cochart
git commit -am "Backup before covalent→cochart rename"
```

### Step 2: Domain Updates (Critical First)
1. Update all `use-covalent.com` → `cochart.dev`
2. Test locally to ensure no broken references
3. Commit: "Update domain references to cochart.dev"

### Step 3: Brand Name Updates  
1. Update all "Covalent" → "Cochart" in user-facing text
2. Test builds and UI
3. Commit: "Update brand name from Covalent to Cochart"

### Step 4: File/Component Renames
1. Rename files and update imports
2. Update build scripts and Docker
3. Test full build pipeline
4. Commit: "Rename files and artifacts to cochart"

### Step 5: Documentation
1. Update all documentation
2. Commit: "Update documentation for cochart rebrand"

### Step 6: Testing & Validation
```bash
# Test builds
cd packages/ui && ng build --base-href .
cd packages/api && npm run build && tsc --noEmit
cd packages/landing-page && npm run build
cd packages/vscode-plugin && npm run package

# Test deployments
docker build -t cochart-test .
```

## Risk Mitigation

### High-Risk Changes
- **Domain references:** Could break API calls and navigation
- **Plugin configurations:** Could break IDE integrations  
- **Build artifacts:** Could break download links

### Validation Checklist
- [ ] All domain references updated consistently
- [ ] No broken imports after file renames
- [ ] All builds complete successfully  
- [ ] Plugin packages install correctly
- [ ] Landing page loads and links work
- [ ] Docker build produces correct artifacts

## Rollback Plan
```bash
git checkout main                            # Return to original state
git branch -D rename-to-cochart             # Delete rename branch if issues
```

## Post-Rename Tasks
1. Update DNS settings: `use-covalent.com` → `cochart.dev`
2. Update Railway/deployment domain configurations
3. Update any external references or documentation
4. Inform users of rebrand and new domain