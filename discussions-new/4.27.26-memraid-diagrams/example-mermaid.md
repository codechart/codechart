%% diagram: User authentication flow across web and api repos.<br/>Login submission travels from React UI through the API auth route<br/>into the JWT module, which reads from the users table.
%% basePath:backend = c:/proj/api git=api
%% basePath:frontend = c:/proj/web git=web
%% gitUrl:api = github.com/me/api
%% gitUrl:web = github.com/me/web
%% legend:#1f6feb = http boundary (request entry/exit)
%% legend:#b91c1c = security-critical (token, crypto, auth)
%% legend:#15803d = data layer (db reads/writes)
%% desc:n1 = React form submit handler.<br/>POSTs credentials to /api/login.<br/>Handles 401 by clearing the form.
%% desc:n2 = Express route handler for POST /api/login.<br/>Calls validateToken on session cookie if present,<br/>otherwise calls signToken on success.
%% desc:n3 = Validates JWT and returns user claims.<br/>Throws on expired or malformed tokens.<br/>Used by every authenticated route.
%% desc:n4 = Issues a fresh JWT for a user id.<br/>HS256, 24h expiry, secret from env.
%% desc:n5 = Reads from users table by email.<br/>Read replica only. Returns null if not found.
%% desc:file_jwt = The jwt.ts module.<br/>Owns token validation and signing.<br/>Single source of truth for auth crypto.
%% desc:file_users = The users.ts module.<br/>Owns all user-row reads and writes.
%% desc:n7 = Architectural note. Not a code location.

flowchart TD
  n1["@frontend/src/pages/Login.tsx<br/>12-48<br/>handleSubmit"]:::g_http
  n2["@backend/src/routes/auth.ts<br/>22-40<br/>postLogin"]:::g_http

  subgraph file_jwt ["@backend/src/auth/jwt.ts | jwt-module"]
    n3["@backend/src/auth/jwt.ts<br/>15-58<br/>validateToken"]:::g_security
    n4["@backend/src/auth/jwt.ts<br/>62-80<br/>signToken"]:::g_security
  end

  subgraph file_users ["@backend/src/db/users.ts | users-module"]
    n5["@backend/src/db/users.ts<br/>30-55<br/>findUserByEmail"]:::g_data
  end

  n7>"Tokens are HS256 with 24h expiry"]

  subgraph g_frontend [Frontend]
    n1
  end

  subgraph g_backend [Backend]
    subgraph g_auth [Auth module]
      n2
      file_jwt
    end
    subgraph g_db [Data access]
      file_users
    end
  end

  n1 --> n2
  n2 --> n3
  n2 --> n4
  n3 --> file_users
  n4 -.-> n7

  classDef g_http fill:#1f6feb,stroke:#0b3a8a,color:#ffffff
  classDef g_security fill:#b91c1c,stroke:#7f1d1d,color:#ffffff
  classDef g_data fill:#15803d,stroke:#14532d,color:#ffffff