'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  useDisclosure,
  useToast,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';
import { Patient, PatientFormData } from '@/types/patient';
import PatientList from './PatientList';
import PatientForm from './PatientForm';
import PatientEditPanel from './PatientEditPanel';
import { PatientApiResponse } from '@/pages/api/patients';

export default function PatientDashboard(): React.JSX.Element {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = async () => {
    const response = await fetch('/api/patients');
    const data = await response.json();
    setPatients(data.patients);
    setIsLoading(false);
  };

  useEffect(() => {
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

    toast.promise(
      (async () => {
        let response: Response;
        let data: PatientApiResponse;
        if (selectedPatient) {
          response = await fetch(`/api/patients/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...patientFormData,
              id: selectedPatient.id,
              isStatusUpdate: selectedPatient.status !== formData.status,
            }),
          });
          if (!response.ok) {
            const errorMessage = 'Failed to update patient';
            try {
              const errorData = await response.json();
              if (errorData.message) {
                throw new Error(errorData.message);
              }
            } catch {}
            throw new Error(errorMessage);
          }
          data = await response.json();
          setPatients(p =>
            p.map(patient =>
              patient.id === selectedPatient.id ? data.patient! : patient
            )
          );
          handleDrawerClose();
        } else {
          response = await fetch(`/api/patients/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...patientFormData }),
          });
          if (!response.ok) {
            const errorMessage = 'Failed to add patient';
            try {
              const errorData = await response.json();
              if (errorData.message) {
                throw new Error(errorData.message);
              }
            } catch {}
            throw new Error(errorMessage);
          }
          data = await response.json();
          setPatients(p => [...p, data.patient!]);
          handleFormCancel();
        }
        return data;
      })(),
      {
        loading: {
          title: 'Processing...',
          description: selectedPatient
            ? 'Updating patient...'
            : 'Adding patient',
        },
        success: data => ({
          title: 'Success',
          description: data.message,
          duration: 3000,
          isClosable: true,
        }),
        error: error => {
          console.error(error);
          return {
            title: 'Error',
            description: selectedPatient
              ? 'There was an error updating the patient'
              : 'There was an error adding the patient',
            duration: 3000,
            isClosable: true,
          };
        },
      }
    );
  };

  const handleDeletePatient = async (id: string): Promise<void> => {
    toast.promise(
      (async () => {
        const response = await fetch(`/api/patients/`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) {
          const errorMessage = 'Failed to delete patient';
          try {
            const errorData = await response.json();
            if (errorData.message) {
              throw new Error(errorData.message);
            }
          } catch {}
          throw new Error(errorMessage);
        }
        const data = await response.json();
        setPatients(p => p.filter(p => p.id !== id));
        return data;
      })(),
      {
        loading: {
          title: 'Processing...',
          description: 'Deleting patient...',
        },
        success: data => ({
          title: 'Success',
          description: data.message,
          duration: 3000,
          isClosable: true,
        }),
        error: error => {
          console.error(error);
          return {
            title: 'Error',
            description: 'There was an error deleting the patient',
            duration: 3000,
            isClosable: true,
          };
        },
      }
    );
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

  const handleSearch = async (query: string) => {
    if (query.length <= 3) {
      fetchPatients();
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const query = (e.target as HTMLInputElement).value;
    if (e.key === 'Enter' && query.length > 3) {
      e.preventDefault();
      setIsLoading(true);
      const response = await fetch('/api/patients/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setPatients(data.patients);
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" px={6} py={4} borderBottom="1px" borderColor="gray.200">
        <Heading size="lg" color="blue.500">
          Finni Health
        </Heading>
      </Box>
      <Box p={6}>
        <Flex mb={4} gap={4} justifyContent={'space-between'}>
          <Button colorScheme="blue" onClick={handleAddPatient} size="md">
            + Add Patient
          </Button>
          <InputGroup width="500px" margin="auto">
            <InputLeftElement children={<LuSearch />} />
            <Input
              name="search"
              placeholder="Search patients... (e.g., 'active patients in New York')"
              onChange={e => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </InputGroup>
          <Button width="8.75em" size="md" visibility="hidden"></Button>
        </Flex>

        <Flex gap={6} align="flex-start">
          <Box flex={1} minW="350px">
            <PatientList
              isLoading={isLoading}
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
