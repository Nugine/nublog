DROP TYPE user_role_t;

DROP TABLE users CASCADE;

DROP TRIGGER articles_update_at ON articles;
DROP FUNCTION set_update_at();
DROP TABLE articles CASCADE;

DROP TABLE tags CASCADE;

DROP TABLE articles_tags_relation CASCADE;

DROP TABLE comments CASCADE;
