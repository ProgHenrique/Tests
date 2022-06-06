import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create User", () => {

  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at )
      values('${id}','admin','admin@finApi.com','${password}','now()','now()')
    `
    );
  })

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to get balance for a user", async () => {

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finApi.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`,
    })


    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("balance");
  })

  it("should not be able to get balance if user does not exists", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@error.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`,
    })

    expect(responseToken.status).toBe(401);
  })
})