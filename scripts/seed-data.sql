-- Insert sample users
INSERT INTO users (id, username, email, password_hash) VALUES
('1', 'john_doe', 'john@example.com', '$2b$10$hash1'),
('2', 'jane_smith', 'jane@example.com', '$2b$10$hash2'),
('3', 'bob_wilson', 'bob@example.com', '$2b$10$hash3'),
('4', 'alice_brown', 'alice@example.com', '$2b$10$hash4');

-- Insert sample channels
INSERT INTO channels (id, name, description, created_by) VALUES
('1', 'general', 'General discussion for the team', '1'),
('2', 'random', 'Random conversations and fun stuff', '1'),
('3', 'development', 'Development discussions and updates', '2'),
('4', 'design', 'Design reviews and creative discussions', '3'),
('5', 'announcements', 'Important team announcements', '1');

-- Insert channel memberships
INSERT INTO channel_members (id, channel_id, user_id) VALUES
('1', '1', '1'),
('2', '1', '2'),
('3', '1', '3'),
('4', '2', '1'),
('5', '2', '4'),
('6', '3', '2'),
('7', '3', '3'),
('8', '4', '3'),
('9', '4', '4'),
('10', '5', '1'),
('11', '5', '2'),
('12', '5', '3'),
('13', '5', '4');

-- Insert sample messages
INSERT INTO messages (id, content, user_id, channel_id) VALUES
('1', 'Welcome to the general channel! 👋', '1', '1'),
('2', 'Thanks! Excited to be here and start collaborating.', '2', '1'),
('3', 'Let\'s build something amazing together! 🚀', '1', '1'),
('4', 'Has anyone seen the latest design mockups?', '3', '1'),
('5', 'Yes, they look great! Alice did an excellent job.', '2', '1'),
('6', 'Anyone up for a coffee break? ☕', '1', '2'),
('7', 'Count me in! I need a caffeine boost.', '4', '2'),
('8', 'The new API endpoints are ready for testing', '2', '3'),
('9', 'Great! I\'ll start the integration tests today.', '3', '3'),
('10', 'Team meeting at 3 PM today. Please join the video call.', '1', '5');
