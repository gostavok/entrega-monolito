import { app, migration, sequelize } from "../express";
import request from "supertest";

describe("E2E tests for Product API", () => {

  beforeEach(async () => {
    await migration.up();
  });

  afterAll(async () => {
    await migration.down()
    await sequelize.close();
  });

  it("should create a product successfully", async () => {
    const input = {
      name: "Product 1",
      description: "Product 1 description",
      purchasePrice: 100,
      stock: 10,
    };

    const response = await request(app)
      .post("/products")
      .send(input);

    expect(response.status).toBe(201);
  });

  it("should create a product with minimal stock", async () => {
    const input = {
      name: "Product 2",
      description: "Product 2 description",
      purchasePrice: 50,
      stock: 1,
    };

    const response = await request(app)
      .post("/products")
      .send(input);

    expect(response.status).toBe(201);
  });

  it("should return 500 error when name is missing", async () => {
    const input = {
      description: "Product description",
      purchasePrice: 100,
      stock: 10,
    };

    const response = await request(app)
      .post("/products")
      .send(input);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when description is missing", async () => {
    const input = {
      name: "Product 1",
      purchasePrice: 100,
      stock: 10,
    };

    const response = await request(app)
      .post("/products")
      .send(input);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when purchasePrice is missing", async () => {
    const input = {
      name: "Product 1",
      description: "Product description",
      stock: 10,
    };

    const response = await request(app)
      .post("/products")
      .send(input);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when stock is missing", async () => {
    const input = {
      name: "Product 1",
      description: "Product description",
      purchasePrice: 100,
    };

    const response = await request(app)
      .post("/products")
      .send(input);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should create a product with empty name string", async () => {
    const input = {
      name: "",
      description: "Product description",
      purchasePrice: 100,
      stock: 10,
    };

    const response = await request(app)
      .post("/products")
      .send(input);

    expect(response.status).toBe(201);
  });

  it("should create a product with empty description string", async () => {
    const input = {
      name: "Product 1",
      description: "",
      purchasePrice: 100,
      stock: 10,
    };

    const response = await request(app)
      .post("/products")
      .send(input);

    expect(response.status).toBe(201);
  });

  it("should create a product with purchasePrice zero", async () => {
    const input = {
      name: "Product 1",
      description: "Product description",
      purchasePrice: 0,
      stock: 10,
    };

    const response = await request(app)
      .post("/products")
      .send(input);

    expect(response.status).toBe(201);
  });

  it("should create a product with negative purchasePrice", async () => {
    const input = {
      name: "Product 1",
      description: "Product description",
      purchasePrice: -10,
      stock: 10,
    };

    const response = await request(app)
      .post("/products")
      .send(input);

    expect(response.status).toBe(201);
  });

  it("should create a product with negative stock", async () => {
    const input = {
      name: "Product 1",
      description: "Product description",
      purchasePrice: 100,
      stock: -5,
    };

    const response = await request(app)
      .post("/products")
      .send(input);

    expect(response.status).toBe(201);
  });

  it("should return 500 error when request body is empty", async () => {
    const response = await request(app)
      .post("/products")
      .send({});

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when request body is invalid JSON", async () => {
    const response = await request(app)
      .post("/products")
      .type("json")
      .send("invalid json");

    expect(response.status).toBe(400);
  });
});
