export interface Patient {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  status: 'Inquiry' | 'Onboarding' | 'Active' | 'Churned';
  address: string;
  providerId: string;
  statusHistory: StatusUpdate[];
}

// TODO: Add provider interface and login functionality
export interface Provider {
  id: string;
  emailAddress: string;
  password: string;
}

export interface StatusUpdate {
  id: string;
  patientId: string;
  status: 'Inquiry' | 'Onboarding' | 'Active' | 'Churned';
  createdAt: string;
}

export interface PatientFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  status: 'Inquiry' | 'Onboarding' | 'Active' | 'Churned';
  address: string;
}
