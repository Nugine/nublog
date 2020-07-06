CREATE TABLE articles(
    id SERIAL NOT NULL PRIMARY KEY,
    url_key VARCHAR(256) NOT NULL UNIQUE,
    title VARCHAR(256) NOT NULL,
    author VARCHAR(256) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();



CREATE TABLE users(
    id SERIAL NOT NULL PRIMARY KEY,
    role_code INTEGER NOT NULL CONSTRAINT users_role_code_check CHECK (role_code BETWEEN 0 AND 1),
    name VARCHAR(256) NOT NULL UNIQUE,
    email VARCHAR(256) NOT NULL,
    avatar_url VARCHAR(512) NOT NULL,
    profile_url VARCHAR(512) NOT NULL,
    github_token VARCHAR(512),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions(
    id UUID NOT NULL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
