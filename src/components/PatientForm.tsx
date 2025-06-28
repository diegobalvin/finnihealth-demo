import React from 'react';
import {
  Box,
  Heading,
  Button,
  Input,
  Textarea,
  HStack,
  VStack,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { PatientFormData } from '@/types/patient';

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
  if (!isOpen) return null;

  const updateFormField = (field: keyof PatientFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
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
          <FormControl isRequired>
            <FormLabel>First Name</FormLabel>
            <Input
              placeholder="Enter first name"
              value={formData.firstName || ''}
              onChange={e => updateFormField('firstName', e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Middle Name</FormLabel>
            <Input
              placeholder="Enter middle name (optional)"
              value={formData.middleName || ''}
              onChange={e => updateFormField('middleName', e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Last Name</FormLabel>
            <Input
              placeholder="Enter last name"
              value={formData.lastName || ''}
              onChange={e => updateFormField('lastName', e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Date of Birth</FormLabel>
            <Input
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={e => updateFormField('dateOfBirth', e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Status</FormLabel>
            <Select
              placeholder="Select status"
              value={formData.status || ''}
              onChange={e => updateFormField('status', e.target.value)}
            >
              <option value="Inquiry">Inquiry</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Active">Active</option>
              <option value="Churned">Churned</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Address</FormLabel>
            <Textarea
              rows={2}
              placeholder="Enter address"
              value={formData.address || ''}
              onChange={e => updateFormField('address', e.target.value)}
            />
          </FormControl>

          <HStack spacing={3} justify="flex-end">
            <Button onClick={onCancel}>Cancel</Button>
            <Button colorScheme="blue" onClick={onSubmit}>
              Add
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default PatientForm;
