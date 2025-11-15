# Natural Language Writing Guide

> How to write documentation, comments, and commit messages that sound authentically human

## Core Principle

All documentation, code comments, and commit messages must appear **naturally human-written** - conversational, direct, and authentic.

---

## Documentation Writing

### Documentation Files (`/docs`, `README.md`, `*.md`)

**❌ Robotic AI Patterns** (Avoid these):

| Pattern                                              | Why It's Bad              | Better Alternative                              |
| ---------------------------------------------------- | ------------------------- | ----------------------------------------------- |
| "This document provides a comprehensive overview..." | Overly formal, academic   | "This shows how to..."                          |
| "It should be noted that..."                         | Unnecessarily formal      | "Note:" or "Important:"                         |
| "Additionally, furthermore, moreover..."             | Academic transition words | "Also, and, plus"                               |
| "Utilize, leverage, facilitate"                      | Corporate buzzwords       | "Use, apply, help"                              |
| "In order to accomplish this task..."                | Wordy                     | "To do this..."                                 |
| "The aforementioned component..."                    | Overly formal             | "This component..." or "The component above..." |

**✅ Natural Human Patterns** (Use these):

```markdown
<!-- ❌ AI-style -->

This document provides a comprehensive overview of the authentication
system. It should be noted that the implementation utilizes industry
best practices. Additionally, it leverages modern security protocols.

<!-- ✅ Human-style -->

This guide shows how the authentication system works. We use industry
best practices and modern security protocols.
```

### Common Replacements

| Replace This          | With This          |
| --------------------- | ------------------ |
| utilize               | use                |
| leverage              | use, apply         |
| facilitate            | help, enable       |
| implement             | add, build, create |
| commence              | start, begin       |
| terminate             | end, stop          |
| modifications         | changes            |
| subsequently          | then, next, after  |
| prior to              | before             |
| in order to           | to                 |
| at this point in time | now                |

---

## Code Comments

### Function/Component Comments

**❌ AI-style** (too verbose, overly descriptive):

```typescript
// This function is responsible for calculating the total price
// by iterating through all items and summing their values
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// This component renders a list of products with their associated
// metadata and provides user interaction capabilities
export function ProductList({ products }: Props) {
  // ...
}
```

**✅ Human-style** (concise, direct):

```typescript
// Calculate total price from all items
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Display products with metadata
export function ProductList({ products }: Props) {
  // ...
}
```

### Inline Comments

**❌ AI-style**:

```typescript
// It is necessary to validate the user input prior to processing
if (!isValid(input)) return;

// Subsequently, we proceed to update the state
setState(newValue);
```

**✅ Human-style**:

```typescript
// Validate before processing
if (!isValid(input)) return;

// Update state
setState(newValue);
```

### When to Skip Comments

Don't comment obvious code:

```typescript
// ❌ Unnecessary
// Increment counter by 1
count++;

// ❌ Obvious
// Return true if user is admin
return user.role === 'admin';

// ✅ Skip the comment - code is self-explanatory
count++;
return user.role === 'admin';
```

Do comment non-obvious code:

```typescript
// ✅ Helpful context
// Safari requires touch-action for passive scroll
element.style.touchAction = 'pan-y';

// ✅ Explains why
// Use setTimeout to defer until after React's commit phase
setTimeout(() => measureLayout(), 0);
```

---

## Git Commit Messages

### Subject Lines

**❌ AI-style**:

```
feat(auth): implement comprehensive authentication system utilizing JWT tokens
refactor(components): optimize performance through the utilization of React.memo
fix(navigation): resolve issue wherein back button fails to function correctly
```

**✅ Human-style**:

```
✨ feat(auth): add JWT authentication
♻️ refactor(components): optimize with React.memo
🐛 fix(navigation): fix back button not working
```

### Commit Bodies

**❌ AI-style**:

```
This commit implements a comprehensive solution for user authentication.
The implementation utilizes JWT tokens and leverages industry best practices.
Additionally, it facilitates secure session management.
```

