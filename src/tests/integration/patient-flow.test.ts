import { validateForm, isFormValid } from '@/utils/formValidation';
import {
  validateName,
  validateAddress,
  validateDateOfBirth,
  validateStatus,
} from '@/utils/validation';
import { PatientFormData } from '@/types/patient';

describe('Patient Management Integration', () => {
  describe('Validation Integration', () => {
    test('should validate complete patient data through all validation layers', () => {
      const validPatient: PatientFormData = {
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        status: 'Active',
        address: '123 Main St, City, State 12345',
      };

      // Test individual validators
      expect(
        validateName(validPatient.firstName, 'first name')
      ).toBeUndefined();
      expect(validateName(validPatient.lastName, 'last name')).toBeUndefined();
      expect(validateAddress(validPatient.address)).toBeUndefined();
      expect(validateDateOfBirth(validPatient.dateOfBirth)).toBeUndefined();
      expect(validateStatus(validPatient.status)).toBeUndefined();

      // Test form validation
      const formErrors = validateForm(validPatient);
      expect(formErrors).toEqual({});
      expect(isFormValid(formErrors)).toBe(true);
    });

    test('should catch validation errors across all layers', () => {
      const nextYear = new Date().getFullYear() + 1;
      const invalidPatient = {
        firstName: '',
        lastName: 'A',
        dateOfBirth: `${nextYear}-01-01`,
        status: '' as any,
        address: '123',
      };

      // Test individual validators
      expect(validateName(invalidPatient.firstName, 'first name')).toBe(
        'A first name is required'
      );
      expect(validateName(invalidPatient.lastName, 'last name')).toBe(
        'A last name must be at least 2 characters'
      );
      expect(validateAddress(invalidPatient.address)).toBe(
        'An address must be at least 5 characters'
      );
      expect(validateDateOfBirth(invalidPatient.dateOfBirth)).toBe(
        'Date of birth cannot be in the future'
      );
      expect(validateStatus(invalidPatient.status)).toBe('Status is required');

      // Test form validation
      const formErrors = validateForm(invalidPatient);
      expect(formErrors.firstName).toBe('A first name is required');
      expect(formErrors.lastName).toBe(
        'A last name must be at least 2 characters'
      );
      expect(formErrors.address).toBe(
        'An address must be at least 5 characters'
      );
      expect(formErrors.dateOfBirth).toBe(
        'Date of birth cannot be in the future'
      );
      expect(formErrors.status).toBe('Status is required');
      expect(isFormValid(formErrors)).toBe(false);
    });
  });

  describe('Data Flow Integration', () => {
    test('should handle patient data transformation correctly', () => {
      // Simulate API response data structure
      const apiPatientData = {
        id: '1',
        first_name: 'John',
        middle_name: 'Michael',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        status: 'Active',
        address: '123 Main St',
        provider_id: 'provider1',
        status_update: [
          {
            id: 'status1',
            patient_id: '1',
            status: 'Active',
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      // Transform to frontend format (simulating the mapping function)
      const frontendPatient = {
        id: apiPatientData.id,
        firstName: apiPatientData.first_name,
        middleName: apiPatientData.middle_name,
        lastName: apiPatientData.last_name,
        dateOfBirth: apiPatientData.date_of_birth,
        status: apiPatientData.status,
        address: apiPatientData.address,
        providerId: apiPatientData.provider_id,
        statusHistory: apiPatientData.status_update.map(s => ({
          id: s.id,
          patientId: s.patient_id,
          status: s.status,
          createdAt: s.created_at,
        })),
      };

      // Validate the transformed data
      expect(frontendPatient.firstName).toBe('John');
      expect(frontendPatient.lastName).toBe('Doe');
      expect(frontendPatient.status).toBe('Active');
      expect(frontendPatient.statusHistory).toHaveLength(1);
      expect(frontendPatient.statusHistory[0].status).toBe('Active');
    });

    test('should validate patient data before API submission', () => {
      const patientToSubmit: PatientFormData = {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1985-05-15',
        status: 'Inquiry',
        address: '456 Oak Ave',
      };

      // Validate before submission
      const errors = validateForm(patientToSubmit);
      expect(isFormValid(errors)).toBe(true);

      // Simulate API request payload
      const apiPayload = {
        firstName: patientToSubmit.firstName,
        lastName: patientToSubmit.lastName,
        dateOfBirth: patientToSubmit.dateOfBirth,
        status: patientToSubmit.status,
        address: patientToSubmit.address,
        providerId: 'default-provider',
      };

      // Validate the payload
      const payloadErrors = validateForm(apiPayload);
      expect(isFormValid(payloadErrors)).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle validation errors consistently', () => {
      const nextYear = new Date().getFullYear() + 1;
      const testCases = [
        {
          data: { firstName: '', lastName: 'Doe' },
          expectedErrors: ['first name is required'],
        },
        {
          data: { firstName: 'John', lastName: 'A' },
          expectedErrors: ['last name must be at least 2 characters'],
        },
        {
          data: {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: `${nextYear}-01-01`,
          },
          expectedErrors: ['Date of birth cannot be in the future'],
        },
      ];

      testCases.forEach(({ data, expectedErrors }) => {
        const errors = validateForm(data);
        const errorMessages = Object.values(errors).filter(Boolean) as string[];

        expectedErrors.forEach(expectedError => {
          const hasError = errorMessages.some(msg =>
            msg.includes(expectedError)
          );
          expect(hasError).toBe(true);
        });
      });
    });
  });
});
