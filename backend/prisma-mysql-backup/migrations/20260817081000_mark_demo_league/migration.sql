-- Mark the seeded league competition so /liga keeps working after deploy.
UPDATE `Competition` SET `isLeague` = 1 WHERE `slug` = 'druga-liga-fbih';
