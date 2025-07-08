'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Alert,
  AlertIcon,
  Text,
  Link,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { useAuthActions } from '@/hooks/useAuthActions';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const { signUpWithEmail, signInWithGoogle, loading, error, clearError } =
    useAuthActions();

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess(false);

    const result = await signUpWithEmail({ email, password, confirmPassword });
    if (result.success) {
      setSuccess(true);
    }
  };

  const handleGoogleSignUp = async () => {
    clearError();
    await signInWithGoogle();
  };

  if (success) {
    return (
      <Box maxW="400px" w="full">
        <VStack spacing={6}>
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Check Your Email
          </Text>

          <Alert status="success">
            <AlertIcon />
            We've sent you a confirmation link at {email}. Please check your
            email and click the link to verify your account.
          </Alert>

          {onSwitchToLogin && (
            <Text fontSize="sm">
              Already verified?{' '}
              <Link color="blue.500" onClick={onSwitchToLogin}>
                Sign in
              </Link>
            </Text>
          )}
        </VStack>
      </Box>
    );
  }

  return (
    <Box maxW="400px" w="full">
      <VStack spacing={6}>
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Create Your Account
        </Text>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box w="full">
          <form onSubmit={handleEmailRegister}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a password"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="orange"
                w="full"
                isLoading={loading}
                isDisabled={!email || !password || !confirmPassword}
              >
                Sign Up
              </Button>
            </VStack>
          </form>
        </Box>

        <HStack w="full">
          <Divider />
          <Text fontSize="sm" color="gray.500" px={2}>
            OR
          </Text>
          <Divider />
        </HStack>
        <Button
          leftIcon={<FaGoogle />}
          colorScheme="red"
          variant="outline"
          w="full"
          onClick={handleGoogleSignUp}
          isLoading={loading}
        >
          Continue with Google
        </Button>
        {onSwitchToLogin && (
          <Text fontSize="sm">
            Already have an account?{' '}
            <Link color="blue.500" onClick={onSwitchToLogin}>
              Sign in
            </Link>
          </Text>
        )}
      </VStack>
    </Box>
  );
};
