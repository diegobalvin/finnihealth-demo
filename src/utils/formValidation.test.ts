import { validateForm, isFormValid } from './formValidation';
import { PatientFormData } from '@/types/patient';

describe('Form Validation', () => {
  test('should validate complete valid form', () => {
    const validForm: PatientFormData = {
      firstName: 'John',
      middleName: 'Michael',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      status: 'Active',
      address: '123 Main St, City, State 12345',
    };

    const errors = validateForm(validForm);
    expect(errors).toEqual({});
    expect(isFormValid(errors)).toBe(true);
  });

  test('should validate form without middle name', () => {
    const formWithoutMiddle: PatientFormData = {
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1985-05-15',
      status: 'Inquiry',
      address: '456 Oak Ave',
    };

    const errors = validateForm(formWithoutMiddle);
    expect(errors).toEqual({});
    expect(isFormValid(errors)).toBe(true);
  });

  test('should catch multiple validation errors', () => {
    const nextYear = new Date().getFullYear() + 1;
    const invalidForm = {
      firstName: '',
      lastName: 'A',
      dateOfBirth: `${nextYear}-01-01`,
      status: undefined,
      address: '123',
    };

    const errors = validateForm(invalidForm);
    expect(errors.firstName).toBe('A first name is required');
    expect(errors.lastName).toBe('A last name must be at least 2 characters');
    expect(errors.dateOfBirth).toBe('Date of birth cannot be in the future');
    expect(errors.status).toBe('Status is required');
    expect(errors.address).toBe('An address must be at least 5 characters');
    expect(isFormValid(errors)).toBe(false);
  });

  test('should handle partial form data', () => {
    const partialForm = {
      firstName: 'John',
      lastName: 'Doe',
    };

    const errors = validateForm(partialForm);
    expect(errors.firstName).toBeUndefined();
    expect(errors.lastName).toBeUndefined();
    expect(errors.dateOfBirth).toBe('Date of birth is required');
    expect(errors.status).toBe('Status is required');
    expect(errors.address).toBe('An address is required');
    expect(isFormValid(errors)).toBe(false);
  });

  test('should validate middle name when provided', () => {
    const formWithInvalidMiddle = {
      firstName: 'John',
      middleName: 'A',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      status: 'Active' as const,
      address: '123 Main St',
    };

    const errors = validateForm(formWithInvalidMiddle);
    expect(errors.middleName).toBe(
      'A middle name must be at least 2 characters'
    );
    expect(isFormValid(errors)).toBe(false);
  });
});
