import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { Patient } from '../../../types/patient';
import { PatientRow, mapPatientRow } from '../../../pages/api/patients';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function getGroqCompletion(query: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are an API that converts natural language search queries from a medical provider into a structured JSON object for database filtering.
    Analyze the user's query and extract the relevant filters.

    The possible fields to filter on are:
    - "firstName" (string): The first name of the patient.
    - "middleName" (string): The middle name of the patient.
    - "lastName" (string): The last name of the patient.
    - "location" (string): A city, state, state abbreviation, or part of an address.
    - "ageRange" (object with "operator": "<", ">", or "=", and "start": number, and "end": number): age range for the patient
    - "hasMiddleName" (boolean): Whether the query is asking if a patient has or does not have a middle name.
    - "status" (one of 'Inquiry', 'Onboarding', 'Active', 'Churned'): current status of the patient
    - "statusUpdatedAt" (object with "start": timestampz, and "end": timestampz): date range for when the patient's status was updated

    If you only find one name, include that name as firstName and lastName and middleName in the output.

    If you find a state, include the state abbreviation in the output.

    If a specific field is not mentioned, do not include it in the output.
    The user's query is: "${query}"

    Respond with ONLY the JSON object.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    // Clean the response to ensure it's valid JSON
    const jsonString = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to parse search query.');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { query } = req.body;

  if (!query || query.length < 3) {
    return res
      .status(400)
      .json({ message: 'Query must be at least 3 characters' });
  }

  try {
    const filters = await getGroqCompletion(query);

    console.log(filters);

    let supabaseQuery = supabase.from('patients').select('*, status_update(*)');

    if (filters.firstName || filters.lastName || filters.middleName) {
      supabaseQuery = supabaseQuery.or(
        `first_name.ilike.%${filters.firstName}%,last_name.ilike.%${filters.lastName}%,middle_name.ilike.%${filters.middleName}%`
      );
    }
    if (filters.hasMiddleName === false) {
      supabaseQuery = supabaseQuery.is('middle_name', null);
    } else if (filters.hasMiddleName === true) {
      supabaseQuery = supabaseQuery.not('middle_name', 'is', null);
    }

    if (filters.location) {
      supabaseQuery = supabaseQuery.ilike('address', `%${filters.location}%`);
    }
    if (filters.status) {
      supabaseQuery = supabaseQuery.eq('status', filters.status);
    }
    if (filters.ageRange) {
      // TODO: This is not working as expected.
      const { operator, start, end } = filters.ageRange;
      const startBirthYear = new Date().getFullYear() - start; // 0
      const startBirthDate = new Date(startBirthYear, 0, 1);
      const endBirthYear = new Date().getFullYear() - end; // 30
      const endBirthDate = new Date(endBirthYear, 0, 1);

      if (operator === '<') {
        supabaseQuery = supabaseQuery.gt(
          'date_of_birth',
          endBirthDate.toISOString() // 1990
        );
      } else if (operator === '>') {
        supabaseQuery = supabaseQuery.lt(
          'date_of_birth',
          startBirthDate.toISOString()
        );
      } else {
        supabaseQuery = supabaseQuery
          .gte('date_of_birth', startBirthDate.toISOString())
          .lt('date_of_birth', endBirthDate.toISOString());
      }
    }

    if (filters.statusUpdate) {
      // TODO: This is should handle specific use cases
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Error fetching patients from Supabase:', error);
      return res.status(500).json({ message: 'Error fetching patients' });
    }

    const patients: Patient[] = ((data as PatientRow[]) || []).map(
      mapPatientRow
    );
    res.status(200).json({ patients });
  } catch (error) {
    console.error('Error processing search:', error);
    res.status(500).json({ message: 'Error processing search query' });
  }
}
