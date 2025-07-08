import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Badge,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { Patient } from '@/types/patient';
import { getStatusColorScheme } from '@/utils/statusColor';

interface PatientListProps {
  patients: Patient[];
  isLoading: boolean;
  onSelectPatient: (patient: Patient) => void; // eslint-disable-line
  selectedPatientId?: string;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  isLoading,
  onSelectPatient,
  selectedPatientId,
}) => {
  return (
    <Box overflowX="auto" bg="white" borderRadius="md" shadow="sm" p={2}>
      <Table size="md" style={{ tableLayout: 'fixed' }}>
        <Thead>
          <Tr>
            <Th width="25%">Name</Th>
            <Th width="25%">Date of Birth</Th>
            <Th width="30%">Address</Th>
            <Th width="20%">Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading ? (
            <Tr>
              <Td width="100%" colSpan={4}>
                <Center>
                  <Spinner size="xl" color="blue.500" />
                </Center>
              </Td>
            </Tr>
          ) : (
            patients &&
            patients.map(patient => {
              const fullName = `${patient.firstName} ${patient.middleName ? patient.middleName + ' ' : ''}${patient.lastName}`;
              const isSelected = patient.id === selectedPatientId;
              return (
                <Tr
                  key={patient.id}
                  bg={isSelected ? 'blue.50' : undefined}
                  _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                  onClick={() => onSelectPatient(patient)}
                >
                  <Td width="25%">{fullName}</Td>
                  <Td width="25%">
                    {new Date(patient.dateOfBirth).toLocaleDateString('en-US', {
                      timeZone: 'UTC',
                    })}
                  </Td>
                  <Td width="30%">{patient.address}</Td>
                  <Td width="20%">
                    <Badge colorScheme={getStatusColorScheme(patient.status)}>
                      {patient.status}
                    </Badge>
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default PatientList;