**✅ Human-style**:

```
Add JWT-based user authentication:
- Use access tokens with 15-min expiry
- Refresh tokens stored in secure storage
- Auto-refresh on 401 responses
```

See `.claude/docs/commit-messages.md` for complete commit message examples.

---

## README Files

### Before/After Example

**❌ AI-style README**:

```markdown
# Project Overview

This project provides a comprehensive mobile application solution
utilizing React Native technology. The implementation leverages modern
architectural patterns and facilitates efficient state management.

## Getting Started

In order to commence development, it is necessary to install the
required dependencies. Subsequently, you may proceed to execute the
development server.
```

**✅ Human-style README**:

```markdown
# Project Overview

A React Native mobile app built with modern architecture and
efficient state management.

## Getting Started

Install dependencies and start the dev server:

\`\`\`bash
yarn install
yarn start
\`\`\`
```

---

## Tone Checklist

Before committing any documentation, review against this checklist:

- [ ] **Conversational**: Reads like you're explaining to a colleague
- [ ] **Active voice**: "Add feature" not "Feature is added"
- [ ] **Direct**: Gets to the point without fluff
- [ ] **Natural words**: "Use" not "utilize", "help" not "facilitate"
- [ ] **No AI markers**: No "comprehensive", "leverage", "aforementioned"
- [ ] **Appropriate detail**: Not overly verbose, not too terse
- [ ] **British English**: If this project requires it (check CLAUDE.md)

---

## British vs American English

**This project uses British English (UK)** for all documentation.

### Common Differences

| American | British (Use This) |
| -------- | ------------------ |
| color    | colour             |
| optimize | optimise           |
| behavior | behaviour          |
| analyze  | analyse            |
| organize | organise           |
| center   | centre             |
| labeled  | labelled           |
| traveled | travelled          |

### Date Formats

```markdown
<!-- ✅ British (ISO or DD/MM/YYYY) -->

Released: 2025-01-14
Released: 14/01/2025

<!-- ❌ American -->

Released: 01/14/2025
Released: January 14, 2025
```

---

## Quick Self-Check

Ask yourself before committing:

1. **Would I write this in an email to my team?** If no, it's too formal.
2. **Does it sound like a person or a robot?** If robot, simplify.
3. **Could I say this out loud naturally?** If awkward, rewrite.
4. **Am I using corporate buzzwords?** Replace with plain English.
5. **Is it British English (if required)?** Check spellings.

---

## Examples: Before & After

### Example 1: Feature Documentation

**❌ Before**:

```markdown
The Settings feature facilitates comprehensive user customization
capabilities. It provides the ability to modify various application
parameters and leverages persistent storage mechanisms to ensure
that user preferences are maintained across sessions.
```

**✅ After**:

```markdown
The Settings feature lets users customise the app. Changes are
saved to device storage and persist across sessions.
```

### Example 2: Technical Explanation

**❌ Before**:

```markdown
The implementation utilizes React Navigation's native stack navigator
in order to facilitate efficient screen transitions. This approach
ensures optimal performance characteristics through the utilization
of native primitives.
```

**✅ After**:

```markdown
We use React Navigation's native stack for screen transitions.
This gives better performance by using native iOS/Android APIs
instead of JavaScript animations.
```

### Example 3: Installation Instructions

**❌ Before**:

```markdown
Prior to commencing development activities, it is necessary to
install the requisite dependencies. Subsequently, you may proceed
to execute the development server utilizing the yarn start command.
```

**✅ After**:

```markdown
Install dependencies then start the dev server:

\`\`\`bash
yarn install
yarn start
\`\`\`
```

---

## Summary

**Natural language** = how you'd explain it to a teammate over coffee

**Key habits**:

- Write short, direct sentences
- Use common words ("use" not "utilize")
- Active voice ("Add X" not "X is added")
- Skip unnecessary formality
- Read it aloud - if it sounds robotic, rewrite

**Remember**: The goal is clarity and authenticity, not impressing with vocabulary.
