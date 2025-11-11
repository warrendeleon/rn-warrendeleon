# US-004: Comprehensive Test Coverage

**ID**: US-004
**Title**: Comprehensive Test Coverage
**Epic**: [EPIC-002: Quality & Reliability](../epics/EPIC-002-quality-reliability.md)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: Medium
**Effort Estimate**: 5.5 hours
**Tags**: `testing`, `quality`, `coverage`, `jest`, `refactoring`

---

## User Story

**As a** developer,
**I want** comprehensive test coverage across components and hooks,
**So that** I can refactor confidently without fear of breaking existing functionality.

---

## Context & Rationale

Current test coverage is 36.72% overall with critical gaps in component and hook testing. This low coverage creates fear of refactoring and makes it difficult to detect regressions. Several key components have 0% coverage:

- **ChevronButtonGroup**: 0% coverage (completely untested)
- **SelectableButtonGroup**: 0% coverage (completely untested)
- **ButtonWithChevron**: 45% coverage (incomplete branch coverage)
- **useAppColorScheme hook**: 0% coverage (completely untested)
- **Settings integration flow**: No integration tests

Without comprehensive tests:

- Developers hesitate to refactor or optimise code
- Bugs slip into production undetected
- Time wasted on manual testing and debugging
- Integration issues discovered late in development

The project targets 60%+ coverage (up from 36.72%), focusing on business logic and shared components while excluding presentation layers (screens, navigation) per sustainable testing strategy.

**Related Epic**: See [EPIC-002](../epics/EPIC-002-quality-reliability.md) for business impact, testing strategy, and success metrics.

---

## Benefits

### Developer Experience

- Confidence to refactor without breaking changes
- Fast feedback loop (tests run in < 10 seconds)
- Clear documentation of expected behaviour
- Easier onboarding (tests show how to use components)

### Business Impact

- Faster feature development (less debugging time)
- Fewer bugs in production (catch issues early)
- Lower support costs (fewer user-reported issues)
- Higher code quality and maintainability

### Technical Benefits

- Regression protection during refactoring
- Living documentation of component APIs
- Foundation for CI/CD pipeline
- Measurable quality metrics

---

## Risks & Mitigation

### Risk 1: Brittle Tests

**Impact**: Tests break on implementation changes, not behaviour changes
**Likelihood**: Medium
**Mitigation**:

- Follow Testing Library principles (test behaviour, not implementation)
- Avoid testing internal state
- Use semantic queries (getByRole, getByLabelText)
- Prefer integration tests over unit tests where appropriate

### Risk 2: False Confidence

**Impact**: High coverage doesn't guarantee quality tests
**Likelihood**: Low
**Mitigation**:

- Review tests for meaningful assertions
- Test edge cases and error paths
- Code review focus on test quality
- Combine with manual testing

### Risk 3: Maintenance Burden

**Impact**: Tests require constant updates as code evolves
**Likelihood**: Medium
**Mitigation**:

- Keep tests simple and focused
- Use shared test utilities (renderWithProviders)
- Document testing patterns in CONTRIBUTING.md
- Balance coverage goals with pragmatism

---

## Pros & Cons

### Pros

✅ Enables fearless refactoring
✅ Catches bugs before production
✅ Faster development (less debugging)
✅ Living documentation
✅ Measurable quality improvement (36% → 60%+)

### Cons

❌ Upfront time investment (5.5 hours)
❌ Ongoing maintenance as code changes
❌ Learning curve for Testing Library patterns
❌ Coverage numbers can be misleading

**Trade-off**: Initial time investment for long-term velocity and quality. Essential for sustainable development.

---

## Acceptance Criteria

### Coverage Targets

- [ ] Overall coverage increased from 36.72% to 60%+
- [ ] ChevronButtonGroup: 0% → 100% coverage
- [ ] SelectableButtonGroup: 0% → 100% coverage
- [ ] ButtonWithChevron: 45% → 100% coverage
- [ ] useAppColorScheme: 0% → 100% coverage
- [ ] Settings integration: New integration test suite

