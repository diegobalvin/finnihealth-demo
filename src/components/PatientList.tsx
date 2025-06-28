import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Box, Badge } from '@chakra-ui/react';
import { Patient } from '@/types/patient';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  selectedPatientId?: string;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  onSelectPatient,
  selectedPatientId,
}) => {
  return (
    <Box overflowX="auto" bg="white" borderRadius="md" shadow="sm" p={2}>
      <Table size="md">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Date of Birth</Th>
            <Th>Address</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {patients.map(patient => {
            const fullName = `${patient.firstName} ${patient.middleName ? patient.middleName + ' ' : ''}${patient.lastName}`;
            const isSelected = patient.id === selectedPatientId;
            return (
              <Tr
                key={patient.id}
                bg={isSelected ? 'blue.50' : undefined}
                _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                onClick={() => onSelectPatient(patient)}
              >
                <Td fontWeight="normal">{fullName}</Td>
                <Td>
                  {new Date(patient.dateOfBirth).toLocaleDateString('en-US', {
                    timeZone: 'UTC',
                  })}
                </Td>
                <Td>{patient.address}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      patient.status === 'Inquiry'
                        ? 'blue'
                        : patient.status === 'Onboarding'
                          ? 'orange'
                          : patient.status === 'Active'
                            ? 'green'
                            : 'red'
                    }
                  >
                    {patient.status}
                  </Badge>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default PatientList;
