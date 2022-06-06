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
      values('${id}','admin','admin@finApi.com','${password}','now()', 'now()')
    `
    );
  })

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to authenticate an user", async () => {

    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@finApi.com",
      password: "admin",
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty("id");
    expect(response.body).toHaveProperty("token");
  })

  it("should not be able to authenticate a user if user does not exists", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@error.com",
      password: "error",
    });

    expect(response.status).toBe(401);
  })

  it("should not be able to authenticate a user if password is invalid", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@finApi.com",
      password: "error",
    });

    expect(response.status).toBe(401);
  })
})