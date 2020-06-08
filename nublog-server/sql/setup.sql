-- create table users

CREATE TYPE user_role_t AS ENUM ('admin', 'reader');

CREATE TABLE users(
    id SERIAL NOT NULL PRIMARY KEY,
    role user_role_t NOT NULL,
    name VARCHAR(256) NOT NULL,
    email VARCHAR(256) NOT NULL,
    avatar_url VARCHAR(512) NOT NULL,
    profile_url VARCHAR(512) NOT NULL,
    github_token VARCHAR(512)
);

----------------------------------

-- create table articles

CREATE TABLE articles(
    id SERIAL NOT NULL PRIMARY KEY,
    article_key VARCHAR(256) NOT NULL UNIQUE,
    title VARCHAR(256) NOT NULL,
    author VARCHAR(256) NOT NULL,
    content TEXT NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION set_update_at() RETURNS TRIGGER AS $articles$
BEGIN
    NEW.update_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$articles$ LANGUAGE plpgsql;

CREATE TRIGGER articles_update_at BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE PROCEDURE set_update_at();

----------------------------------

-- create table tags

CREATE TABLE tags(
    id SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(128) NOT NULL UNIQUE
);

-- article tag n:n

CREATE TABLE articles_tags_relation(
    article_id INTEGER NOT NULL REFERENCES articles(id),
    tag_id INTEGER NOT NULL REFERENCES tags(id),
    PRIMARY KEY (article_id, tag_id)
);

--------------------------------

-- create table comments

CREATE TABLE comments(
    id SERIAL NOT NULL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    reply_to INTEGER REFERENCES comments(id),
    create_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--------------------------------
