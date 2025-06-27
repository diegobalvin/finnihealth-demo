import { Patient } from '@/types/patient';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

type ResponseData = {
  message: string;
  patients?: Patient[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'GET') {
    // read from database

    const { data: items, error } = await supabase.from('patients').select('*');
    if (error) {
      res.status(500).json({ message: 'Error fetching items', patients: [] });
      return;
    }
    const patients = items.map((item: any) => ({
      id: item.id,
      firstName: item.first_name,
      lastName: item.last_name,
      dateOfBirth: item.date_of_birth,
      status: item.status,
      address: item.address,
    }));
    res
      .status(200)
      .json({ message: 'Patients fetched successfully', patients });
  } else if (req.method === 'POST') {
    // write to database
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const { data, error } = await supabase
      .from('patients')
      .insert([
        {
          id: patient.id,
          first_name: patient.firstName,
          middle_name: patient.middleName,
          last_name: patient.lastName,
          date_of_birth: patient.dateOfBirth,
          status: patient.status,
          address: patient.address,
        },
      ])
      .select();

    if (error) {
      res.status(500).json({ message: 'Error adding patient', patients: [] });
      return;
    }
    res.status(200).json({
      message: 'Patient added successfully',
      patients: data.map((item: any) => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        dateOfBirth: item.date_of_birth,
        status: item.status,
        address: item.address,
      })),
    });
  } else if (req.method === 'PUT') {
    // update in database
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const { error } = await supabase
      .from('patients')
      .update({
        first_name: patient.firstName,
        middle_name: patient.middleName,
        last_name: patient.lastName,
        date_of_birth: patient.dateOfBirth,
        status: patient.status,
        address: patient.address,
      })
      .eq('id', patient.id);

    if (error) {
      res.status(500).json({ message: 'Error updating patient', patients: [] });
      return;
    }
    res.status(200).json({ message: 'Patient updated successfully' });
  } else if (req.method === 'DELETE') {
    // delete from database
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patient.id);

    if (error) {
      res.status(500).json({ message: 'Error deleting patient', patients: [] });
      return;
    }

    res.status(200).json({
      message: 'Patient deleted successfully',
    });
  }
}
