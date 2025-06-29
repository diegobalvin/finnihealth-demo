# Testing Guide

This project includes comprehensive test coverage for the patient management system. The tests are organized into different layers to ensure reliability and maintainability.

## Test Structure

### 1. Unit Tests

- **Validation Tests** (`src/utils/validation.test.ts`): Test individual validation functions
- **Form Validation Tests** (`src/utils/formValidation.test.ts`): Test form validation logic
- **Component Tests** (`src/components/PatientForm.test.tsx`): Test React components

### 2. API Tests

- **API Endpoint Tests** (`src/pages/api/patients.test.ts`): Test all CRUD operations

### 3. Integration Tests

- **Integration Tests** (`src/tests/integration/patient-flow.test.ts`): Test data flow and validation integration

### 4. E2E Tests (Optional)

- **Playwright Tests** (`playwright/tests/patient-management.spec.ts`): End-to-end user journey tests

## Running Tests

### Install Dependencies

```bash
yarn install
```

### Run All Tests

```bash
yarn test
```

### Run Tests in Watch Mode

```bash
yarn test:watch
```

### Run Tests with Coverage

```bash
yarn test:coverage
```

### Run Specific Test Files

```bash
# Run only validation tests
yarn test src/utils/validation.test.ts

# Run only API tests
yarn test src/pages/api/patients.test.ts

# Run only component tests
yarn test src/components/PatientForm.test.tsx
```

## Test Examples

### Validation Tests

```typescript
// Test individual validation functions
expect(validateName('John', 'first name')).toBeUndefined();
expect(validateName('', 'first name')).toBe('A first name is required');
```

### API Tests

```typescript
// Test API endpoints with mocked Supabase
const { req, res } = createMocks({ method: 'GET' });
await handler(req, res);
expect(res._getStatusCode()).toBe(200);
```

### Component Tests

```typescript
// Test React components with user interactions
fireEvent.change(screen.getByLabelText(/first name/i), {
  target: { value: 'John' },
});
expect(screen.getByDisplayValue('John')).toBeInTheDocument();
```

## Test Coverage

The tests cover:

### ✅ Validation Layer

- Name validation (length, characters, required)
- Address validation (length, required)
- Date of birth validation (future dates, invalid dates)
- Status validation (required field)

### ✅ Form Layer

- Complete form validation
- Partial form validation
- Error state management
- Form submission logic

### ✅ API Layer

- GET /api/patients (fetch all patients)
- POST /api/patients (create patient)
- PUT /api/patients (update patient)
- DELETE /api/patients (delete patient)
- Error handling for all endpoints
- Validation integration

### ✅ Component Layer

- Form rendering
- User interactions
- Validation error display
- Form submission
- Props handling

### ✅ Integration Layer

- Data transformation between frontend and backend
- Validation consistency across layers
- Error handling integration
- Data flow testing

## Manual Testing Checklist

For manual testing, verify these scenarios:

### Patient Creation

- [ ] Add patient with all required fields
- [ ] Add patient without optional fields (middle name)
- [ ] Try to add patient with invalid data (should show validation errors)
- [ ] Try to add patient with future date of birth (should show error)

### Patient Editing

- [ ] Edit patient information
- [ ] Update patient status
- [ ] Verify status history is updated
- [ ] Try to save with invalid data (should show validation errors)

### Patient Deletion

- [ ] Delete patient successfully
- [ ] Verify patient is removed from list
- [ ] Verify status updates are also deleted

### UI/UX

- [ ] Loading states during API calls
- [ ] Success/error toast notifications
- [ ] Form validation feedback
- [ ] Responsive design on different screen sizes

## Testing Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Mock External Dependencies**: Use mocks for Supabase, API calls, and external services
3. **Test User Behavior**: Focus on testing user interactions and workflows
4. **Edge Cases**: Test boundary conditions and error scenarios
5. **Maintainability**: Keep tests readable and well-organized

## Debugging Tests

### Common Issues

1. **Async/Await**: Make sure to use `waitFor` for asynchronous operations
2. **Mocking**: Ensure all external dependencies are properly mocked
3. **TypeScript**: Fix type errors before running tests
4. **Environment**: Make sure test environment variables are set correctly

### Debug Commands

```bash
# Run tests with verbose output
yarn test --verbose

# Run specific test with debugging
yarn test --testNamePattern="should add new patient"

# Run tests and watch for changes
yarn test:watch
```

## Adding New Tests

When adding new features, follow this pattern:

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test how components work together
3. **API Tests**: Test new endpoints or changes to existing ones
4. **E2E Tests**: Test complete user journeys

### Example: Adding a New Validation Rule

```typescript
// 1. Add unit test
test('should validate new rule', () => {
  expect(validateNewRule('valid')).toBeUndefined();
  expect(validateNewRule('invalid')).toBe('Error message');
});

// 2. Add to form validation test
test('should include new rule in form validation', () => {
  const errors = validateForm({ newField: 'invalid' });
  expect(errors.newField).toBe('Error message');
});

// 3. Add to API test
test('should reject invalid new field', async () => {
  const { req, res } = createMocks({
    method: 'POST',
    body: { newField: 'invalid' },
  });
  await handler(req, res);
  expect(res._getStatusCode()).toBe(400);
});
```

This testing setup ensures your patient management system is robust, reliable, and maintainable.
