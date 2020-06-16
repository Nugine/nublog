-- create table users

CREATE TABLE users(
    id SERIAL NOT NULL PRIMARY KEY,
    role_code INTEGER NOT NULL CONSTRAINT users_role_code_check CHECK (role_code BETWEEN 0 AND 1),
    name VARCHAR(256) NOT NULL UNIQUE,
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

CREATE OR REPLACE FUNCTION set_update_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.update_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_update_at BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE PROCEDURE set_update_at();

CREATE VIEW article_meta_view AS
SELECT 
    articles.id, article_key, title, author, create_at, update_at, 
    json_agg(json_build_object('id', tags.id,'name',tags.name)) AS tags
FROM
    articles JOIN articles_tags_relation relation JOIN tags
    ON relation.tag_id = tags.id
    ON relation.article_id = articles.id
GROUP BY articles.id

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

-- create table sessions

CREATE TABLE sessions(
    id UUID NOT NULL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    role_code INTEGER NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
