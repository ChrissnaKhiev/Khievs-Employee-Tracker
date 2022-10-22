const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();
require('console.table');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'Kirby101$',
      database: 'employee_db'
    },
    console.log("Connected to mysql.")
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
    db.query(sql, (err, res) => {
        if (err) {return err;}
        else {console.table(res);}
        init();
    });
}

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
    const sql = `SELECT * FROM role`;
    db.query(sql, (err, res) => {
        if (err) {return err;}
        else {console.table(res);}
        init();
    });
}

function addRole() {
    const departmentChoices = async () => {
        const departments = await db.query('SELECT id AS value, name FROM department');
        return departments;
    };
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
            choices: [departmentChoices()],
            name: 'department'
        },
    ])
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
    const sql = `SELECT * FROM department`;
    db.query(sql, (err, res) => {
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
            if (err) return res.json({error: err})
            else console.log(res.json);
        });
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