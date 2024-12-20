-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    partner_id BIGINT REFERENCES delivery_partners(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON assignments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON assignments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON assignments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX idx_assignments_order_id ON assignments(order_id);
CREATE INDEX idx_assignments_partner_id ON assignments(partner_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_created_at ON assignments(created_at);
