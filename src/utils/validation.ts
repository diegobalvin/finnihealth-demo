export const validateName = (
  name: string,
  field: string
): string | undefined => {
  if (!name.trim()) return `A ${field} is required`;
  if (name.length < 2) return `A ${field} must be at least 2 characters`;
  if (name.length > 50) return `A ${field} must be less than 50 characters`;
  if (!/^[a-zA-Z\s\-']+$/.test(name))
    return `A ${field} can only contain letters, spaces, hyphens, and apostrophes`;
  return undefined;
};

export const validateAddress = (address: string): string | undefined => {
  if (!address.trim()) return 'An address is required';
  if (address.length < 5) return 'An address must be at least 5 characters';
  if (address.length > 200)
    return 'An address must be less than 200 characters';
  return undefined;
};

export const validateDateOfBirth = (date: string): string | undefined => {
  if (!date) return 'Date of birth is required';
  const selectedDate = new Date(date);
  const today = new Date();
  if (selectedDate > today) return 'Date of birth cannot be in the future';
  if (selectedDate < new Date('1900-01-01'))
    return 'Date of birth seems invalid';
  return undefined;
};

export const validateStatus = (status: string): string | undefined => {
  if (!status) return 'Status is required';
  return undefined;
};
