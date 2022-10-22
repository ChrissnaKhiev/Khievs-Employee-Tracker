DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT, FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL
);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT, FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE SET NULL,
    manager_id INT, FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL
);
SOURCE db/seeds.sql;
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('test', 'test', 1, 1);