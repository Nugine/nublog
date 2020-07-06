DROP TRIGGER articles_updated_at ON articles;
DROP FUNCTION set_updated_at();
DROP TABLE articles CASCADE;

DROP TABLE users CASCADE;
DROP TABLE sessions CASCADE;
