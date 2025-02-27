import Pool from "pg";

export const pool = new Pool.Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "Jeevan@230299",
  port: 5432,
});
