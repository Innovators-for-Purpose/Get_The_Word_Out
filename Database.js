import sqlite3 from 'sqlite3';


//const baseURL = "http://localhost:3000";

let db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });

  /*const users = [
  { name: "Josh Smith", email: "josh.smith@example.com" },
  { name: "Jane Doe", email: "jane.doe@example.com" },
];

const Computer_Help = [
  {
    title: "Printer not working",
    description:
      "I can not figure out how to print"

  }
];

const Book_Help = [
  {
    title: "Can't find book",
    description:
      "I need help finding a book"
   
  }
  
];
*/

