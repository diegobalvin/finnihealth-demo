import React from 'react';
import {
  Drawer,
  DrawerContent,
  VStack,
  FormControl,
  Textarea,
  FormLabel,
  Select,
  Input,
  Button,
  Heading,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Box,
  Flex,
} from '@chakra-ui/react';
import { Patient, PatientFormData } from '@/types/patient';

interface PatientEditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatient: Patient | null;
  formData: Partial<PatientFormData>;
  updateFormField: (field: keyof PatientFormData, value: string) => void;
  handleFormCancel: () => void;
  handleFormSubmit: () => void;
  handleDeletePatient: (id: string) => void;
}

const PatientEditPanel: React.FC<PatientEditPanelProps> = ({
  isOpen,
  onClose,
  selectedPatient,
  formData,
  updateFormField,
  handleFormSubmit,
  handleDeletePatient,
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerContent>
        {selectedPatient && (
          <Box
            maxWidth="500px"
            width="100%"
            bg="white"
            p={6}
            onClick={e => e.stopPropagation()}
          >
            <VStack spacing={4} align="stretch">
              <Heading size="md">Edit Patient</Heading>

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
                  rows={3}
                  placeholder="Enter address"
                  value={formData.address || ''}
                  onChange={e => updateFormField('address', e.target.value)}
                />
              </FormControl>

              <Box pt={2}>
                <Flex justify="space-between" align="center">
                  <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    Delete
                  </Button>
                  <Button colorScheme="blue" onClick={handleFormSubmit}>
                    Update
                  </Button>
                </Flex>
              </Box>
            </VStack>

            <AlertDialog
              isOpen={isDeleteOpen}
              onClose={() => setIsDeleteOpen(false)}
              leastDestructiveRef={cancelRef}
              isCentered={true}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader>Delete Patient</AlertDialogHeader>
                  <AlertDialogBody>
                    Are you sure you want to delete this patient? This action
                    cannot be undone.
                  </AlertDialogBody>
                  <AlertDialogFooter>
                    <Button
                      ref={cancelRef}
                      onClick={() => setIsDeleteOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      colorScheme="red"
                      ml={3}
                      onClick={() => {
                        handleDeletePatient(selectedPatient.id);
                        setIsDeleteOpen(false);
                        onClose();
                      }}
                    >
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </Box>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default PatientEditPanel;
