import { Patient, StatusUpdate } from '@/types/patient';
import type { NextApiResponse } from 'next';
import {
  validateName,
  validateAddress,
  validateDateOfBirth,
  validateStatus,
} from '@/utils/validation';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

export type PatientApiResponse = {
  message: string;
  patients: Patient[];
  patient: Patient | null;
};

export type StatusUpdateRow = {
  id: string;
  patient_id: string;
  status: string;
  created_at: string;
};

export type PatientRow = {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  status: string;
  address: string;
  provider_id: string;
  status_update: StatusUpdateRow[];
};

function validatePatientData(patient: any): string | undefined {
  let error: string | undefined;
  error = validateName(patient.firstName || '', 'first name');
  if (error) return error;
  if (patient.middleName !== null && patient.middleName !== undefined) {
    error = validateName(patient.middleName, 'middle name');
    if (error) return error;
  }
  error = validateName(patient.lastName || '', 'last name');
  if (error) return error;
  error = validateDateOfBirth(patient.dateOfBirth || '');
  if (error) return error;
  error = validateAddress(patient.address || '');
  if (error) return error;
  error = validateStatus(patient.status || '');
  if (error) return error;
  return undefined;
}

function mapStatusUpdateRow(s: StatusUpdateRow): StatusUpdate {
  return {
    id: s.id,
    patientId: s.patient_id,
    status: s.status as StatusUpdate['status'],
    createdAt: s.created_at,
  };
}

