'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  useDisclosure,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { Patient, PatientFormData } from '@/types/patient';
import PatientList from './PatientList';
import PatientForm from './PatientForm';
import PatientEditPanel from './PatientEditPanel';

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

  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();
  const {
    isOpen: isDrawerOpen,
    onOpen: openDrawer,
    onClose: closeDrawer,
  } = useDisclosure();
  const toast = useToast();

  const [formData, setFormData] = useState<Partial<PatientFormData>>({});
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (selectedPatient) {
      setFormData({
        firstName: selectedPatient.firstName,
        middleName: selectedPatient.middleName,
        lastName: selectedPatient.lastName,
        dateOfBirth: selectedPatient.dateOfBirth
          ? selectedPatient.dateOfBirth.slice(0, 10)
          : '',
        status: selectedPatient.status,
        address: selectedPatient.address,
      });
    }
  }, [selectedPatient]);

  const handleAddPatient = (): void => {
    setFormData({});
    openModal();
  };

  const handleFormCancel = (): void => {
    setFormData({});
    closeModal();
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

    const patientFormData: PatientFormData = {
      firstName: formData.firstName!,
      middleName: formData.middleName,
      lastName: formData.lastName!,
      dateOfBirth: formData.dateOfBirth!,
      status: formData.status!,
      address: formData.address!,
    };

    if (selectedPatient) {
      try {
        // update patient
        const response = await fetch(`/api/patients/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...patientFormData,
            id: selectedPatient.id,
            isStatusUpdate: selectedPatient.status !== formData.status,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to update patient');
        }
        const data = await response.json();
        setPatients(p =>
          p.map(patient =>
            patient.id === selectedPatient.id ? data.patients[0] : patient
          )
        );
        handleDrawerClose();
        toast({
          title: 'Success',
          description: 'Patient updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.log(error);
        toast({
          title: 'Error',
          description: `There was an error updating the patient`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      // add new patient

      try {
        const response = await fetch(`/api/patients/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...patientFormData }),
        });
        if (!response.ok) {
          throw new Error('Failed to add patient');
        }
        const data = await response.json();
        setPatients(p => [...p, data.patients[0]]);
        toast({
          title: 'Success',
          description: 'Patient added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.log(error);
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
      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }
      setPatients(p => p.filter(p => p.id !== id));
      toast({
        title: 'Success',
        description: 'Patient deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        description: 'There was an error deleting the patient',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    openDrawer();
  };

  const handleDrawerClose = () => {
    setSelectedPatient(null);
    setFormData({});
    closeDrawer();
  };

  const updateFormField = (field: keyof PatientFormData, value: string) => {
    handleFormDataChange({ ...formData, [field]: value });
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" px={6} py={4} borderBottom="1px" borderColor="gray.200">
        <Heading size="lg" color="blue.500">
          Finni Health Patient Management
        </Heading>
      </Box>

      <Box p={6}>
        <Box mb={4}>
          <Button colorScheme="blue" onClick={handleAddPatient} size="md">
            + Add Patient
          </Button>
        </Box>

        <Flex gap={6} align="flex-start">
          <Box flex={1} minW="350px">
            <PatientList
              patients={patients}
              onSelectPatient={handleSelectPatient}
              selectedPatientId={selectedPatient?.id}
            />
          </Box>
        </Flex>

        <PatientEditPanel
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          selectedPatient={selectedPatient}
          formData={formData}
          updateFormField={updateFormField}
          handleFormCancel={handleDrawerClose}
          handleFormSubmit={handleFormSubmit}
          handleDeletePatient={handleDeletePatient}
        />

        <PatientForm
          isOpen={isModalOpen}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Box>
    </Box>
  );
}
