require("dotenv").config({ path: "../.env" });
const { initializeDatabase } = require("./database");

async function main() {
  try {
    console.log("Running initializeDatabase()...");
    await initializeDatabase();
    console.log("initializeDatabase() completed successfully!");
  } catch (err) {
    console.error("Error running initializeDatabase:", err);
  }
}
main();
