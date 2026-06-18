const { Client } = require('pg');

async function testConnection() {
  const url = process.argv[2];
  console.log("Testing URL:", url.replace(/:[^:@]+@/, ":***@"));
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log("SUCCESS!");
    await client.end();
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

testConnection();
