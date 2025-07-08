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
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithEmail, signInWithGoogle, loading, error, clearError } =
    useAuthActions();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const result = await signInWithEmail({ email, password });
    if (result.success) {
      router.push('/');
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    await signInWithGoogle();
  };

  return (
    <Box maxW="400px" w="full">
      <VStack spacing={6}>
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Sign In
        </Text>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box w="full">
          <form onSubmit={handleEmailLogin}>
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
                  placeholder="Enter your password"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="orange"
                w="full"
                isLoading={loading}
                isDisabled={!email || !password}
              >
                Sign In
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
          onClick={handleGoogleLogin}
          isLoading={loading}
        >
          Continue with Google
        </Button>

        <VStack spacing={2}>
          <Link color="blue.500" fontSize="sm">
            Forgot your password?
          </Link>

          {onSwitchToRegister && (
            <Text fontSize="sm">
              Don't have an account?{' '}
              <Link color="blue.500" onClick={onSwitchToRegister}>
                Sign up
              </Link>
            </Text>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};
