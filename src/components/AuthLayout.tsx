'use client';

import React from 'react';
import { Box, Center, Flex, Heading } from '@chakra-ui/react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh" bg="#fbf7f0">
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="100vh"
        p={4}
      >
        <Box mb={8}>
          <Heading size="lg" color="orange.500" textAlign="center">
            Finni Health
          </Heading>
        </Box>

        <Box
          bg="white"
          p={8}
          borderRadius="lg"
          boxShadow="lg"
          w="full"
          maxW="md"
        >
          <Center>{children}</Center>
        </Box>
      </Flex>
    </Box>
  );
};
