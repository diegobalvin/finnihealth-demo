import { createMocks } from 'node-mocks-http';
import { PatientApiResponse } from './patients';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock validation functions
jest.mock('@/utils/validation', () => ({
  validateName: jest.fn(),
  validateAddress: jest.fn(),
  validateDateOfBirth: jest.fn(),
  validateStatus: jest.fn(),
}));

describe('/api/patients', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/patients', () => {
    test('should return all patients successfully', async () => {
      jest.resetModules();
      const mockFrom = jest.fn();
      require('@supabase/supabase-js').createClient.mockReturnValue({
        from: mockFrom,
      });
      const handler = require('./patients').default;
      const mockPatients = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-01-01',
          status: 'Active',
          address: '123 Main St',
          provider_id: 'provider1',
          status_update: [],
        },
      ];
      const { req, res } = createMocks({
        method: 'GET',
      });
      const mockSelect = jest.fn().mockResolvedValue({
        data: mockPatients,
        error: null,
      });
      mockFrom.mockReturnValue({ select: mockSelect });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(200);
      const data: PatientApiResponse = JSON.parse(res._getData());
      expect(data.message).toBe('Patients fetched successfully');
      expect(data.patients).toHaveLength(1);
      expect(data.patients[0].firstName).toBe('John');
    });

    test('should handle database errors', async () => {
      jest.resetModules();
      const mockFrom = jest.fn();
      require('@supabase/supabase-js').createClient.mockReturnValue({
        from: mockFrom,
      });
      const handler = require('./patients').default;
      const { req, res } = createMocks({
        method: 'GET',
      });
      const mockSelect = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });
      mockFrom.mockReturnValue({ select: mockSelect });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(500);
      const data: PatientApiResponse = JSON.parse(res._getData());
      expect(data.message).toBe('Error fetching patients');
    });
  });

  describe('POST /api/patients', () => {
    test('should create patient successfully', async () => {
      jest.resetModules();
      const mockFrom = jest.fn();
      require('@supabase/supabase-js').createClient.mockReturnValue({
        from: mockFrom,
      });
      const handler = require('./patients').default;
      const newPatient = {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1985-05-15',
        status: 'Inquiry',
        address: '456 Oak Ave',
        providerId: 'provider1',
      };
      const { req, res } = createMocks({
        method: 'POST',
        body: newPatient,
      });
      const mockValidation = require('@/utils/validation');
      mockValidation.validateName.mockReturnValue(undefined);
      mockValidation.validateAddress.mockReturnValue(undefined);
      mockValidation.validateDateOfBirth.mockReturnValue(undefined);
      mockValidation.validateStatus.mockReturnValue(undefined);
      const mockPatientsSelect = jest.fn().mockResolvedValue({
        data: [
          {
            id: '2',
            first_name: 'Jane',
            last_name: 'Smith',
            date_of_birth: '1985-05-15',
            status: 'Inquiry',
            address: '456 Oak Ave',
            provider_id: 'provider1',
          },
        ],
        error: null,
      });
      const mockStatusUpdateSelect = jest.fn().mockResolvedValue({
        data: [{ id: 'status1', patient_id: '2', status: 'Inquiry' }],
        error: null,
      });
      mockFrom.mockImplementation(tableName => {
        if (tableName === 'patients') {
          return {
            insert: jest.fn().mockReturnValue({ select: mockPatientsSelect }),
          };
        } else if (tableName === 'status_update') {
          return {
            insert: jest
              .fn()
              .mockReturnValue({ select: mockStatusUpdateSelect }),
          };
        }
        return {};
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(201);
      const data: PatientApiResponse = JSON.parse(res._getData());
      expect(data.message).toBe('Patient added successfully');
      expect(data.patient?.firstName).toBe('Jane');
    });

    test('should reject invalid patient data', async () => {
      jest.resetModules();
      const invalidPatient = {
        firstName: '',
        lastName: 'A',
        dateOfBirth: '2025-01-01',
        status: 'Inquiry',
        address: '123',
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: invalidPatient,
      });

      // Mock validation to fail
      const mockValidation = require('@/utils/validation');
      mockValidation.validateName.mockReturnValue('A first name is required');

      await require('./patients').default(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data: PatientApiResponse = JSON.parse(res._getData());
      expect(data.message).toBe('A first name is required');
    });

    test('should handle missing patient data', async () => {
      jest.resetModules();
      const { req, res } = createMocks({
        method: 'POST',
        body: undefined,
      });

      // Manually set body to null to trigger the missing patient check
      req.body = null;

      await require('./patients').default(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data: PatientApiResponse = JSON.parse(res._getData());
      expect(data.message).toBe('Missing patient data');
    });
  });

  describe('PUT /api/patients', () => {
    test('should update patient successfully', async () => {
      jest.resetModules();
      const mockFrom = jest.fn();
      require('@supabase/supabase-js').createClient.mockReturnValue({
        from: mockFrom,
      });
      const handler = require('./patients').default;
      const updatedPatient = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe Updated',
        dateOfBirth: '1990-01-01',
        status: 'Active',
        address: '123 Main St Updated',
        isStatusUpdate: false,
      };
      const { req, res } = createMocks({
        method: 'PUT',
        body: updatedPatient,
      });
      const mockValidation = require('@/utils/validation');
      mockValidation.validateName.mockReturnValue(undefined);
      mockValidation.validateAddress.mockReturnValue(undefined);
      mockValidation.validateDateOfBirth.mockReturnValue(undefined);
      mockValidation.validateStatus.mockReturnValue(undefined);
      const mockPatientsSingle = jest.fn().mockResolvedValue({
        data: { ...updatedPatient },
        error: null,
      });
      const mockPatientsSelect = jest
        .fn()
        .mockReturnValue({ single: mockPatientsSingle });
      const mockPatientsEq = jest
        .fn()
        .mockReturnValue({ select: mockPatientsSelect });
      mockFrom.mockImplementation(tableName => {
        if (tableName === 'patients') {
          return {
            update: jest.fn().mockReturnValue({ eq: mockPatientsEq }),
          };
        }
        return {};
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(200);
      const data: PatientApiResponse = JSON.parse(res._getData());
      expect(data.message).toBe('Patient updated successfully');
    });

    test('should handle status update', async () => {
      jest.resetModules();
      const mockFrom = jest.fn();
      require('@supabase/supabase-js').createClient.mockReturnValue({
        from: mockFrom,
      });
      const handler = require('./patients').default;
      const patientWithStatusUpdate = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        status: 'Churned',
        address: '123 Main St',
        isStatusUpdate: true,
      };
      const { req, res } = createMocks({
        method: 'PUT',
        body: patientWithStatusUpdate,
      });
      const mockValidation = require('@/utils/validation');
      mockValidation.validateName.mockReturnValue(undefined);
      mockValidation.validateAddress.mockReturnValue(undefined);
      mockValidation.validateDateOfBirth.mockReturnValue(undefined);
      mockValidation.validateStatus.mockReturnValue(undefined);
      const mockStatusUpdateSelect = jest.fn().mockResolvedValue({
        data: [{ id: 'status1', patient_id: '1', status: 'Churned' }],
        error: null,
      });
      const mockPatientsSingle = jest.fn().mockResolvedValue({
        data: { ...patientWithStatusUpdate, status_update: [] },
        error: null,
      });
      const mockPatientsSelect = jest
        .fn()
        .mockReturnValue({ single: mockPatientsSingle });
      const mockPatientsEq = jest
        .fn()
        .mockReturnValue({ select: mockPatientsSelect });
      mockFrom.mockImplementation(tableName => {
        if (tableName === 'status_update') {
          return {
            insert: jest
              .fn()
              .mockReturnValue({ select: mockStatusUpdateSelect }),
          };
        } else if (tableName === 'patients') {
          return {
            update: jest.fn().mockReturnValue({ eq: mockPatientsEq }),
          };
        }
        return {};
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(200);
      const data: PatientApiResponse = JSON.parse(res._getData());
      expect(data.message).toBe('Patient updated successfully');
    });
  });

  describe('DELETE /api/patients', () => {
    test('should delete patient successfully', async () => {
      jest.resetModules();
      const mockFrom = jest.fn();
      require('@supabase/supabase-js').createClient.mockReturnValue({
        from: mockFrom,
      });
      const handler = require('./patients').default;
      const { req, res } = createMocks({
        method: 'DELETE',
        body: { id: '1' },
      });
      const mockPatientsSingle = jest.fn().mockResolvedValue({
        data: { id: '1', first_name: 'John', status_update: [] },
        error: null,
      });
      const mockPatientsSelect = jest
        .fn()
        .mockReturnValue({ single: mockPatientsSingle });
      const mockPatientsEq = jest
        .fn()
        .mockReturnValue({ select: mockPatientsSelect });
      const mockStatusUpdateEq = jest.fn().mockResolvedValue({ error: null });
      mockFrom.mockImplementation(tableName => {
        if (tableName === 'status_update') {
          return {
            delete: jest.fn().mockReturnValue({ eq: mockStatusUpdateEq }),
          };
        } else if (tableName === 'patients') {
          return {
            delete: jest.fn().mockReturnValue({ eq: mockPatientsEq }),
          };
        }
        return {};
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(200);
      const data: PatientApiResponse = JSON.parse(res._getData());
      expect(data.message).toBe('Patient deleted successfully');
    });

    test('should reject delete without ID', async () => {
      jest.resetModules();
      const { req, res } = createMocks({
        method: 'DELETE',
        body: {},
      });

      await require('./patients').default(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data: PatientApiResponse = JSON.parse(res._getData());
      expect(data.message).toBe('Patient ID is required');
    });

    test('should handle database errors during delete', async () => {
      jest.resetModules();
      const mockFrom = jest.fn();
      require('@supabase/supabase-js').createClient.mockReturnValue({
        from: mockFrom,
      });
      const handler = require('./patients').default;
      const { req, res } = createMocks({
        method: 'DELETE',
        body: { id: '1' },
      });
      const mockPatientsSingle = jest
        .fn()
        .mockResolvedValue({ error: { message: 'Database error' } });
      const mockPatientsSelect = jest
        .fn()
        .mockReturnValue({ single: mockPatientsSingle });
      const mockPatientsEq = jest
        .fn()
        .mockReturnValue({ select: mockPatientsSelect });
      const mockStatusUpdateEq = jest.fn().mockResolvedValue({ error: null });
      mockFrom.mockImplementation(tableName => {
        if (tableName === 'status_update') {
          return {
            delete: jest.fn().mockReturnValue({ eq: mockStatusUpdateEq }),
          };
        } else if (tableName === 'patients') {
          return {
            delete: jest.fn().mockReturnValue({ eq: mockPatientsEq }),
          };
        }
        return {};
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(500);
      const data: PatientApiResponse = JSON.parse(res._getData());
      expect(data.message).toBe('There was an error deleting the patient');
    });
  });

  describe('Method not allowed', () => {
    test('should reject unsupported methods', async () => {
      jest.resetModules();
      const { req, res } = createMocks({
        method: 'PATCH',
      });

      await require('./patients').default(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data: PatientApiResponse = JSON.parse(res._getData());
      expect(data.message).toBe('Method PATCH Not Allowed');
    });
  });
});
