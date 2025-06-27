'use client';

import React, { useState, useEffect } from 'react';
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
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const response = await fetch('/api/patients');
      const data = await response.json();
      setPatients(data.patients);
    };
    fetchPatients();
  }, []);

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

  const handleFormSubmit = async (): Promise<void> => {
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
      try {
        const response = await fetch(`/api/patients/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...patientData, id: editingPatient.id }),
        });
        const data = await response.json();
        console.log('data', data);
        setPatients(data.patients);
        toast({
          title: 'Success',
          description: 'Patient updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'There was an error updating the patient',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      const newPatient: Patient = {
        ...patientData,
        id: Date.now().toString(),
      };
      try {
        const response = await fetch(`/api/patients/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...patientData, id: newPatient.id }),
        });
        const data = await response.json();
        setPatients(data.patients);
        toast({
          title: 'Success',
          description: 'Patient added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'There was an error adding the patient',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }

    handleFormCancel();
  };

  const handleDeletePatient = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/patients/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      setPatients(data.patients);
      toast({
        title: 'Success',
        description: 'Patient deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error deleting the patient',
        status: 'error',
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
