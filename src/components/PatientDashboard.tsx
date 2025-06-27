'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  useDisclosure,
  useToast,
  Flex,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
} from '@chakra-ui/react';
import { Patient, PatientFormData } from '@/types/patient';
import PatientList from './PatientList';
import PatientForm from './PatientForm';
import PatientCard from './PatientCard';

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
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const {
    isOpen: isDrawerOpen,
    onOpen: openDrawer,
    onClose: closeDrawer,
  } = useDisclosure();

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
        const _ = await response.json();
        setPatients(p =>
          p.map(patient =>
            patient.id === editingPatient.id
              ? { ...patient, ...patientData }
              : patient
          )
        );
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
        setPatients(p => [...p, ...data.patients]);
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
      const _ = await response.json();
      setPatients(p => p.filter(p => p.id !== id));
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

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    openDrawer();
  };

  const handleDrawerClose = () => {
    setSelectedPatient(null);
    closeDrawer();
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" px={6} py={4} borderBottom="1px" borderColor="gray.200">
        <Heading size="lg" color="blue.500">
          Finnihealth Patient Management
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
              onEditPatient={handleEditPatient}
              onDeletePatient={handleDeletePatient}
              onSelectPatient={handleSelectPatient}
              selectedPatientId={selectedPatient?.id}
            />
          </Box>
        </Flex>

        <Drawer
          isOpen={isDrawerOpen}
          placement="right"
          onClose={handleDrawerClose}
          size="md"
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Patient Details</DrawerHeader>
            <DrawerBody>
              {selectedPatient && (
                <PatientCard
                  patient={selectedPatient}
                  onEdit={handleEditPatient}
                  onDelete={handleDeletePatient}
                />
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>

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
