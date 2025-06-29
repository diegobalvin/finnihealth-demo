import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import PatientForm from './PatientForm';
import { PatientFormData } from '@/types/patient';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('PatientForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnFormDataChange = jest.fn();
  const defaultFormData: Partial<PatientFormData> = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    status: undefined,
    address: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render form fields when open', () => {
    renderWithChakra(
      <PatientForm
        isOpen={true}
        formData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  test('should not render when closed', () => {
    renderWithChakra(
      <PatientForm
        isOpen={false}
        formData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
  });

  test('should show validation errors for invalid data', async () => {
    renderWithChakra(
      <PatientForm
        isOpen={true}
        formData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    });
  });

  test('should submit valid form data', async () => {
    const validFormData: Partial<PatientFormData> = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      status: 'Active',
      address: '123 Main St',
    };

    renderWithChakra(
      <PatientForm
        isOpen={true}
        formData={validFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  test('should call onCancel when cancel button is clicked', () => {
    renderWithChakra(
      <PatientForm
        isOpen={true}
        formData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('should pre-populate form with patient data when provided', () => {
    const patientData: Partial<PatientFormData> = {
      firstName: 'Jane',
      middleName: 'Marie',
      lastName: 'Smith',
      dateOfBirth: '1985-05-15',
      status: 'Inquiry',
      address: '456 Oak Ave',
    };

    renderWithChakra(
      <PatientForm
        isOpen={true}
        formData={patientData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Marie')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1985-05-15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('456 Oak Ave')).toBeInTheDocument();
  });

  test('should clear validation errors when form is opened', async () => {
    const { rerender } = renderWithChakra(
      <PatientForm
        isOpen={false}
        formData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Open form
    rerender(
      <ChakraProvider>
        <PatientForm
          isOpen={true}
          formData={defaultFormData}
          onFormDataChange={mockOnFormDataChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </ChakraProvider>
    );

    // Trigger validation errors
    const submitButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });

    // Close and reopen form
    rerender(
      <ChakraProvider>
        <PatientForm
          isOpen={false}
          formData={defaultFormData}
          onFormDataChange={mockOnFormDataChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </ChakraProvider>
    );

    rerender(
      <ChakraProvider>
        <PatientForm
          isOpen={true}
          formData={defaultFormData}
          onFormDataChange={mockOnFormDataChange}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </ChakraProvider>
    );

    // Errors should be cleared
    expect(
      screen.queryByText(/first name is required/i)
    ).not.toBeInTheDocument();
  });
});