### Test Quality

- [ ] All tests follow Testing Library principles
- [ ] Tests use meaningful assertions (not just snapshot)
- [ ] Edge cases and error paths covered
- [ ] Tests are readable and well-organised
- [ ] Shared test utilities used consistently

### Technical

- [ ] All new tests pass (zero flaky tests)
- [ ] Tests run in < 10 seconds
- [ ] Coverage reports accurate
- [ ] No regressions in existing functionality

---

## Test Scenarios

### ChevronButtonGroup Component

**Scenario 1: Renders Multiple Buttons**

```gherkin
Given I have ChevronButtonGroup with 3 button configs
When I render the component
Then it should render 3 ButtonWithChevron components
And each button should have correct groupVariant (top/middle/bottom)
And buttons should be separated by ButtonGroupDivider
```

**Scenario 2: Handles Button Press**

```gherkin
Given I have ChevronButtonGroup with button configs
When I press the second button
Then the corresponding onPress handler should be called
And navigation or action should occur
```

### SelectableButtonGroup Component

**Scenario 3: Renders Selection State**

```gherkin
Given I have SelectableButtonGroup with options and selectedValue
When I render the component
Then the selected option should show a checkmark
And the selected option should be highlighted
And unselected options should not have checkmark
```

**Scenario 4: Handles Selection Change**

```gherkin
Given I have SelectableButtonGroup with options
When I press an unselected option
Then the onSelect handler should be called with the new value
And the selection state should update
```

### ButtonWithChevron Component

**Scenario 5: Branch Coverage**

```gherkin
Given ButtonWithChevron with various prop combinations
When I test with/without startIcon, endLabel, etc.
Then all conditional rendering paths should be covered
And all prop combinations should render correctly
```

### useAppColorScheme Hook

**Scenario 6: Returns System Color Scheme**

```gherkin
Given the theme preference is 'system'
And the device color scheme is 'dark'
When I call useAppColorScheme
Then it should return 'dark'
```

**Scenario 7: Returns Theme Preference**

```gherkin
Given the theme preference is 'light'
And the device color scheme is 'dark'
When I call useAppColorScheme
Then it should return 'light' (overriding system)
```

### Settings Integration Tests

**Scenario 8: Complete Settings Flow**

```gherkin
Given I am on the Settings screen
When I navigate to Language screen
And I select "Spanish"
And I navigate back
Then the Language button should show "Spanish"
And Redux state should reflect the change
```

---

## Dependencies

### Blockers

- [TASK-023](../tasks/TASK-023-remove-unused-dependencies.md): Clean dependencies first
- [TASK-024](../tasks/TASK-024-add-missing-types.md): Complete types first

### Related Stories

- [US-001](./US-001-smooth-responsive-interactions.md): Tests validate performance improvements
- [US-002](./US-002-graceful-error-handling.md): Tests verify error handling
- [US-003](./US-003-inclusive-screen-reader-support.md): Tests verify accessibility

---

## Tasks

| ID                                                            | Task                            | Effort | Priority | Status      |
| ------------------------------------------------------------- | ------------------------------- | ------ | -------- | ----------- |
| [TASK-018](../tasks/TASK-018-test-chevron-button-group.md)    | Test ChevronButtonGroup         | 1h     | Medium   | Not Started |
| [TASK-019](../tasks/TASK-019-test-selectable-button-group.md) | Test SelectableButtonGroup      | 1h     | Medium   | Not Started |
| [TASK-020](../tasks/TASK-020-test-button-with-chevron.md)     | Test ButtonWithChevron Coverage | 0.5h   | Medium   | Not Started |
| [TASK-021](../tasks/TASK-021-test-use-app-color-scheme.md)    | Test useAppColorScheme Hook     | 1h     | Medium   | Not Started |
| [TASK-022](../tasks/TASK-022-integration-test-settings.md)    | Integration Tests Settings Flow | 0.5h   | Medium   | Not Started |
| Additional validation and manual testing                      |                                 | 1.5h   |          |             |

