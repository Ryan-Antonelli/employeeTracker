const mysql = require("mysql");
const inquirer = require("inquirer");

var deptID;
var roleID;
var managerID;

var connection = mysql.createConnection({
    host: "localhost",
  
    //port   
    port: 3306,
  
    //username
    user: "root",
  
    //password
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
        message: "Would you like to add a new [DEPT], [ROLE], [EMPLOYEE], view a [DEPT], [ROLE], or [EMPLOYEE], change an employee [ROLE], or [EXIT]?",
        choices:["DEPT", "ROLE", "EMPLOYEE", new inquirer.Separator(), "VIEW_DEPT", "VIEW_ROLE", "VIEW_EMPLOYEE", new inquirer.Separator(), "CHANGE_ROLE", new inquirer.Separator(), "EXIT"]
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
        else if (answer.Add === "VIEW_DEPT") {
          viewDept();
        }     
        else if (answer.Add === "VIEW_ROLE") {
          viewRole();
        }  
        else if (answer.Add === "VIEW_EMPLOYEE") {
          viewEmployee();
        }  
        else if (answer.Add === "CHANGE_ROLE") {
          changeRole();
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

function viewDept() {
  inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "What is the name of the department you would like to view?"
      }
    ])
    .then(function(answer){
      connection.query(
        `SELECT * FROM department WHERE name = "${answer.name}"`,
        
        function(err, results) {
          if (err) throw err;
          console.log(results);
          start();
        }
      )
    })
}

function viewRole() {
  inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "What is the name of the role you would like to view?"
      }
    ])
    .then(function(answer){
      connection.query(
        `SELECT * FROM role WHERE name = "${answer.name}"`,
        
        function(err, results) {
          if (err) throw err;
          
          else if (results.length === 0) {
            console.log("specified role not found")
            start();
          };
          
          console.log(results);
          start();
        }
      )
    })
}

function viewEmployee() {
  inquirer
    .prompt([
      {
        name: "firstName",
        type: "input",
        message: "What is the christian name of the employee you would like to view?"
      },
      {
        name: "lastName",
        type: "input",
        message: "What is the family name of the employee you would like to view?"
      }
    ])
    .then(function(answer){
      connection.query(
        `SELECT * FROM employee WHERE (first_name = "${answer.firstName}" AND last_name = "${answer.lastName}")`,
        
        function(err, results) {
          if (err) throw err;
          
          else if (results.length === 0) {
            console.log("specified employee not found")
            start();
          };
          
          console.log(results);
          start();
        }
      )
    })
}

function changeRole() {
  inquirer
    .prompt([
      {
        name: "firstName",
        type: "input",
        message: "What is the christian name of the employee changing roles?"
      },
      {
        name: "lastName",
        type: "input",
        message: "What is the family name of the employee changing roles?"
      },
      {
        name: "newRole",
        type: "input",
        message: "What is the name of the employee's new role?"
      }
    ])
    .then(function(answer){
      connection.query(
       `SELECT id FROM role WHERE title = "${answer.newRole}"`,
       function(err, results) {
        if (err) throw err;
        
        else if (results.length === 0) {
          console.log("specified employee or role not found")
          start();
        };
        
        let newRoleID = results[0].id;
        console.log(newRoleID);
        roleUpdate(newRoleID);
      }
      )
      
      function roleUpdate(newRoleID) {
        console.log(answer.firstName);
        connection.query(
          `UPDATE employee SET role_id = "${newRoleID}" WHERE (first_name = "${answer.firstName}" AND last_name = "${answer.lastName}")`,
          
            function(err, results) {
              if (err) throw err;
              
              else if (results.length === 0) {
                console.log("employee or role not found. Please enter valid data")
                start();
              };
              
              console.log(results);
              start();
            }
        )
      }
    })
}