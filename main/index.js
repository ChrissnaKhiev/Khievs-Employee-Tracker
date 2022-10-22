const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();
require('console.table');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    }
  ).promise();

const con = mysql.createConnection(
{
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}
);
const menu = [
    {
        type: 'list',
        message: "What would you like to do?",
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department'],
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

function viewEmployees() {
    const sql = `
SELECT 
    e.id, 
    e.first_name, 
    e.last_name, 
    r.title, 
    d.name AS department, 
    r.salary,
    CONCAT (m.first_name, " ", m.last_name) AS manager
FROM employee e 
LEFT JOIN role r ON e.role_id = r.id 
LEFT JOIN department d ON r.department_id = d.id
LEFT JOIN employee m ON e.manager_id = m.id;`;
    con.query(sql, (err, res) => {
        if (err) {return err;}
        else {console.table(res);}
        init();
    });
}
const roleChoices = async () => {
    const sql = `SELECT id AS value, title AS name FROM role;`;
    const roles = await db.query(sql);
    return roles[0];
}
const managerChoices = async () => {
    const sql = `SELECT id AS value, CONCAT (first_name, " ", last_name) AS name FROM employee;`;
    const managers = await db.query(sql);
    return managers[0];
}

async function addEmployee() {
    const roles = await roleChoices();
    const managers = await managerChoices();
    inquirer.prompt([
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
            choices: roles,
            name: 'role'
        },
        {
            type: 'list',
            message: "Who is the employee's manager?",
            name: 'manager',
            choices: managers,
        },
    ])
    .then((data) => {
        const fName = data.first_name;
        const lName = data.last_name;
        const role = data.role;
        const manager = data.manager;
        db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [fName, lName, role, manager], (err, res) => {
            if (err) {console.log(err);}
            else {console.table(res);}
        });
        init();
    }
    )
}

async function updateEmployeeRole() {
    const roles = await roleChoices();
    const managers = await managerChoices();
    inquirer.prompt([
        {
            type: 'list',
            message: "Which employee's role do you want to update?",
            name: 'employee',
            choices: managers
        },
        {
            type: 'list',
            message: "Which role do you want to assign the selected employee?",
            name: 'role',
            choices: roles
        }
    ])
    .then((data) => {
        const role = data.role;
        const employee = data.employee;
        db.query('UPDATE employee SET role_id = ? WHERE id = ?', [role, employee], (err, res) => {
            if (err) {console.log(err);}
            else {console.table(res);}
        });
        init();
    }
    )
}

function viewRoles() {
    const sql = `SELECT 
    r.id, 
    r.title, 
    d.name AS department, 
    r.salary 
    FROM role r
    INNER JOIN department d ON r.department_id = d.id`;
    con.query(sql, (err, res) => {
        if (err) {return err;}
        else {console.table(res);}
        init();
    });
}

const departmentChoices = async () => {
    const sql = `SELECT id AS value, name FROM department;`;
    const departments = await db.query(sql);
    return departments[0];
};

async function addRole() {
    inquirer.prompt([
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
            choices: await departmentChoices(),
            name: 'department'
        },
    ])
    .then((data) => {
        const title = data.title;
        const salary = data.salary;
        const department = data.department;
        db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, department], (err, res) => {
            if (err) {return err;}
            else {console.table(res);}})
        init();
    })
}

function viewDepartments() {
    const sql = `SELECT * FROM department`;
    con.query(sql, (err, res) => {
        if (err) {return err;}
        else {console.table(res);}
        init();
    });
}

function addDepartment() {
    inquirer.prompt(departmentBuild)
    .then((data) => {
        const name = data.name;
        db.query('INSERT INTO department (name) VALUES (?)', [name], (err, res) => {
            if (err) {return err;}
            else {console.table(res);}})
        init();
    })
}

function init() {
    inquirer.prompt(menu)
    .then((data) => {
        switch(data.choice){
            case 'View All Employees':
                viewEmployees();
                break;
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
