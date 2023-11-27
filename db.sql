DROP DATABASE IF EXISTS `daniel`;
CREATE DATABASE IF NOT EXISTS `daniel` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `daniel`;

  CREATE TABLE IF NOT EXISTS `users` (
    `email` varchar(100) NOT NULL PRIMARY KEY,
    `name` varchar(50) NOT NULL,
    `role` VARCHAR(30) NOT NULL default 'usuClie',
    `password` varchar(255) NOT NULL
  );

insert into `users` values ('daniel@gmail.com','daniel','usuTien','123');
insert into `users` values ('aiko@gmail.com','aiko','usuClie','123');

select * from users;