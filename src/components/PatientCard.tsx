import React from 'react';
import { Box, Heading, Badge, HStack, VStack, Button } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { Patient } from '@/types/patient';

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onEdit, onDelete }) => {
  const getStatusColor = (status: Patient['status']): string => {
    const colorMap: Record<Patient['status'], string> = {
      'Inquiry': 'blue',
      'Onboarding': 'orange',
      'Active': 'green',
      'Churned': 'red'
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
          <strong>Date of Birth:</strong> {dayjs(patient.dateOfBirth).format('MM/DD/YYYY')}
        </Box>
        
        <Box>
          <strong>Address:</strong> {patient.address}
        </Box>
        
        <HStack spacing={2}>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => onEdit(patient)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={() => onDelete(patient.id)}
          >
            Delete
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default PatientCard;