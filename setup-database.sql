-- Create database
CREATE DATABASE simple_cms;

-- Create user
CREATE USER cms_user WITH PASSWORD 'cms_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE simple_cms TO cms_user;

-- Connect to the database and grant schema privileges
\c simple_cms;
GRANT ALL ON SCHEMA public TO cms_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cms_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cms_user; 