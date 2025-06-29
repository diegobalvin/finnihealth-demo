import { PatientFormData } from '@/types/patient';
import {
  validateName,
  validateAddress,
  validateDateOfBirth,
  validateStatus,
} from './validation';

export const validateForm = (
  formData: Partial<PatientFormData>
): Partial<Record<keyof PatientFormData, string>> => {
  const errors: Partial<Record<keyof PatientFormData, string>> = {};

  errors.firstName = validateName(formData.firstName || '', 'first name');
  if (formData.middleName) {
    errors.middleName = validateName(formData.middleName, 'middle name');
  }
  errors.lastName = validateName(formData.lastName || '', 'last name');
  errors.dateOfBirth = validateDateOfBirth(formData.dateOfBirth || '');
  errors.address = validateAddress(formData.address || '');
  errors.status = validateStatus(formData.status || '');

  return errors;
};

export const isFormValid = (
  errors: Partial<Record<keyof PatientFormData, string>>
): boolean => {
  return !Object.values(errors).some(error => error);
};
