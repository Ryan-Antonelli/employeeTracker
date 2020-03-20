const mysql = require("mysql");
const inquirer = require("inquirer");

var deptID;
var roleID;
var managerID;

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306   
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "spulgorth",
    database: "employee_trackerDB"
  });

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    start();    
});

function start() {
    inquirer
      .prompt({
        name: "Add",
        type: "list",
        message: "Would you like to add a new [DEPT], [ROLE], [EMPLOYEE], or [EXIT]?",
        choices:["DEPT", "ROLE", "EMPLOYEE", "EXIT"]
      })
      .then(function(answer) {
        if (answer.Add === "DEPT") {
          addDept();
        }
        else if (answer.Add === "ROLE") {
          addRole();
        }
        else if (answer.Add === "EMPLOYEE") {
          addEmployee();
        }
        else if (answer.Add === "EXIT") {
          connection.end();
        }        
        else {
          connection.end();
        }
      })
}

function addDept() {
    inquirer
      .prompt([
        {
          name: "name",
          type: "input",
          message: "What is the name of the new department?"
        }
      ])
      .then(function(answer){
        connection.query(
          "INSERT INTO department SET ?",
          {
            name: answer.name
          },
          function(err) {
            if (err) throw err;
            console.log("Department successfully added.")
            start();
          }
        )
      })
}

function addRole() {
  inquirer
    .prompt([
      {
        name: "title",
        type: "input",
        message: "What is the title of the new role?"
      },
      {
        name: "salary",
        type: "input",
        message: "What is the starting salary of the new role?"
      },
      {
        name: "department_id",
        type: "input",
        message: "Into which department will the role be inserted?"
      }
    ])
    .then(function(answer) {
      
      var roleDept = answer.department_id;
      
      connection.query(`SELECT id FROM department WHERE name = "${roleDept}"`, function(err, results){
        if (err) throw err;
        deptID = results[0].id;
        passer(deptID);
      })

      function passer(deptID) {  
        connection.query(
          "INSERT INTO role SET ?",
          {
            title: answer.title,
            salary: answer.salary,
            department_id: deptID
          },
          function(err) {
            if (err) throw err;
            console.log("Role successfully added.")
            start();
          }
        )
      }  
    })
}

function addEmployee() {
  inquirer
    .prompt([
      {
        name: "first_name",
        type: "input",
        message: "What is the first name of the employee?"
      },
      {
        name: "last_name",
        type: "input",
        message: "What is the last name of the employee?"
      },
      {
        name: "role_id",
        type: "input",
        message: "What is the name of the employee's role?"
      },
      {
        name: "manager_id_first",
        type: "input",
        message: "What is the first name of the employee's manager?"
      },
      {
        name: "manager_id_last",
        type: "input",
        message: "What is the last name of the employee's manager?"
      },
    ])
    .then(function(answer) {
      
      var manFirst = answer.manager_id_first;
      var manLast = answer.manager_id_last;
      var role = answer.role_id;
      
      connection.query(`SELECT id FROM role WHERE title = "${role}"`, function(err, results){
        if (err) throw err;
        
        else if (results.length === 0) {
          console.log("invalid role, please enter valid data");
          start();
        }
        // console.log(results);
        roleID = results[0].id;        
        passerB(roleID);
      })

      // finds manager ID using first and last name
      connection.query(`SELECT id FROM employee WHERE (first_name = "${manFirst}" AND last_name = "${manLast}")`, function(err, results){
        if (err) throw err;
        
        else if (results.length === 0) {
          console.log("invalid manager name, please re-enter valid data");
          start();
        }
        
        // console.log(results);
        managerID = results[0].id;
        passerB(managerID);
      })

      function passerB(roleID, managerID) {  
        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: answer.first_name,
            last_name: answer.last_name,
            role_id: roleID,
            manager_id: managerID
          },
          function(err) {
            if (err) throw err;
            console.log("Employee successfully added.");
            start();
          }
        )
      }  
    })
}