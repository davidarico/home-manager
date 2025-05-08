import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import pool from '@/lib/db';

// Secret key for JWT - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'household-manager-secret-key';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Check if the auth settings have been initialized
    const result = await pool.query('SELECT password_hash FROM auth_settings WHERE id = 1');

    // If no password exists yet, we need to set one up
    if (result.rows.length === 0) {
      // Special case for the initial setup detection
      if (password === 'check-setup-only') {
        return NextResponse.json(
          { error: 'Authentication system not initialized' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Authentication system not initialized. Please set up a password first.' },
        { status: 500 }
      );
    }

    // Skip password verification for the setup check
    if (password === 'check-setup-only') {
      return NextResponse.json({ message: 'Authentication system is initialized' });
    }

    // Verify the password
    const storedHash = result.rows[0].password_hash;
    const isValid = await bcrypt.compare(password, storedHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT({ authenticated: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Set token to expire in 7 days
      .sign(secret);

    return NextResponse.json({
      token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}