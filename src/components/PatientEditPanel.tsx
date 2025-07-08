import React, { useEffect, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  VStack,
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
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { Patient, PatientFormData } from '@/types/patient';
import { getStatusColorScheme } from '@/utils/statusColor';
import PatientFormFields from './PatientFormFields';
import { validateForm, isFormValid } from '@/utils/formValidation';

interface PatientEditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatient: Patient | null;
  formData: Partial<PatientFormData>;
  updateFormField: (field: keyof PatientFormData, value: string) => void; // eslint-disable-line
  handleFormCancel: () => void;
  handleFormSubmit: () => void;
  handleDeletePatient: (id: string) => void; // eslint-disable-line
}

const getTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const PatientEditPanel: React.FC<PatientEditPanelProps> = ({
  isOpen,
  onClose,
  selectedPatient,
  formData,
  updateFormField,
  handleFormSubmit,
  handleFormCancel,
  handleDeletePatient,
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof PatientFormData, string>>
  >({});

  const handleSubmit = () => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    if (isFormValid(newErrors)) {
      // TODO: check if the formData is different from the selectedPatient
      // if it is, submit
      // if it is not, don't submit
      handleFormSubmit();
    }
  };

  useEffect(() => {
    setErrors({});
  }, [selectedPatient]);

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerContent overflowY="auto" maxHeight="100%">
        {selectedPatient && (
          <Box
            maxWidth="100%"
            width="100%"
            bg="white"
            p={6}
            onClick={e => e.stopPropagation()}
          >
            <VStack spacing={3} align="stretch">
              <Heading size="md">Edit Patient</Heading>

              <PatientFormFields
                formData={formData}
                errors={errors}
                updateFormField={updateFormField}
                setErrors={setErrors}
              />

              <Box pt={2} pb={2}>
                {selectedPatient.statusHistory.length > 0 && (
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Status</Th>
                        <Th>Date</Th>
                        <Th>Timestamp</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedPatient.statusHistory.map(s => (
                        <Tr key={s.id}>
                          <Td>
                            <Badge colorScheme={getStatusColorScheme(s.status)}>
                              {s.status}
                            </Badge>
                          </Td>
                          <Td>
                            {new Date(s.createdAt).toLocaleDateString(
                              navigator.language,
                              {
                                timeZone: getTimeZone(),
                              }
                            )}
                          </Td>
                          <Td>
                            {new Date(s.createdAt).toLocaleTimeString(
                              navigator.language,
                              {
                                timeZone: getTimeZone(),
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              }
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
              <Box pt={2}>
                <Flex justify="space-between" align="center">
                  <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    Delete
                  </Button>
                  <Flex gap={3} justify="flex-end">
                    <Button onClick={handleFormCancel}>Cancel</Button>
                    <Button colorScheme="orange" onClick={handleSubmit}>
                      Save
                    </Button>
                  </Flex>
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