export function mapPatientRow(p: PatientRow): Patient {
  return {
    id: p.id,
    firstName: p.first_name,
    middleName: p.middle_name,
    lastName: p.last_name,
    dateOfBirth: p.date_of_birth,
    status: p.status as Patient['status'],
    address: p.address,
    providerId: p.provider_id,
    statusHistory: ((p.status_update as StatusUpdateRow[]) || []).map(
      mapStatusUpdateRow
    ),
  };
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<PatientApiResponse>
) {
  const { user, supabase } = req;
  if (req.method === 'GET') {
    // read all patients and status updates from database
    const { data, error } = await supabase
      .from('patients')
      .select('*, status_update(*)');

    if (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({
        message: `Error fetching patients`,
        patients: [],
        patient: null,
      });
      return;
    }

    const patients: Patient[] = ((data as unknown as PatientRow[]) || []).map(
      mapPatientRow
    );

    res.status(200).json({
      message: 'Patients fetched successfully',
      patients,
      patient: null,
    });
  } else if (req.method === 'POST') {
    // add patient and status update to database
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!patient) {
      res.status(400).json({
        message: 'Missing patient data',
        patients: [],
        patient: null,
      });
      return;
    }

    const validationError = validatePatientData(patient);
    if (validationError) {
      console.error('Validation error:', validationError, patient);
      res.status(400).json({
        message: validationError,
        patients: [],
        patient: null,
      });
      return;
    }
    // add patient to database
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .insert([
        {
          first_name: patient.firstName,
          middle_name: patient.middleName,
          last_name: patient.lastName,
          date_of_birth: patient.dateOfBirth,
          status: patient.status,
          address: patient.address,
          provider_id: user.id,
        },
      ])
      .select();

    if (patientError) {
      console.error('Error adding patient:', patientError);
      res.status(500).json({
        message: 'Error adding patient',
        patients: [],
        patient: null,
      });
      return;
    }
    if (!patientData || patientData.length === 0) {
      console.error('Patient was not created as expected:', patientData);
      res.status(500).json({
        message: 'Patient was not created as expected',
        patients: [],
        patient: null,
      });
      return;
    }
    const newPatient: Patient = mapPatientRow(patientData[0]);

    // add status update to database
    const { data: statusUpdateData, error: statusUpdateError } = await supabase
      .from('status_update')
      .insert([{ patient_id: newPatient.id, status: newPatient.status }])
      .select();

    if (
      statusUpdateError ||
      !statusUpdateData ||
      statusUpdateData.length === 0
    ) {
      console.error(
        'Error adding status update:',
        statusUpdateError,
        statusUpdateData
      );
      res.status(500).json({
        message: 'Error adding status update',
        patients: [],
        patient: null,
      });
      return;
    }
    const newStatusUpdate: StatusUpdate = {
      id: statusUpdateData[0].id as string,
      patientId: statusUpdateData[0].patient_id as string,
      status: statusUpdateData[0].status as StatusUpdate['status'],
      createdAt: statusUpdateData[0].created_at as string,
    };

    res.status(201).json({
      message: 'Patient added successfully',
      patients: [],
      patient: { ...newPatient, statusHistory: [newStatusUpdate] },
    });
  } else if (req.method === 'PUT') {
    // update in database
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!patient) {
      res.status(400).json({
        message: 'Missing patient data',
        patients: [],
        patient: null,
      });
      return;
    }

    const validationError = validatePatientData(patient);
    if (validationError) {
      console.error('Validation error:', validationError, patient);
      res.status(400).json({
        message: validationError,
        patients: [],
        patient: null,
      });
      return;
    }

    // add status update to database
    if (patient.isStatusUpdate) {
      const { data: statusUpdateData, error: statusUpdateError } =
        await supabase
          .from('status_update')
          .insert([
            {
              patient_id: patient.id,
              status: patient.status,
            },
          ])
          .select();
      if (
        statusUpdateError ||
        !statusUpdateData ||
        statusUpdateData.length === 0
      ) {
        console.error(
          'Error updating status update:',
          statusUpdateError,
          statusUpdateData
        );
        res.status(500).json({
          message: 'Error updating status update',
          patients: [],
          patient: null,
        });
        return;
      }
    }

    // update patient in database
    const { data: updatedPatient, error: patientError } = await supabase
      .from('patients')
      .update({
        first_name: patient.firstName,
        middle_name: patient.middleName,
        last_name: patient.lastName,
        date_of_birth: patient.dateOfBirth,
        status: patient.status,
        address: patient.address,
      })
      .eq('id', patient.id)
      .select('*, status_update(*)')
      .single();

    if (patientError) {
      console.error('Error updating patient:', patientError);
      res.status(500).json({
        message: 'Error updating patient',
        patients: [],
        patient: null,
      });
      return;
    }
    if (!updatedPatient) {
      console.error('Patient not found during update:', updatedPatient);
      res.status(404).json({
        message: 'Patient not found',
        patients: [],
        patient: null,
      });
      return;
    }
    res.status(200).json({
      message: 'Patient updated successfully',
      patients: [],
      patient: mapPatientRow(updatedPatient),
    });
  } else if (req.method === 'DELETE') {
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!patient.id) {
      console.error('Patient ID is required:', patient);
      res.status(400).json({
        message: 'Patient ID is required',
        patients: [],
        patient: null,
      });
      return;
    }
    // delete status updates first
    const { error: statusUpdateError } = await supabase
      .from('status_update')
      .delete()
      .eq('patient_id', patient.id);

    if (statusUpdateError) {
      console.error('Error deleting status update:', statusUpdateError);
      res.status(500).json({
        message: 'Error deleting status update',
        patients: [],
        patient: null,
      });
      return;
    }

    // delete patient
    const { data: deletedPatient, error: patientError } = await supabase
      .from('patients')
      .delete()
      .eq('id', patient.id)
      .select('*, status_update(*)')
      .single();

    if (patientError) {
      console.error('There was an error deleting the patient:', patientError);
      res.status(500).json({
        message: 'There was an error deleting the patient',
        patients: [],
        patient: null,
      });
      return;
    }
    if (!deletedPatient) {
      console.error('Patient not found during delete:', deletedPatient);
      res.status(404).json({
        message: 'There was an error deleting the patient',
        patients: [],
        patient: null,
      });
      return;
    }

    res.status(200).json({
      message: 'Patient deleted successfully',
      patients: [],
      patient: mapPatientRow(deletedPatient),
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    console.error(`Method ${req.method} Not Allowed`);
    res.status(405).json({
      message: `Method ${req.method} Not Allowed`,
      patients: [],
      patient: null,
    });
  }
}

export default withAuth(handler);
