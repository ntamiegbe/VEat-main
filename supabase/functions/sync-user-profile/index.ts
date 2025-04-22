// User profile synchronization edge function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';
import { corsHeaders, handleCors, addCorsHeaders } from '../_shared/cors.ts';
import { ErrorCode, APIResponse, UserProfileData } from '../_shared/types.ts';

serve(async (req) => {
    // Handle CORS preflight requests
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
            throw new Error('Missing environment variables');
        }

        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
        const { pathname } = new URL(req.url);

        // Handle GET request for user profile data
        if (req.method === 'GET' && pathname === '/sync-user-profile') {
            // Get the token from the Authorization header
            const authHeader = req.headers.get('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return handleUnauthorized();
            }

            const token = authHeader.split(' ')[1];

            // Get the user from the token
            const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

            if (userError || !user) {
                console.error('Error getting user:', userError);
                return handleUnauthorized();
            }

            // Get user profile data from public.users table
            const { data: profileData, error: profileError } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Error fetching profile:', profileError);
                return handleServerError('Failed to fetch user profile');
            }

            // Return success with data
            const userData: UserProfileData = {
                id: user.id,
                email: user.email,
                ...profileData,
            };

            // If profile doesn't exist yet but we have user metadata, format it nicely
            if (!profileData && user.user_metadata) {
                const metadata = user.user_metadata;

                // Try to extract name from various potential sources in metadata
                if (metadata.full_name) {
                    userData.full_name = metadata.full_name;
                } else if (metadata.name) {
                    userData.full_name = metadata.name;
                } else if (metadata.first_name && metadata.last_name) {
                    userData.full_name = `${metadata.first_name} ${metadata.last_name}`;
                } else if (metadata.given_name && metadata.family_name) {
                    userData.full_name = `${metadata.given_name} ${metadata.family_name}`;
                }

                // Try to get phone
                if (metadata.phone) {
                    userData.phone_number = metadata.phone;
                } else if (metadata.phone_number) {
                    userData.phone_number = metadata.phone_number;
                }

                // Try to get profile image
                if (metadata.avatar_url) {
                    userData.profile_image_url = metadata.avatar_url;
                } else if (metadata.picture) {
                    userData.profile_image_url = metadata.picture;
                }
            }

            const successResponse: APIResponse = {
                success: true,
                message: 'User profile retrieved successfully',
                data: userData
            };

            return addCorsHeaders(new Response(
                JSON.stringify(successResponse),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            ));
        }

        // Handle POST request to update user profile data
        if (req.method === 'POST' && pathname === '/sync-user-profile') {
            // Get the token from the Authorization header
            const authHeader = req.headers.get('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return handleUnauthorized();
            }

            const token = authHeader.split(' ')[1];

            // Get the user from the token
            const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

            if (userError || !user) {
                console.error('Error getting user:', userError);
                return handleUnauthorized();
            }

            // Get the profile data from the request
            const profileData: Partial<UserProfileData> = await req.json();

            // Don't allow changing the user ID
            if (profileData.id && profileData.id !== user.id) {
                const errorResponse: APIResponse = {
                    success: false,
                    message: 'Cannot change user ID',
                    code: ErrorCode.INVALID_INPUT,
                    status: 400
                };

                return addCorsHeaders(new Response(
                    JSON.stringify(errorResponse),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                ));
            }

            // Set the user ID to ensure we're updating the correct record
            profileData.id = user.id;

            // Check if user exists in the public.users table
            const { data: existingProfile, error: checkError } = await supabaseClient
                .from('users')
                .select('id')
                .eq('id', user.id)
                .single();

            let updateError;

            if (!existingProfile) {
                // User doesn't exist in public.users table, create a new record
                const { error } = await supabaseClient
                    .from('users')
                    .insert(profileData);

                updateError = error;
            } else {
                // User exists, update the record
                const { error } = await supabaseClient
                    .from('users')
                    .update(profileData)
                    .eq('id', user.id);

                updateError = error;
            }

            if (updateError) {
                console.error('Error updating profile:', updateError);
                return handleServerError('Failed to update user profile');
            }

            // Update user metadata in auth.users if email or full_name was provided
            const authUpdates: Record<string, any> = {};

            if (profileData.email) {
                authUpdates.email = profileData.email;
            }

            if (profileData.full_name) {
                authUpdates.user_metadata = {
                    ...user.user_metadata,
                    full_name: profileData.full_name
                };
            }

            if (Object.keys(authUpdates).length > 0) {
                const { error: authUpdateError } = await supabaseClient.auth.admin.updateUserById(
                    user.id,
                    authUpdates
                );

                if (authUpdateError) {
                    console.error('Error updating auth user:', authUpdateError);
                    // Continue anyway as the public.users table was updated successfully
                }
            }

            // Return success
            const successResponse: APIResponse = {
                success: true,
                message: 'User profile updated successfully'
            };

            return addCorsHeaders(new Response(
                JSON.stringify(successResponse),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            ));
        }

        // Return 404 for unknown routes
        const notFoundResponse: APIResponse = {
            success: false,
            message: 'Not found',
            code: ErrorCode.NOT_FOUND,
            status: 404
        };

        return addCorsHeaders(new Response(
            JSON.stringify(notFoundResponse),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        ));

    } catch (error) {
        // Handle errors
        console.error('Error:', error.message);
        return handleServerError('Internal server error');
    }
});

// Helper function for unauthorized responses
function handleUnauthorized(): Response {
    const errorResponse: APIResponse = {
        success: false,
        message: 'Unauthorized',
        code: ErrorCode.UNAUTHORIZED,
        status: 401
    };

    return addCorsHeaders(new Response(
        JSON.stringify(errorResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
    ));
}

// Helper function for server error responses
function handleServerError(message: string): Response {
    const errorResponse: APIResponse = {
        success: false,
        message,
        code: ErrorCode.SERVER_ERROR,
        status: 500
    };

    return addCorsHeaders(new Response(
        JSON.stringify(errorResponse),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    ));
} 