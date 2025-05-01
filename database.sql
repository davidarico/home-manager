-- PostgreSQL database schema for Household Manager

-- Create rounds table to store daily rounds data
CREATE TABLE IF NOT EXISTS rounds (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(date)
);

-- Create location_checks table to store location checks
CREATE TABLE IF NOT EXISTS location_checks (
    id SERIAL PRIMARY KEY,
    round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    location_id VARCHAR(50) NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(round_id, location_id)
);

-- Create location_options table to store option selections for each location
CREATE TABLE IF NOT EXISTS location_options (
    id SERIAL PRIMARY KEY,
    location_check_id INTEGER NOT NULL REFERENCES location_checks(id) ON DELETE CASCADE,
    option_name VARCHAR(100) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_location_checks_round_id ON location_checks(round_id);
CREATE INDEX IF NOT EXISTS idx_location_options_location_check_id ON location_options(location_check_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at timestamp
CREATE TRIGGER update_location_checks_updated_at
BEFORE UPDATE ON location_checks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_options_updated_at
BEFORE UPDATE ON location_options
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();