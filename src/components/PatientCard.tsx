import React from 'react';
import {
  Box,
  Heading,
  Badge,
  HStack,
  VStack,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { Patient } from '@/types/patient';

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onEdit,
  onDelete,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const getStatusColor = (status: Patient['status']): string => {
    const colorMap: Record<Patient['status'], string> = {
      Inquiry: 'blue',
      Onboarding: 'orange',
      Active: 'green',
      Churned: 'red',
    };
    return colorMap[status];
  };

  const fullName = `${patient.firstName} ${patient.middleName ? patient.middleName + ' ' : ''}${patient.lastName}`;

  return (
    <Box
      width="100%"
      bg="white"
      p={4}
      borderRadius="md"
      shadow="sm"
      border="1px"
      borderColor="gray.200"
    >
      <VStack align="start" spacing={3}>
        <HStack justify="space-between" width="100%">
          <Heading size="md">{fullName}</Heading>
          <Badge colorScheme={getStatusColor(patient.status)}>
            {patient.status}
          </Badge>
        </HStack>

        <Box>
          <strong>Date of Birth:</strong>{' '}
          {dayjs(patient.dateOfBirth).format('MM/DD/YYYY')}
        </Box>

        <Box>
          <strong>Address:</strong> {patient.address}
        </Box>

        <HStack spacing={2}>
          <Button size="sm" colorScheme="blue" onClick={() => onEdit(patient)}>
            Edit
          </Button>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={onOpen}
          >
            Delete
          </Button>
        </HStack>
      </VStack>

      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Patient</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this patient? This action cannot
              be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={() => {
                  onDelete(patient.id);
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
  );
};

export default PatientCard;
