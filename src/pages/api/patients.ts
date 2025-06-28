import { Patient } from '@/types/patient';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

type ResponseData = {
  message: string;
  patients: Patient[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'GET') {
    // read all patients and status updates from database
    const { data: items, error } = await supabase
      .from('patients')
      .select('*, status_update(*)');

    if (error) {
      res
        .status(500)
        .json({ message: `Error fetching items: ${error}`, patients: [] });
      return;
    }

    const patients = items.map((item: any) => ({
      id: item.id,
      firstName: item.first_name,
      lastName: item.last_name,
      dateOfBirth: item.date_of_birth,
      status: item.status,
      address: item.address,
      providerId: item.provider_id,
      statusUpdates: item.status_update,
    }));

    res
      .status(200)
      .json({ message: 'Patients fetched successfully', patients });
  } else if (req.method === 'POST') {
    // add patient and status update to database
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

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

    if (patientError || !patientData || patientData.length === 0) {
      res.status(500).json({ message: 'Error adding patient', patients: [] });
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
    const { data: statusUpdateData, error: statusUpdateError } = await supabase
      .from('status_update')
      .insert([{ patient_id: newPatient.id, status: newPatient.status }])
      .select();

    if (
      statusUpdateError ||
      !statusUpdateData ||
      statusUpdateData.length === 0
    ) {
      res.status(500).json({
        message: 'Error adding status update',
        patients: [],
      });
      return;
    }
    const newStatusUpdate = {
      patientId: statusUpdateData[0].patient_id,
      status: statusUpdateData[0].status,
      createdAt: statusUpdateData[0].created_at,
    };

    res.status(200).json({
      message: 'Patient added successfully',
      patients: [{ ...newPatient, statusUpdates: [newStatusUpdate] }],
    });
  } else if (req.method === 'PUT') {
    // update in database
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

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
        res
          .status(500)
          .json({ message: 'Error updating status update', patients: [] });
        return;
      }
    }

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
      res.status(500).json({ message: 'Error updating patient', patients: [] });
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
      patients: [updatedPatient],
    });
  } else if (req.method === 'DELETE') {
    // delete from database
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const { error: statusUpdateError } = await supabase
      .from('status_update')
      .delete()
      .eq('patient_id', patient.id);

    if (statusUpdateError) {
      res
        .status(500)
        .json({ message: 'Error deleting status update', patients: [] });
      return;
    }

    const { error: patientError } = await supabase
      .from('patients')
      .delete()
      .eq('id', patient.id);

    if (patientError) {
      res.status(500).json({ message: 'Error deleting patient', patients: [] });
      return;
    }

    res.status(200).json({
      message: 'Patient deleted successfully',
      patients: [],
    });
  }
}
