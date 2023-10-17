const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const databasePath = path.join(__dirname, "userData.db");
const app = express();

app.use(express.json());

let db = null;

const initializeDbandServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(4000, (request, response) =>
      console.log("Server Running at http://localhost:4000/")
    );
  } catch (error) {
    console.log(`DB error : ${error.message}`);
    process.exit(1);
  }
};

initializeDbandServer();

app.post("/register", async (request, response) => {
  let { username, name, password, gender, location } = request.body;
  let hasedPassword = await bcrypt.hash(response.body.password, 10);
  let userRegistration = `
    SELECT
    *
    FROM
    user
    WHERE username='${username}';`;
  let UserName = await db.get(userRegistration);

  if (UserName === undefined) {
    let userRegistering = `
        INSERT INTO
        user (username,name,password,gender,location)
        VALUES(
            '${username}',
            '${name}',
            '${hashedPassword}',
            '${gender}',
            '${location}'
        );`;
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      let newRegistration = await db.run(userRegistering);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const loginQuery = `
    SELECT
    *
    FROM
    user
    WHERE 
    username='${username}';`;
  const dbLogin = await db.get(loginQuery);

  if (dbLogin === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const hashedPassword = await bcrypt.compare(password, dbLogin.password);
    if (hashedPassword === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const updateQuery = `
    SELECT
    *
    FROM
    user
    WHERE
    username='${username}';`;
  const result = await db.get(updateQuery);
  if (result === undefined) {
    response.status(400);
    response.send("User not registered");
  } else {
    const hashedPassword = await bcrypt.compare(password, result.password);
    if (hashedPassword === true) {
      const newPasswordLength = newPassword.length;
      if (newPasswordLength < 5) {
        request.status(400);
        request.response("Password is to short");
      } else {
        const hashedPassword2 = await bcrypt.hash(newPassword, 10);
        const updateQueryPassword = `
           UPDATE user
           SET password='${hashedPassword2}'
           WHERE username='${username}'`;
        await db.run(updateQueryPassword);
        response.send("Password updated");
      }
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  }
});
module.exports = app;
