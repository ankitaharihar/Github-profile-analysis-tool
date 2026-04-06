export async function handler(event) {
  try {
    const params = event.queryStringParameters || {};
    const username = params.username;

    if (!username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Username required" }),
      };
    }

    const res = await fetch(`https://api.github.com/users/${username}`);
    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("GitHub function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed" }),
    };
  }
}