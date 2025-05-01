import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Retrieve rounds data with optional date filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Base query to get rounds with their location checks and options
    let query = `
      SELECT 
        r.id AS round_id, 
        r.date, 
        r.created_at AS round_created_at,
        lc.id AS location_check_id,
        lc.location_id,
        lc.location_name,
        lc.notes,
        lo.id AS option_id,
        lo.option_name,
        lo.is_completed,
        lo.completed_at
      FROM rounds r
      LEFT JOIN location_checks lc ON r.id = lc.round_id
      LEFT JOIN location_options lo ON lc.id = lo.location_check_id
    `;
    
    const params: any[] = [];
    
    // Add date filtering if provided
    if (date) {
      query += ` WHERE r.date = $1`;
      params.push(date);
    }
    
    // Order by date (descending) and limit results
    query += ` ORDER BY r.date DESC`;
    
    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }
    
    const result = await pool.query(query, params);
    
    // Transform the flat results into a nested structure
    const rounds: Record<string, any> = {};
    
    result.rows.forEach(row => {
      // Initialize round if not exists
      if (!rounds[row.round_id]) {
        rounds[row.round_id] = {
          id: row.round_id,
          date: row.date,
          created_at: row.round_created_at,
          locations: {}
        };
      }
      
      const roundData = rounds[row.round_id];
      
      // Skip if no location data (empty round)
      if (!row.location_check_id) return;
      
      // Initialize location if not exists
      if (!roundData.locations[row.location_id]) {
        roundData.locations[row.location_id] = {
          id: row.location_check_id,
          location_id: row.location_id,
          name: row.location_name,
          notes: row.notes,
          options: []
        };
      }
      
      // Add option if it exists
      if (row.option_id) {
        const locationData = roundData.locations[row.location_id];
        
        // Check if this option is already added (avoid duplicates)
        const optionExists = locationData.options.some(
          (opt: any) => opt.id === row.option_id
        );
        
        if (!optionExists) {
          locationData.options.push({
            id: row.option_id,
            name: row.option_name,
            is_completed: row.is_completed,
            completed_at: row.completed_at
          });
        }
      }
    });
    
    // Convert to array
    const roundsArray = Object.values(rounds);
    
    // For each round, convert locations object to array
    roundsArray.forEach((round: any) => {
      round.locations = Object.values(round.locations);
    });
    
    return NextResponse.json({
      rounds: roundsArray,
      count: roundsArray.length
    });
    
  } catch (error) {
    console.error('Error fetching rounds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rounds' },
      { status: 500 }
    );
  }
}

// POST: Create or update a round for today
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    // Parse the request body
    const data = await request.json();
    const { locations } = data;
    
    await client.query('BEGIN');
    
    // Get or create today's round
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Check if a round already exists for today
    const roundResult = await client.query(
      'SELECT id FROM rounds WHERE date = $1',
      [today]
    );
    
    let roundId;
    
    if (roundResult.rows.length > 0) {
      // Round exists, use its ID
      roundId = roundResult.rows[0].id;
    } else {
      // Create a new round for today
      const newRoundResult = await client.query(
        'INSERT INTO rounds (date) VALUES ($1) RETURNING id',
        [today]
      );
      roundId = newRoundResult.rows[0].id;
    }
    
    // Process each location
    for (const locationId in locations) {
      const locationData = locations[locationId];
      const { name, notes, options } = locationData;
      
      // Check if this location check already exists
      const locationCheckResult = await client.query(
        'SELECT id FROM location_checks WHERE round_id = $1 AND location_id = $2',
        [roundId, locationId]
      );
      
      let locationCheckId;
      
      if (locationCheckResult.rows.length > 0) {
        // Location check exists, update it
        locationCheckId = locationCheckResult.rows[0].id;
        await client.query(
          'UPDATE location_checks SET notes = $1, updated_at = NOW() WHERE id = $2',
          [notes, locationCheckId]
        );
      } else {
        // Create new location check
        const newLocationCheckResult = await client.query(
          'INSERT INTO location_checks (round_id, location_id, location_name, notes) VALUES ($1, $2, $3, $4) RETURNING id',
          [roundId, locationId, name, notes]
        );
        locationCheckId = newLocationCheckResult.rows[0].id;
      }
      
      // First, remove all existing options for this location check to avoid duplicates
      await client.query(
        'DELETE FROM location_options WHERE location_check_id = $1',
        [locationCheckId]
      );
      
      // Then add all options from the request
      if (options && options.length > 0) {
        for (const option of options) {
          await client.query(
            'INSERT INTO location_options (location_check_id, option_name) VALUES ($1, $2)',
            [locationCheckId, option]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    
    return NextResponse.json({
      success: true,
      roundId,
      date: today
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating/updating round:', error);
    return NextResponse.json(
      { error: 'Failed to save round data' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}