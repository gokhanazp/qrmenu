-- Allow anonymous users to insert scan events (public menu tracking)
CREATE POLICY "Allow public insert on scan_events"
ON scan_events
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to insert scan events
CREATE POLICY "Allow authenticated insert on scan_events"
ON scan_events
FOR INSERT
TO authenticated
WITH CHECK (true);