import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

// Secret key for JWT - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'household-manager-secret-key';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Get the stored password hash from the database
    const result = await pool.query('SELECT password_hash FROM auth_settings WHERE id = 1');
    
    // Check if we have a stored password
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Authentication system not initialized' },
        { status: 500 }
      );
    }

    const storedHash = result.rows[0].password_hash;
    
    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, storedHash);

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create a JWT token
    const token = jwt.sign(
      { authenticated: true },
      JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Return the token
    return NextResponse.json({ 
      success: true,
      token 
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}