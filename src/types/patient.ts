export interface Patient {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  status: 'Inquiry' | 'Onboarding' | 'Active' | 'Churned';
  address: string;
  providerId: string;
  statusUpdates: PatientStatusUpdate[];
}

export interface Provider {
  id: string;
  userName: string;
  password: string;
}

export interface PatientStatusUpdate {
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
