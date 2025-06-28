export function getStatusColorScheme(status: string): string {
  switch (status) {
    case 'Inquiry':
      return 'blue';
    case 'Onboarding':
      return 'orange';
    case 'Active':
      return 'green';
    case 'Churned':
      return 'red';
    default:
      return 'gray';
  }
}
