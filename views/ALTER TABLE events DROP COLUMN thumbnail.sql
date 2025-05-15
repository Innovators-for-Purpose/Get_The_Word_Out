ALTER TABLE events DROP COLUMN thumbnail;
ALTER TABLE events ADD COLUMN `thumbnail` BLOB NULL;