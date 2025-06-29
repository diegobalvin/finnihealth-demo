import React from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
} from '@chakra-ui/react';
import { PatientFormData } from '@/types/patient';
import {
  validateName,
  validateAddress,
  validateDateOfBirth,
  validateStatus,
} from '@/utils/validation';

interface PatientFormFieldsProps {
  formData: Partial<PatientFormData>;
  errors: Partial<Record<keyof PatientFormData, string>>;
  updateFormField: (field: keyof PatientFormData, value: string) => void; // eslint-disable-line
  setErrors: React.Dispatch<
    React.SetStateAction<Partial<Record<keyof PatientFormData, string>>>
  >;
}

const PatientFormFields: React.FC<PatientFormFieldsProps> = ({
  formData,
  errors,
  updateFormField,
  setErrors,
}) => {
  const handleFieldChange = (field: keyof PatientFormData, value: string) => {
    updateFormField(field, value);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldBlur = (field: keyof PatientFormData, value: string) => {
    let error: string | undefined;

    switch (field) {
      case 'firstName':
        error = validateName(value, 'first name');
        break;
      case 'lastName':
        error = validateName(value, 'last name');
        break;
      case 'middleName':
        if (value) {
          error = validateName(value, 'middle name');
        }
        break;
      case 'dateOfBirth':
        error = validateDateOfBirth(value);
        break;
      case 'status':
        error = validateStatus(value);
        break;
      case 'address':
        error = validateAddress(value);
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  return (
    <>
      <FormControl isRequired isInvalid={!!errors.firstName}>
        <FormLabel>First Name</FormLabel>
        <Input
          placeholder="Enter first name"
          value={formData.firstName || ''}
          onChange={e => handleFieldChange('firstName', e.target.value)}
          onBlur={e => handleFieldBlur('firstName', e.target.value)}
        />
        <FormErrorMessage>{errors.firstName}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.middleName}>
        <FormLabel>Middle Name</FormLabel>
        <Input
          placeholder="Enter middle name (optional)"
          value={formData.middleName || ''}
          onChange={e => handleFieldChange('middleName', e.target.value)}
          onBlur={e => handleFieldBlur('middleName', e.target.value)}
        />
        <FormErrorMessage>{errors.middleName}</FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={!!errors.lastName}>
        <FormLabel>Last Name</FormLabel>
        <Input
          placeholder="Enter last name"
          value={formData.lastName || ''}
          onChange={e => handleFieldChange('lastName', e.target.value)}
          onBlur={e => handleFieldBlur('lastName', e.target.value)}
        />
        <FormErrorMessage>{errors.lastName}</FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={!!errors.dateOfBirth}>
        <FormLabel>Date of Birth</FormLabel>
        <Input
          type="date"
          value={formData.dateOfBirth || ''}
          onChange={e => handleFieldChange('dateOfBirth', e.target.value)}
          onBlur={e => handleFieldBlur('dateOfBirth', e.target.value)}
        />
        <FormErrorMessage>{errors.dateOfBirth}</FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={!!errors.status}>
        <FormLabel>Status</FormLabel>
        <Select
          placeholder="Select status"
          value={formData.status || ''}
          onChange={e => handleFieldChange('status', e.target.value)}
        >
          <option value="Inquiry">Inquiry</option>
          <option value="Onboarding">Onboarding</option>
          <option value="Active">Active</option>
          <option value="Churned">Churned</option>
        </Select>
        <FormErrorMessage>{errors.status}</FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={!!errors.address}>
        <FormLabel>Address</FormLabel>
        <Textarea
          rows={2}
          placeholder="Enter address"
          value={formData.address || ''}
          onChange={e => handleFieldChange('address', e.target.value)}
          onBlur={e => handleFieldBlur('address', e.target.value)}
        />
        <FormErrorMessage>{errors.address}</FormErrorMessage>
      </FormControl>
    </>
  );
};

export default PatientFormFields;
