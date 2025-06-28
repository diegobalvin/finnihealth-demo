import { Patient, StatusUpdate } from '@/types/patient';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

type ResponseData = {
  message: string;
  patients?: Patient[];
  patient?: Patient;
};

const hasRequiredFields = (patient: Patient): boolean => {
  return Boolean(
    patient.firstName &&
      patient.lastName &&
      patient.dateOfBirth &&
      patient.status &&
      patient.address &&
      patient.providerId
  );
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'GET') {
    // read all patients and status updates from database
    const { data, error } = await supabase
      .from('patients')
      .select('*, status_update(*)');

    if (error) {
      res.status(500).json({ message: `Error fetching patients` });
      return;
    }

    const patients = data.map((p: any) => ({
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      dateOfBirth: p.date_of_birth,
      status: p.status,
      address: p.address,
      providerId: p.provider_id,
      statusUpdates: p.status_update,
    }));

    res
      .status(200)
      .json({ message: 'Patients fetched successfully', patients });
  } else if (req.method === 'POST') {
    // add patient and status update to database
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!hasRequiredFields(patient)) {
      res.status(400).json({ message: 'Missing required patient fields' });
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
          provider_id: patient.providerId,
        },
      ])
      .select();

    if (patientError) {
      res.status(500).json({ message: 'Error adding patient' });
      return;
    }
    if (!patientData || patientData.length === 0) {
      res.status(500).json({ message: 'Patient was not created as expected' });
      return;
    }
    const newPatient: Patient = {
      id: patientData[0].id,
      firstName: patientData[0].first_name,
      lastName: patientData[0].last_name,
      dateOfBirth: patientData[0].date_of_birth,
      status: patientData[0].status,
      address: patientData[0].address,
      providerId: patientData[0].provider_id,
      statusUpdates: [],
    };
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
      res.status(500).json({ message: 'Error adding status update' });
      return;
    }
    const newStatusUpdate: StatusUpdate = {
      id: statusUpdateData[0].id,
      patientId: statusUpdateData[0].patient_id,
      status: statusUpdateData[0].status,
      createdAt: statusUpdateData[0].created_at,
    };

    res.status(201).json({
      message: 'Patient added successfully',
      patient: { ...newPatient, statusUpdates: [newStatusUpdate] },
    });
  } else if (req.method === 'PUT') {
    // update in database
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!hasRequiredFields(patient)) {
      res.status(400).json({ message: 'Missing required patient fields' });
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
        res.status(500).json({ message: 'Error updating status update' });
        return;
      }
    }

    // update patient in database
    const { data: patientData, error: patientError } = await supabase
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
      .select('*, status_update(*)');

    if (patientError) {
      res.status(500).json({ message: 'Error updating patient' });
      return;
    }
    if (!patientData || patientData.length === 0 || !patientData[0]) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }
    const updatedPatient: Patient = {
      id: patientData[0].id,
      firstName: patientData[0].first_name,
      lastName: patientData[0].last_name,
      dateOfBirth: patientData[0].date_of_birth,
      status: patientData[0].status,
      address: patientData[0].address,
      providerId: patientData[0].provider_id,
      statusUpdates: patientData[0].status_update,
    };
    res.status(200).json({
      message: 'Patient updated successfully',
      patient: updatedPatient,
    });
  } else if (req.method === 'DELETE') {
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!patient.id) {
      res.status(400).json({ message: 'Patient ID is required' });
      return;
    }
    // delete status updates first
    const { error: statusUpdateError } = await supabase
      .from('status_update')
      .delete()
      .eq('patient_id', patient.id);

    if (statusUpdateError) {
      res.status(500).json({ message: 'Error deleting status update' });
      return;
    }

    // delete patient
    const { data: deletedPatients, error: patientError } = await supabase
      .from('patients')
      .delete()
      .eq('id', patient.id)
      .select('*, status_update(*)');

    if (patientError) {
      res.status(500).json({ message: 'Error deleting patient' });
      return;
    }
    if (!deletedPatients || deletedPatients.length === 0) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    const deletedPatient: Patient = {
      id: deletedPatients[0].id,
      firstName: deletedPatients[0].first_name,
      lastName: deletedPatients[0].last_name,
      dateOfBirth: deletedPatients[0].date_of_birth,
      status: deletedPatients[0].status,
      address: deletedPatients[0].address,
      providerId: deletedPatients[0].provider_id,
      statusUpdates: deletedPatients[0].status_update,
    };

    res.status(200).json({
      message: 'Patient deleted successfully',
      patient: deletedPatient,
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
