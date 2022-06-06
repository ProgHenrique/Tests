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

  it("should be able to get a stament of a user", async () => {

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finApi.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const responseStatement = await request(app).post("/api/v1/statements/deposit").send({
      amount: 500,
      description: "test deposit type"

    }).set({
      Authorization: `Bearer ${token}`,
    })

    const{ id } = responseStatement.body

    const response = await request(app).get(`/api/v1/statements/${id}`).send().set({
      Authorization: `Bearer ${token}`,
    })


    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  })

  it("should be able to get a stament of a user if he does not exists", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@error.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const responseStatement = await request(app).post("/api/v1/statements/deposit").send({
      amount: 500,
      description: "test deposit type"

    }).set({
      Authorization: `Bearer ${token}`,
    })

    const{ id } = responseStatement.body

    const response = await request(app).get(`/api/v1/statements/${id}`).send({
      statement_id: id
    }).set({
      Authorization: `Bearer ${token}`,
    })


    expect(responseToken.status).toBe(401);
  })

  it("should not be able to get a stament of a user if it does not exist", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finApi.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app).get(`/api/v1/statements/${uuidv4()}`).send().set({
      Authorization: `Bearer ${token}`,
    })


    expect(response.status).toBe(404);
  })
})