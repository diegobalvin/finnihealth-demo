'use client';

import React, { useState } from 'react';
import {
  Box,
  Heading,
  Button,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Patient, PatientFormData } from '@/types/patient';
import PatientList from './PatientList';
import PatientForm from './PatientForm';

export default function PatientDashboard(): React.JSX.Element {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '1',
      firstName: 'John',
      middleName: 'Michael',
      lastName: 'Doe',
      dateOfBirth: '1990-05-15',
      status: 'Active',
      address: '123 Main St, New York, NY 10001',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1985-08-22',
      status: 'Onboarding',
      address: '456 Oak Ave, Los Angeles, CA 90210',
    },
  ]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<PatientFormData>>({});

  const handleAddPatient = (): void => {
    setEditingPatient(null);
    setFormData({});
    onOpen();
  };

  const handleEditPatient = (patient: Patient): void => {
    setEditingPatient(patient);
    setFormData({
      firstName: patient.firstName,
      middleName: patient.middleName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      status: patient.status,
      address: patient.address,
    });
    onOpen();
  };

  const handleFormCancel = (): void => {
    setEditingPatient(null);
    setFormData({});
    onClose();
  };

  const handleFormDataChange = (data: Partial<PatientFormData>): void => {
    setFormData(data);
  };

  const handleFormSubmit = (): void => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.dateOfBirth ||
      !formData.status ||
      !formData.address
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const patientData: PatientFormData = {
      firstName: formData.firstName!,
      middleName: formData.middleName,
      lastName: formData.lastName!,
      dateOfBirth: formData.dateOfBirth!,
      status: formData.status!,
      address: formData.address!,
    };

    if (editingPatient) {
      setPatients(prev =>
        prev.map(p =>
          p.id === editingPatient.id
            ? { ...patientData, id: editingPatient.id }
            : p
        )
      );
      toast({
        title: 'Success',
        description: 'Patient updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      const newPatient: Patient = {
        ...patientData,
        id: Date.now().toString(),
      };
      setPatients(prev => [...prev, newPatient]);
      toast({
        title: 'Success',
        description: 'Patient added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }

    handleFormCancel();
  };

  const handleDeletePatient = (id: string): void => {
    if (
      window.confirm(
        'Are you sure you want to delete this patient? This action cannot be undone.'
      )
    ) {
      setPatients(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Success',
        description: 'Patient deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" px={6} py={4} borderBottom="1px" borderColor="gray.200">
        <Heading size="lg" color="blue.500">
          Patient Management Dashboard
        </Heading>
      </Box>

      <Box p={6}>
        <Box mb={4}>
          <Button colorScheme="blue" onClick={handleAddPatient} size="lg">
            + Add Patient
          </Button>
        </Box>

        <PatientList
          patients={patients}
          onEditPatient={handleEditPatient}
          onDeletePatient={handleDeletePatient}
        />
        
        <PatientForm
          isOpen={isOpen}
          editingPatient={editingPatient}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Box>
    </Box>
  );
}
