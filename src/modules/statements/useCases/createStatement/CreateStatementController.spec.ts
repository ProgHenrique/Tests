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

  it("should be able to create a stament deposit for a user", async () => {

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finApi.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/deposit").send({
      amount: 500,
      description: "test deposit type"

    }).set({
      Authorization: `Bearer ${token}`,
    })


    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  })

  it("should be able to create a stament withdraw for a user", async () => {

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finApi.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 500,
      description: "test deposit type"

    }).set({
      Authorization: `Bearer ${token}`,
    })


    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  })

  it("should not be able to create a stament withdraw for a user with insufficient funds", async () => {

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finApi.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 500,
      description: "test deposit type"

    }).set({
      Authorization: `Bearer ${token}`,
    })


    expect(response.status).toBe(400);
  })

  it("should not be able to create a statements if user does not exists", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@error.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/deposit").send({
      amount: 500,
      description: "test deposit type"

    }).set({
      Authorization: `Bearer ${token}`,
    })

    expect(responseToken.status).toBe(401);
  })
})