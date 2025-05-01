import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// PATCH: Update an option's completion status
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { optionId, isCompleted } = data;
    
    // Validate required fields
    if (optionId === undefined || isCompleted === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: optionId and isCompleted' },
        { status: 400 }
      );
    }
    
    // Update the option's completion status
    const query = `
      UPDATE location_options 
      SET is_completed = $1, 
          completed_at = $2,
          updated_at = NOW() 
      WHERE id = $3
      RETURNING *
    `;
    
    const completedAt = isCompleted ? new Date() : null;
    const result = await pool.query(query, [isCompleted, completedAt, optionId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Option not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      option: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating option:', error);
    return NextResponse.json(
      { error: 'Failed to update option' },
      { status: 500 }
    );
  }
}