export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "https://lavu-ooe.github.io",
          "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (request.method === "GET" && path === "/") {
      const data = await env.PRODUCT_DATA.get("sortiment");
      const body = data === null ? [] : JSON.parse(data);
      return Response.json(body, {
        headers: {
          "Access-Control-Allow-Origin": "https://lavu-ooe.github.io",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }

    if (request.method === "POST" && path === "/report") {
      try {
        const body = await request.json();
        const { artNr, geb, bez, clientId } = body;

        if (!artNr || !geb || !clientId) {
          return new Response(
            JSON.stringify({ error: "Missing fields: artNr, geb, clientId" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const reportKey = `report:${artNr}:${geb}`;

        let clients = await env.PRODUCT_DATA.get(reportKey, "json");
        if (!clients) clients = [];
        if (!Array.isArray(clients)) clients = [];

        if (clients.includes(clientId)) {
          return Response.json(
            { message: "Already reported" },
            { status: 200, headers: { "Access-Control-Allow-Origin": "https://lavu-ooe.github.io" } }
          );
        }

        clients.push(clientId);
        await env.PRODUCT_DATA.put(reportKey, JSON.stringify(clients));

        if (clients.length >= 2) {
          let official = await env.PRODUCT_DATA.get("sortiment", "json");
          if (!official) official = [];

          const existing = official.find(item => item.artNr === artNr);
          if (existing) {
            existing.geb = geb;
          } else {
            official.push({ artNr, geb, bez: bez || "" });
          }

          await env.PRODUCT_DATA.put("sortiment", JSON.stringify(official));
        }

        return Response.json(
          { message: "Report recorded" },
          {
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": "https://lavu-ooe.github.io",
              "Access-Control-Allow-Credentials": "true",
            },
          }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ error: "Invalid request" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (request.method === "PUT" || request.method === "POST") {
      const BASIC_USER = "admin";
      const BASIC_PASS = env.ADMIN_PASSWORD;

      const authorization = request.headers.get("Authorization");
      if (!authorization) {
        return new Response("Authentication required.", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="My App", charset="UTF-8"',
            "Access-Control-Allow-Origin": "https://lavu-ooe.github.io",
            "Access-Control-Allow-Credentials": "true",
          },
        });
      }

      const [scheme, encoded] = authorization.split(" ");
      if (scheme !== "Basic" || !encoded) {
        return new Response("Malformed authorization header.", {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "https://lavu-ooe.github.io",
            "Access-Control-Allow-Credentials": "true",
          },
        });
      }

      const credentials = atob(encoded);
      const index = credentials.indexOf(":");
      const user = credentials.substring(0, index);
      const pass = credentials.substring(index + 1);

      if (user !== BASIC_USER || pass !== BASIC_PASS) {
        return new Response("Forbidden.", {
          status: 403,
          headers: {
            "Access-Control-Allow-Origin": "https://lavu-ooe.github.io",
            "Access-Control-Allow-Credentials": "true",
          },
        });
      }

      try {
        const newData = await request.json();
        if (!Array.isArray(newData)) {
          return new Response("Invalid data format. Expected an array.", {
            status: 400,
            headers: {
              "Access-Control-Allow-Origin": "https://lavu-ooe.github.io",
              "Access-Control-Allow-Credentials": "true",
            },
          });
        }
        await env.PRODUCT_DATA.put("sortiment", JSON.stringify(newData));
        return Response.json(
          { success: true, message: "Data updated successfully." },
          {
            headers: {
              "Access-Control-Allow-Origin": "https://lavu-ooe.github.io",
              "Access-Control-Allow-Credentials": "true",
            },
          }
        );
      } catch (e) {
        return new Response("Invalid JSON payload.", {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "https://lavu-ooe.github.io",
            "Access-Control-Allow-Credentials": "true",
          },
        });
      }
    }

    return new Response("Not found.", {
      status: 404,
      headers: {
        "Access-Control-Allow-Origin": "https://lavu-ooe.github.io",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  },
};