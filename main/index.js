const inquirer = require('inquirer');
const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    }
  ).promise();
const menu = [
    {
        type: 'list',
        message: "What would you like to do?",
        choices: ['Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department'],
        name: 'choice'
    }
]
const departmentBuild = [
    {
        type: 'input',
        message: "What is the name of the department?",
        name: 'name'
    }
]
const roleBuild = [
    {
        type: 'input',
        message: "What is the name of the role?",
        name: 'title'
    },
    {
        type: 'input',
        message: "What is the salary of the role?",
        name: 'salary'
    },
    {
        type: 'list',
        message: "What department does the role belong to?",
        choices: [`SELECT name FROM department`],
        name: 'department'
    },
]
const employeeBuild = [
    {
        type: 'input',
        message: "What is the employee's first name?",
        name: 'first_name'
    },
    {
        type: 'input',
        message: "What is the employee's last name?",
        name: 'last_name'
    },
    {
        type: 'list',
        message: "What is the employee's role?",
        choices: [`SELECT title FROM role`],
        name: 'role'
    },
    {
        type: 'list',
        message: "Who is the employee's manager?",
        choices: [`SELECT id FROM employee`],
        name: 'manager'
    }
]

function addEmployee() {
    inquirer.prompt(employeeBuild)
    .then((data) => {
        const fName = data.first_name;
        const lName = data.last_name;
        const role = data.role;
        const manager = data.manager;
        db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [fName, lName, role, manager], (err, res) => {
            if (err) return res.json({error: err});
        });
    })
}

function viewRoles() {
    db.query('SELECT * FROM role', (err, res) => {
        if (err) return res.json({error: err});
    });
}

function addRole() {
    inquirer.prompt(roleBuild)
    .then((data) => {
        const title = data.title;
        const salary = data.salary;
        const department = data.department;
        db.query('INSERT INTO employee (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, department], (err, res) => {
            if (err) return res.json({error: err});
        });
    })
}

function viewDepartments() {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) return res.json({error: err});
    });
}

function addDepartment() {
    inquirer.prompt(departmentBuild)
    .then((data) => {
        const name = data.name;
        db.query('INSERT INTO employee (name) VALUES (?)', [name], (err, res) => {
            if (err) return res.json({error: err});
        });
    })
}

async function init() {
    await inquirer.prompt(menu)
    .then((data) => {
        switch(data.choice){
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'View All Departments':
                viewDepartments();
                break;
            case 'Add Department':
                addDepartment();
                break;
        }
    })
}

init();