# Ready for Production - Implementation Plan

## 1. Rename Completion
- [ ] Find and replace remaining `covalent` references with `cochart`
- [ ] Find and replace remaining `use-covalent` references with `cochart.dev`

## 2. packages\api\pkg-readme.md Updates  
- [ ] Add "use with ai helpers" section to packages\api\pkg-readme.md file with:
  - Create diagrams: Instructions using write-cochart command
  - Read diagrams: Instructions using read-cochart command

## 3. Top Menu UI Updates (2 locations: lines 364-374 and 480-490)
- [ ] Replace current LLM prompt buttons with:
  - "Copy prompt for writing diagrams" (using write-cochart.md content)
  - "Copy prompt for reading diagrams" (using read-cochart.md content)  
- [ ] Change button icons to appropriate prompt-related icons

## 4. Landing Page Updates
- [ ] VideoShowcase: Change video titles to:
  - "let ai show you" 
  - "help ai understand"
  - "create and share"
- [ ] WhyCochart section:
  - [ ] Change H2 title from "Why Covalent?" to "Why Cochart?"
  - [ ] Comment out ALL description text in benefit cards (keep only titles)
  - [ ] Create visual distinction between "What Can I Do With Cochart?" and "Business Impact" sections

## Implementation Notes

### Research Findings:
- AI prompt commands already renamed to write-cochart.md and read-cochart.md ✓
- VideoShowcase already has 3 videos side by side ✓  
- Some package.json files have empty descriptions or generic names
- Top menu buttons currently use brain icons with generic tooltips
- WhyCochart component exists but H2 still says "Why Covalent?"
- Benefit cards currently show both titles and descriptions

### Files to Modify:
- packages/ui/src/app/app.component.html (2 button locations)
- packages/landing-page/src/components/VideoShowcase.tsx
- packages/landing-page/src/components/WhyCochart.tsx
- pkg-readme files for "use with ai helpers" sections

All questions resolved - ready to implement!