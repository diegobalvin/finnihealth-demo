import { redirect } from 'next/navigation';

export default async function AuthCallbackPage() {
  // This page is hit after OAuth authentication
  // The user should be redirected to the main app
  redirect('/');
}