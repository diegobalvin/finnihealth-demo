'use client';

import React from 'react';
import PatientDashboard from '@/components/PatientDashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Home(): React.JSX.Element {
  return (
    <ProtectedRoute>
      <PatientDashboard />
    </ProtectedRoute>
  );
}
