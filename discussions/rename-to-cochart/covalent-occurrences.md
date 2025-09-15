# Covalent to Cochart Rename Analysis

## Summary
Found **132+ occurrences** of "covalent" (case-insensitive) across **67+ files** in the project. The occurrences span multiple categories from brand names to domain references to technical configurations.

## Grouped by Type of Usage

### 1. **Domain References (use-covalent.com)**
**Files:** 28 files
- `packages/api/src/App.ts`
- `packages/api/config/config.json`
- `packages/landing-page/src/App.tsx`
- `packages/api/readme.md`
- `packages/landing-page/src/components/Navbar.tsx`
- `packages/infrastructure/linode.ts`
- `packages/infrastructure/kubernetes/apps/cert-manager.ts`
- `packages/infrastructure/Pulumi.dev.yaml`
- `packages/docs/docs/index.md`
- `packages/api/src/defaultConfig.ts`
- Multiple discussion files in `discussions/railway-migrate/`
- Multiple discussion files in `discussions/linode-deployment/`

**Usage:** Domain references like `use-covalent.com`, `api.use-covalent.com`, `www.use-covalent.com`

### 2. **Brand Name / Display Text**
**Files:** 39 files
- **VSCode Plugin:**
  - `packages/vscode-plugin/package.json` - plugin name, display name, publisher, command titles
  - `packages/vscode-plugin/webview/vscode-plugin.html` - alert messages
  - `packages/vscode-plugin/src/panelWebviewProvider.ts` - tab labels and titles
- **UI Components:**
  - `packages/ui/src/index.html` - page title
  - `packages/ui/src/app/app.component.html` - brand references
  - `packages/ui/src/app/app.component.ts` - brand references
- **Landing Page:**
  - `packages/landing-page/src/App.tsx`
  - `packages/landing-page/src/pages/Index.tsx`
  - `packages/landing-page/src/pages/HowToUse.tsx`
  - `packages/landing-page/src/data/howToUseSections.ts`
  - `packages/landing-page/src/components/Navbar.tsx`
  - `packages/landing-page/src/components/IntroOverlay.tsx`
  - `packages/landing-page/src/components/FeatureSuggest.tsx`
  - `packages/landing-page/src/components/VideoShowcase.tsx`
  - `packages/landing-page/src/components/Hero.tsx`
  - `packages/landing-page/src/components/WhyCovalent.tsx`
  - `packages/landing-page/src/components/Downloads.tsx`
- **IntelliJ Plugin:**
  - `packages/intellij-plugin/src/main/resources/META-INF/plugin.xml`
  - `packages/intellij-plugin/src/main/resources/webview/js/ij-plugin-bridge.js`
  - `packages/intellij-plugin/src/main/java/ua/haltentech/plugin/webview/ide/IdeService.java`
  - `packages/intellij-plugin/build.gradle.kts`

### 3. **File/Artifact Names**
**Files:** Multiple
- **Docker build outputs:**
  - `Dockerfile` - executable names: `covalent-linux`, `covalent-macos`, `covalent-win.exe`
  - Archive names: `covalent-linux.tar.gz`, `covalent-mac.tar.gz`, `covalent-win.zip`, `covalent-js.tar.gz`
- **Plugin packages:**
  - `covalent-vscode-plugin-1.0.0.vsix`
  - `Covalent-IJ-Plugin.zip`
- **Workspace files:**
  - `packages/vscode-plugin/src/WebviewMdFile.ts` - references `covalent-group.md`

### 4. **Documentation/Comments**
**Files:** Multiple
- `CLAUDE.md` - project description and diagram generation instructions
- `.github/copilot-instructions.md` - Covalent diagram generation rules
- `packages/how-to-build.md` - build instructions
- `packages/api/readme.md` - API documentation
- `packages/api/pkg-readme.md` - package readme
- Multiple discussion files in `discussions/railway-migrate/`
- Multiple discussion files in `discussions/linode-deployment/`
- `packages/api/Covalent-llm-instructions/example-logic.md` - LLM instructions

### 5. **Technical Configuration**
**Files:** 8+ files
- `packages/api/config/config.json` - API configuration
- `packages/api/src/defaultConfig.ts` - default configuration
- `.github/workflows/build-artifacts.yml` - CI/CD workflows
- `packages/infrastructure/` files - deployment configurations

### 6. **Project/Service Names (Railway/Infrastructure)**
**Files:** Multiple migration logs and plans
- Railway project name: `covalent-production`
- Service references in migration documentation
- Discussion files in `discussions/railway-migrate/`

### 7. **Git History/Logs**
**Files:**
- `.git/logs/HEAD`
- `.git/logs/refs/heads/main`

### 8. **Claude Commands**
**Files:**
- `.claude/commands/read-covalent.md`
- `.claude/commands/write-covalent.md`

## Priority for Rename

### **HIGH PRIORITY** (User-Facing)
1. **Brand Name/Display Text** - All user-visible text
2. **Domain References** - All use-covalent.com → cochart.dev
3. **File/Artifact Names** - Download files and executables
4. **Plugin Configurations** - VSCode and IntelliJ plugin metadata

### **MEDIUM PRIORITY** (Technical/Internal)
1. **Documentation** - READMEs, build instructions, comments
2. **Configuration Files** - API configs, infrastructure files
3. **Claude Commands** - Command file names

### **LOW PRIORITY** (Historical/Generated)
1. **Git History/Logs** - Leave as-is (historical record)
2. **Discussion Files** - Update only for future reference
3. **Migration Logs** - Archive existing, create new for cochart

## Files Requiring Manual Review
Some files contain mixed content (both covalent and other references) that may need careful manual editing rather than bulk replacement.