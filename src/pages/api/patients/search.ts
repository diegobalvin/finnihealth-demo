import { NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Patient } from '../../../types/patient';
import { PatientRow, mapPatientRow } from '../patients';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { DateOfBirthMaxAge } from '@/utils/validation';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function getGroqCompletion(query: string) {
  const model = genAI.getGenerativeModel({
    model: 'models/gemini-1.5-flash-8b',
  });

  const prompt = `
    You are an API that converts natural language search queries from a medical provider into a structured JSON object for database filtering.
    Analyze the user's query and extract the relevant filters.

    The possible fields to filter on are:
    - "firstName" (string): The first name of the patient.
    - "middleName" (string): The middle name of the patient.
    - "lastName" (string): The last name of the patient.
    - "location" (object with "city": string, "state": string, "stateAbbreviation": string, "zipCode": string, "address": string): A city, state, state abbreviation, zip code, or part of an address.
    - "ageRange" (object with "startAge": number, and "endAge": number): age range for the patient
    - "hasMiddleName" (boolean): Whether the provider is asking if a patient has or does not have a middle name.
    - "status" (one of 'Inquiry', 'Onboarding', 'Active', 'Churned'): current status of the patient
    - "statusUpdatedAt" (object with "start": timestampz, and "end": timestampz): date range for when the patient's status was updated

    If you only find one name, include that name as firstName and lastName and middleName in the output.

    If you find a state, include the state abbreviation in the output.

    When the query uses "over [age]" or "above [age]", interpret this as "age [startAge] and older" (inclusive of the specified age). 
    
    When a query mentions kids, or any similar word, interpret this as "age 0 to 18".

    When a query mentions elderly, or any similar word, interpret this as "age 65 and older".

    If an endAge is implied but not specified, use ${DateOfBirthMaxAge} as the endAge.

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

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { supabase } = req;
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
      const nameFilter: string[] = [];

      if (filters.firstName)
        nameFilter.push(`first_name.ilike.%${filters.firstName}%`);
      if (filters.lastName)
        nameFilter.push(`last_name.ilike.%${filters.lastName}%`);
      if (filters.middleName)
        nameFilter.push(`middle_name.ilike.%${filters.middleName}%`);

      supabaseQuery = supabaseQuery.or(nameFilter.join(','));
    }
    if (filters.hasMiddleName === false) {
      supabaseQuery = supabaseQuery.is('middle_name', null);
    } else if (filters.hasMiddleName === true) {
      supabaseQuery = supabaseQuery.not('middle_name', 'is', null);
    }

    if (filters.location) {
      const { address, city, state, stateAbbreviation, zipCode } =
        filters.location;
      const addressFilter: string[] = [];

      if (city) addressFilter.push(`address.ilike.%${city}%`);
      if (state) addressFilter.push(`address.ilike.%${state}%`);
      if (stateAbbreviation)
        addressFilter.push(`address.ilike.%${stateAbbreviation}%`);
      if (zipCode) addressFilter.push(`address.ilike.%${zipCode}%`);
      if (address) addressFilter.push(`address.ilike.%${address}%`);
      supabaseQuery = supabaseQuery.or(addressFilter.join(','));
    }
    if (filters.status) {
      supabaseQuery = supabaseQuery.eq('status', filters.status);
    }
    if (filters.ageRange) {
      const { startAge, endAge } = filters.ageRange;
      const today = new Date();

      // The earliest birth date (oldest person in range)
      const earliestBirthDate = new Date(today);
      earliestBirthDate.setFullYear(today.getFullYear() - endAge - 1);
      earliestBirthDate.setDate(earliestBirthDate.getDate() + 1); // Add 1 day to make it inclusive

      // The latest birth date (youngest person in range)
      const latestBirthDate = new Date(today);
      latestBirthDate.setFullYear(today.getFullYear() - startAge);

      supabaseQuery = supabaseQuery
        .gte('date_of_birth', earliestBirthDate.toISOString())
        .lte('date_of_birth', latestBirthDate.toISOString());
    }

    if (filters.statusUpdate) {
      // TODO: This is should handle specific use cases
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Error fetching patients from Supabase:', error);
      return res.status(500).json({ message: 'Error fetching patients' });
    }

    const patients: Patient[] = ((data as unknown as PatientRow[]) || []).map(
      mapPatientRow
    );
    res.status(200).json({ patients });
  } catch (error) {
    console.error('Error processing search:', error);
    res.status(500).json({ message: 'Error processing search query' });
  }
}

export default withAuth(handler);
