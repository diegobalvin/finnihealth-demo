import React from 'react';
import { VStack } from '@chakra-ui/react';
import PatientCard from './PatientCard';
import { Patient } from '@/types/patient';

interface PatientListProps {
  patients: Patient[];
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  onEditPatient,
  onDeletePatient,
}) => {
  return (
    <VStack spacing={4}>
      {patients.map(patient => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onEdit={onEditPatient}
          onDelete={onDeletePatient}
        />
      ))}
    </VStack>
  );
};

export default PatientList;
