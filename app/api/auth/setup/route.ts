import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Check if a password already exists
    const checkResult = await pool.query('SELECT id FROM auth_settings WHERE id = 1');
    
    let result;
    if (checkResult.rows.length > 0) {
      // Update existing password
      result = await pool.query(
        'UPDATE auth_settings SET password_hash = $1, updated_at = NOW() WHERE id = 1 RETURNING id',
        [hashedPassword]
      );
    } else {
      // Create new password entry
      result = await pool.query(
        'INSERT INTO auth_settings (id, password_hash) VALUES (1, $1) RETURNING id',
        [hashedPassword]
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Password setup successful' 
    });

  } catch (error) {
    console.error('Password setup error:', error);
    return NextResponse.json(
      { error: 'Failed to set up password' },
      { status: 500 }
    );
  }
}