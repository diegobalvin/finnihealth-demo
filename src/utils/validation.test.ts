import {
  validateName,
  validateAddress,
  validateDateOfBirth,
  validateStatus,
} from './validation';

describe('Validation Functions', () => {
  describe('validateName', () => {
    test('should pass for valid names', () => {
      expect(validateName('John', 'first name')).toBeUndefined();
      expect(validateName('Mary-Jane', 'first name')).toBeUndefined();
      expect(validateName("O'Connor", 'last name')).toBeUndefined();
      expect(validateName('Van der Berg', 'last name')).toBeUndefined();
    });

    test('should fail for empty names', () => {
      expect(validateName('', 'first name')).toBe('A first name is required');
      expect(validateName('   ', 'last name')).toBe('A last name is required');
    });

    test('should fail for short names', () => {
      expect(validateName('A', 'first name')).toBe(
        'A first name must be at least 2 characters'
      );
    });

    test('should fail for long names', () => {
      const longName = 'A'.repeat(51);
      expect(validateName(longName, 'first name')).toBe(
        'A first name must be less than 50 characters'
      );
    });

    test('should fail for invalid characters', () => {
      expect(validateName('John123', 'first name')).toBe(
        'A first name can only contain letters, spaces, hyphens, and apostrophes'
      );
      expect(validateName('John@Doe', 'last name')).toBe(
        'A last name can only contain letters, spaces, hyphens, and apostrophes'
      );
    });
  });

  describe('validateAddress', () => {
    test('should pass for valid addresses', () => {
      expect(validateAddress('123 Main St, City, State 12345')).toBeUndefined();
      expect(validateAddress('Apt 4B, 456 Oak Avenue')).toBeUndefined();
    });

    test('should fail for short addresses', () => {
      expect(validateAddress('123')).toBe(
        'An address must be at least 5 characters'
      );
    });

    test('should fail for long addresses', () => {
      const longAddress = 'A'.repeat(201);
      expect(validateAddress(longAddress)).toBe(
        'An address must be less than 200 characters'
      );
    });
  });

  describe('validateDateOfBirth', () => {
    test('should pass for valid dates', () => {
      expect(validateDateOfBirth('1990-01-01')).toBeUndefined();
      expect(validateDateOfBirth('2000-12-31')).toBeUndefined();
    });

    test('should fail for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(validateDateOfBirth(tomorrow.toISOString().split('T')[0])).toBe(
        'Date of birth cannot be in the future'
      );
    });

    test('should fail for very old dates', () => {
      expect(validateDateOfBirth('1899-01-01')).toBe(
        'Date of birth seems invalid'
      );
    });
  });

  describe('validateStatus', () => {
    test('should pass for valid statuses', () => {
      expect(validateStatus('Inquiry')).toBeUndefined();
      expect(validateStatus('Active')).toBeUndefined();
    });

    test('should fail for empty status', () => {
      expect(validateStatus('')).toBe('Status is required');
    });
  });
});
