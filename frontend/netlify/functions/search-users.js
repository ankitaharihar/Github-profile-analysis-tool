export async function handler(event) {
  try {
    const params = event.queryStringParameters || {};
    const query = String(params.q || "").trim();
    const perPageRaw = Number(params.per_page || 8);
    const perPage = Number.isFinite(perPageRaw) ? Math.min(Math.max(perPageRaw, 1), 20) : 8;

    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Query required", items: [] }),
      };
    }

    const searchUrl = `https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=${perPage}`;
    const baseHeaders = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "RepoInsight-Netlify-Function",
    };

    const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;
    const tokenHeaders = token
      ? { ...baseHeaders, Authorization: `Bearer ${token}` }
      : baseHeaders;

    let response = await fetch(searchUrl, { headers: tokenHeaders });

    if (response.status === 401 && token) {
      console.warn("GitHub token returned 401 for search-users; retrying without Authorization header.");
      response = await fetch(searchUrl, { headers: baseHeaders });
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          message: data?.message || "Failed to search users",
          items: [],
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...data,
        items: Array.isArray(data?.items) ? data.items : [],
      }),
    };
  } catch (error) {
    console.error("search-users function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to search users", items: [] }),
    };
  }
}
