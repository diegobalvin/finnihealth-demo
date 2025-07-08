const NameRegex = /^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/;
const NameMinLength = 2;
const NameMaxLength = 50;
const AddressMinLength = 5;
const AddressMaxLength = 200;
export const DateOfBirthMaxAge = 120;

export const validateName = (
  name: string,
  field: string
): string | undefined => {
  if (name && !name.trim()) return `A ${field} is required`;
  if (name.length < NameMinLength)
    return `A ${field} must be at least ${NameMinLength} characters`;
  if (name.length > NameMaxLength)
    return `A ${field} must be less than ${NameMaxLength} characters`;
  if (!NameRegex.test(name))
    return `A ${field} can only contain letters, spaces, hyphens, and apostrophes`;
  return undefined;
};

export const validateAddress = (address: string): string | undefined => {
  if (!address.trim()) return 'An address is required';
  if (address.length < AddressMinLength)
    return `An address must be at least ${AddressMinLength} characters`;
  if (address.length > AddressMaxLength)
    return `An address must be less than ${AddressMaxLength} characters`;
  return undefined;
};

export const validateDateOfBirth = (date: string): string | undefined => {
  if (!date) return 'Date of birth is required';
  const selectedDate = new Date(date);
  const today = new Date();
  if (selectedDate > today) return 'Date of birth cannot be in the future';

  if (
    selectedDate <
    new Date(
      today.getFullYear() - DateOfBirthMaxAge,
      today.getMonth(),
      today.getDate()
    )
  )
    return 'Date of birth seems invalid';
  return undefined;
};

export const validateStatus = (status: string): string | undefined => {
  if (!status) return 'Status is required';
  return undefined;
};
