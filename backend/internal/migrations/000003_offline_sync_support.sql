-- Add client event id for offline sync 
ALTER TABLE user_progress
ADD COLUMN client_event_id UUID;

-- Ensure progress submissions that can performed multiple times without results getting changed
CREATE UNIQUE INDEX idx_user_progress_event
ON user_progress(student_id, client_event_id);