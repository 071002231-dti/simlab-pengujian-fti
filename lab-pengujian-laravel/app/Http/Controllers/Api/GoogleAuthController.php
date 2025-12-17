<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth
     */
    public function redirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Find user by google_id or email
            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if (!$user) {
                // Auto-register as customer for new users
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'role' => 'customer',
                    'password' => bcrypt(str()->random(32)),
                ]);
            } else {
                // Update google_id and avatar if needed
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            }

            // Create Sanctum token
            $token = $user->createToken('auth-token')->plainTextToken;

            // Redirect to frontend with token
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

            return redirect()->away("{$frontendUrl}/auth/callback?token={$token}");

        } catch (\Exception $e) {
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            return redirect()->away("{$frontendUrl}/login?error=" . urlencode($e->getMessage()));
        }
    }

    /**
     * Handle Google token from frontend (alternative flow)
     */
    public function handleToken(Request $request)
    {
        $request->validate([
            'credential' => 'required|string',
        ]);

        try {
            // Decode Google JWT token
            $credential = $request->credential;
            $tokenParts = explode('.', $credential);

            if (count($tokenParts) !== 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token format',
                ], 400);
            }

            $payload = json_decode(base64_decode($tokenParts[1]), true);

            if (!$payload || !isset($payload['email'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token payload',
                ], 400);
            }

            $email = $payload['email'];
            $googleId = $payload['sub'];
            $name = $payload['name'] ?? '';
            $avatar = $payload['picture'] ?? null;

            // Find user by google_id or email
            $user = User::where('google_id', $googleId)
                ->orWhere('email', $email)
                ->first();

            if (!$user) {
                // Auto-register as customer for new users
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $googleId,
                    'avatar' => $avatar,
                    'role' => 'customer',
                    'password' => bcrypt(str()->random(32)), // Random password (won't be used)
                ]);
            } else {
                // Update google_id and avatar if needed
                $user->update([
                    'google_id' => $googleId,
                    'avatar' => $avatar,
                ]);
            }

            // Create Sanctum token
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $user->avatar,
                    'lab_id' => $user->lab_id,
                    'lab' => $user->lab,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }
}