**Total**: 5 tasks, 5.5 hours

---

## Implementation Phases

### Phase 1: Component Unit Tests (2.5h)

Test individual components in isolation:

- TASK-018: ChevronButtonGroup (1h)
- TASK-019: SelectableButtonGroup (1h)
- TASK-020: ButtonWithChevron remaining branches (0.5h)

**Validation**: Each component reaches 100% coverage

### Phase 2: Hook Testing (1h)

Test custom hooks:

- TASK-021: useAppColorScheme hook (1h)
- Test all theme preference scenarios
- Test Redux integration

**Validation**: Hook reaches 100% coverage

### Phase 3: Integration Testing (0.5h)

Test component interactions and navigation:

- TASK-022: Settings flow integration tests (0.5h)
- Test navigation between screens
- Test Redux state updates

**Validation**: Integration tests pass, user flows validated

### Phase 4: Validation (1.5h)

- Run full test suite, verify all pass
- Check coverage reports (target: 60%+)
- Manual testing of all tested features
- Document any gaps or limitations

---

## Success Criteria

This user story is complete when:

1. ✅ **Coverage Target Met**: Overall coverage 60%+ (up from 36.72%)
2. ✅ **Zero Gaps**: All targeted components and hooks at 100%
3. ✅ **All Tests Pass**: No failing or flaky tests
4. ✅ **Quality Tests**: Tests follow Testing Library principles, meaningful assertions
5. ✅ **Fast Execution**: Full test suite runs in < 10 seconds
6. ✅ **Documentation**: Testing patterns documented in CONTRIBUTING.md

---

## Testing Philosophy

### Business Logic First

Per the project's sustainable testing strategy:

**✅ 100% Coverage Required**:

- Redux slices (state management)
- Selectors and actions
- Shared components (ButtonWithChevron, etc.)
- Custom hooks (useAppColorScheme)
- Utility functions

**❌ Excluded from Coverage**:

- Presentation components (screens)
- Navigation setup (native dependencies)
- Infrastructure config (store setup, metro.config)
- Barrel exports (index.ts files)

**Why**: Focus on testable, high-value business logic. Presentation layers better tested with E2E tools (Detox).

### Testing Library Principles

1. **Test Behaviour, Not Implementation**: Test what users see and do
2. **Semantic Queries**: Prefer getByRole, getByLabelText over testID
3. **User Events**: Simulate real user interactions
4. **Avoid Implementation Details**: Don't test internal state or methods

### Shared Utilities

- `renderWithProviders`: For components using Gluestack UI or i18n
- `render`: For standard React Native components
- Mock Redux store for predictable state

---

## Alternative Approaches

### Alternative 1: E2E Testing Only

Skip unit tests, rely only on Detox E2E tests.

**Pros**: Tests real user scenarios, catches integration issues
**Cons**: Slow, flaky, difficult to debug, poor coverage of edge cases

**Decision**: Balanced approach - unit tests for business logic, E2E for user flows

### Alternative 2: 100% Coverage Everywhere

Aim for 100% coverage including screens and navigation.

**Pros**: Complete coverage numbers
**Cons**: Brittle tests, fighting framework limitations, unsustainable

**Decision**: Sustainable 60%+ focusing on business logic (per project strategy)

---

## Notes & Learnings

_To be filled in during/after implementation_

---

## References

- [Testing Library Principles](https://testing-library.com/docs/guiding-principles/)
- [Jest Configuration](https://jestjs.io/docs/configuration)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Hooks](https://react-hooks-testing-library.com/)
- [EPIC-002: Quality & Reliability](../epics/EPIC-002-quality-reliability.md)

---

**Last Updated**: 2025-01-11
