# TASK-073: Download and Add SVG Logo Assets

**Epic**: [EPIC-009: Education Display Enhancement](../epics/EPIC-009-education-display-enhancement.md)
**User Story**: [US-016: Education Screen with SVG Logos](../stories/US-016-education-screen-svg-logos.md)
**Status**: ⭕ Not Started
**Priority**: High
**Estimated Effort**: 0.75 hours
**Created**: 2025-11-15

---

## Context

Download 25+ SVG logo files from the old portfolio repository and organise them in the new project's asset structure. These logos represent universities, educational institutions, and online course providers (Udemy, etc.) that appear in the education data.

## Technical Details

### Source Repository

**URL**: https://github.com/warrendeleon/rn-warrendeleon/tree/fbea2378ec61d843568a2ae5531cc61dcd221993/src/assets/svg

**Logo Files to Download** (25 total):

1. `allnowcorp.svg` - AllNow Corp
2. `altran.svg` - Altran
3. `bp.svg` - BP
4. `candide.svg` - Candide
5. `desigual.svg` - Desigual
6. `edenic.svg` - Edenic
7. `everis.svg` - Everis
8. `fanduel.svg` - FanDuel
9. `lexel.svg` - Lexel
10. `newmotion.svg` - NewMotion
11. `nucleus.svg` - Nucleus
12. `openhealth.svg` - OpenHealth
13. `sky.svg` - Sky
14. `stadion.svg` - Stadion
15. `stucom.svg` - Stucom
16. `teknon.svg` - Teknon
17. `tigerspike.svg` - Tigerspike
18. `udemy.svg` - Udemy
19. `wonderbill.svg` - Wonderbill
20. `xdesign.svg` - XDesign
21. `zonal.svg` - Zonal
22. Additional logos as found in the repository

### Target Directory

Create directory structure:

```
src/assets/svg/logos/education/
```

### Implementation Steps

1. **Create directory structure**:

   ```bash
   mkdir -p src/assets/svg/logos/education
   ```

2. **Download SVG files**:
   - Use GitHub raw content URLs or clone repository
   - Download all SVG files from source directory
   - Save to `src/assets/svg/logos/education/`

3. **Verify SVG files**:
   - Check each SVG file opens correctly
   - Verify no corruption during download
   - Ensure proper SVG syntax (viewBox, xmlns attributes)

4. **Optimise SVGs** (optional but recommended):

   ```bash
   # Use SVGO if available
   npx svgo src/assets/svg/logos/education/*.svg
   ```

5. **Create index file** for easy imports:
   ```typescript
   // src/assets/svg/logos/education/index.ts
   export const educationLogos = {
     stucom: require('./stucom.svg'),
     teknon: require('./teknon.svg'),
     udemy: require('./udemy.svg'),
     bp: require('./bp.svg'),
     sky: require('./sky.svg'),
     nucleus: require('./nucleus.svg'),
     allnowcorp: require('./allnowcorp.svg'),
     altran: require('./altran.svg'),
     candide: require('./candide.svg'),
     desigual: require('./desigual.svg'),
     edenic: require('./edenic.svg'),
     everis: require('./everis.svg'),
     fanduel: require('./fanduel.svg'),
     lexel: require('./lexel.svg'),
     newmotion: require('./newmotion.svg'),
     openhealth: require('./openhealth.svg'),
     stadion: require('./stadion.svg'),
     tigerspike: require('./tigerspike.svg'),
     wonderbill: require('./wonderbill.svg'),
     xdesign: require('./xdesign.svg'),
     zonal: require('./zonal.svg'),
   };
   ```

### Files Affected

- `src/assets/svg/logos/education/` - New directory with 25+ SVG files
- `src/assets/svg/logos/education/index.ts` - New index file for exports

## Acceptance Criteria

- ✅ Directory `src/assets/svg/logos/education/` created
- ✅ All 25+ SVG logo files downloaded and saved
- ✅ Each SVG file is valid and renders correctly
- ✅ SVG files are optimised (file size < 50KB each)
- ✅ Index file created for easy imports
- ✅ No licensing issues with logo usage

## Test Scenarios

### Scenario 1: Verify SVG files

**GIVEN** SVG files are downloaded
**WHEN** I open each file in an SVG viewer or browser
**THEN** each logo should render correctly
**AND** no corruption or errors should appear

### Scenario 2: Verify imports

**GIVEN** index file is created
**WHEN** I import `educationLogos` in TypeScript
**THEN** TypeScript should recognise all exports
**AND** no type errors should occur

## Dependencies

**Prerequisites**:

- ✅ Access to old portfolio repository
- ✅ `src/assets/svg/` directory exists

**Enables**:

- TASK-074: Create MenuButtonGroupSvg Component
- TASK-075: Update EducationDataScreen UI

## Success Criteria

- All SVG logo assets available in project
- Files organised in logical directory structure
- Easy to import and use in components
- No performance issues with file sizes
- Legal to use in portfolio app

## Notes

- SVG logos are for educational institutions and online courses
- Some logos may be trademarked - verify fair use for portfolio purposes
- If licensing is unclear, consider creating custom icon representations
- Logos should work on both light and dark backgrounds
- Consider creating a fallback icon for entries without logos
