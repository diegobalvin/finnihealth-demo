import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    `Missing Supabase environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}`
  );
}

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string;
    email: string;
  };
  supabase: ReturnType<typeof createClient<any, 'public', any>>;
}

export function withAuth(
  handler: (
    req: AuthenticatedRequest, // eslint-disable-line
    res: NextApiResponse // eslint-disable-line
  ) => Promise<void | NextApiResponse<any>>
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      // Get the authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          message: 'Missing or invalid authorization header',
          patients: [],
          patient: null,
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Create Supabase client with the user's token
      const supabase = createClient(supabaseUrl!, supabaseKey!, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      // Verify the user
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return res.status(401).json({
          message: 'Invalid or expired token',
          patients: [],
          patient: null,
        });
      }

      // Add user and authenticated supabase client to request
      const authenticatedRequest = req as AuthenticatedRequest;
      authenticatedRequest.user = {
        id: user.id,
        email: user.email || '',
      };
      authenticatedRequest.supabase = supabase;

      // Call the original handler
      await handler(authenticatedRequest, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        message: 'Internal server error',
        patients: [],
        patient: null,
      });
    }
  };
}
