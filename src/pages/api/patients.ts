import { Patient } from '@/types/patient';
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  message: string;
  patients: Patient[];
};

let patients: Patient[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date().toISOString(),
    status: 'Active',
    address: '123 Main St, Anytown, USA',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Doe',
    dateOfBirth: new Date().toISOString(),
    status: 'Active',
    address: '123 Main St, Anytown, USA',
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'GET') {
    // read from database
    res
      .status(200)
      .json({ message: 'Patients fetched successfully', patients });
  } else if (req.method === 'POST') {
    // write to database
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    patients.push(patient);

    res.status(200).json({ message: 'Patient added successfully', patients });
  } else if (req.method === 'PUT') {
    // update in database
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const index = patients.findIndex(p => p.id === patient.id);

    if (index === -1) {
      res.status(404).json({ message: 'Patient not found', patients });
      return;
    }

    patients[index] = patient;

    res.status(200).json({ message: 'Patient updated successfully', patients });
  } else if (req.method === 'DELETE') {
    // delete from database
    const patient =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const index = patients.findIndex(p => p.id === patient.id);

    if (index === -1) {
      res.status(404).json({ message: 'Patient not found', patients });
      return;
    }

    patients.splice(index, 1);
    res.status(200).json({ message: 'Patient deleted successfully', patients });
  }
}
