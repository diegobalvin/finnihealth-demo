import React, { useState, useEffect } from 'react';
import { Box, Heading, Button, HStack, VStack } from '@chakra-ui/react';
import { PatientFormData } from '@/types/patient';
import PatientFormFields from './PatientFormFields';
import { validateForm, isFormValid } from '@/utils/formValidation';

interface PatientFormProps {
  isOpen: boolean;
  formData: Partial<PatientFormData>;
  onFormDataChange: (data: Partial<PatientFormData>) => void; // eslint-disable-line
  onSubmit: () => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({
  isOpen,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
}) => {
  const [errors, setErrors] = useState<
    Partial<Record<keyof PatientFormData, string>>
  >({});

  useEffect(() => {
    setErrors({});
  }, [isOpen]);

  if (!isOpen) return null;

  const updateFormField = (field: keyof PatientFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);

    if (isFormValid(newErrors)) {
      onSubmit();
    }
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      onClick={onCancel}
    >
      <Box
        maxWidth="500px"
        width="90%"
        bg="white"
        p={6}
        borderRadius="md"
        shadow="lg"
        onClick={e => e.stopPropagation()}
      >
        <VStack spacing={4} align="stretch">
          <Heading size="md">{'Add New Patient'}</Heading>

          <PatientFormFields
            formData={formData}
            errors={errors}
            updateFormField={updateFormField}
            setErrors={setErrors}
          />

          <HStack spacing={3} justify="flex-end">
            <Button onClick={onCancel}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Add
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default PatientForm;
