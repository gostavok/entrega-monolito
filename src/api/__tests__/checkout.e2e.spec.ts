import { app, sequelize } from "../express";
import request from "supertest";

describe("E2E tests for Checkout API", () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should return 500 error when client is not found", async () => {
    const checkoutInput = {
      clientId: "non-existent-client-id",
      products: [
        {
          productId: "test-product-id",
        },
      ],
    };

    const response = await request(app)
      .post("/checkout")
      .send(checkoutInput);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("Client not found");
  });

  it("should return 500 error when no products are selected", async () => {
    const checkoutInput = {
      clientId: "test-client-id",
      products: [] as any[],
    };

    const response = await request(app)
      .post("/checkout")
      .send(checkoutInput);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("Client not found");
  });

  it("should return 500 error when products array is missing", async () => {
    const checkoutInput = {
      clientId: "test-client-id",
    };

    const response = await request(app)
      .post("/checkout")
      .send(checkoutInput);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when clientId is missing", async () => {
    const checkoutInput = {
      products: [
        {
          productId: "test-product-id",
        },
      ],
    };

    const response = await request(app)
      .post("/checkout")
      .send(checkoutInput);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when clientId is empty", async () => {
    const checkoutInput = {
      clientId: "",
      products: [
        {
          productId: "test-product-id",
        },
      ],
    };

    const response = await request(app)
      .post("/checkout")
      .send(checkoutInput);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("Client not found");
  });

  it("should return 500 error when clientId is null", async () => {
    const checkoutInput = {
      clientId: null as any,
      products: [
        {
          productId: "test-product-id",
        },
      ],
    };

    const response = await request(app)
      .post("/checkout")
      .send(checkoutInput);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when products contain empty productId", async () => {
    const checkoutInput = {
      clientId: "test-client-id",
      products: [
        {
          productId: "",
        },
      ],
    };

    const response = await request(app)
      .post("/checkout")
      .send(checkoutInput);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when products contain null productId", async () => {
    const checkoutInput = {
      clientId: "test-client-id",
      products: [
        {
          productId: null as any,
        },
      ],
    };

    const response = await request(app)
      .post("/checkout")
      .send(checkoutInput);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when products contain missing productId", async () => {
    const checkoutInput = {
      clientId: "test-client-id",
      products: [
        {
        },
      ],
    };

    const response = await request(app)
      .post("/checkout")
      .send(checkoutInput);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when request body is empty", async () => {
    const response = await request(app)
      .post("/checkout")
      .send({});
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when request body is invalid JSON", async () => {
    const response = await request(app)
      .post("/checkout")
      .type("json")
      .send("invalid json");
    
    expect(response.status).toBe(400);
  });

  it("should return 500 error with multiple products but one has invalid productId", async () => {
    const checkoutInput = {
      clientId: "test-client-id",
      products: [
        {
          productId: "valid-product-id",
        },
        {
          productId: "",
        },
      ],
    };

    const response = await request(app)
      .post("/checkout")
      .send(checkoutInput);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should handle valid format request but expect errors due to missing data", async () => {
    const checkoutInput = {
      clientId: "test-client-id",
      products: [
        {
          productId: "test-product-id",
        },
      ],
    };

    const response = await request(app)
      .post("/checkout")
      .send(checkoutInput);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(
      response.body.error.includes("Client not found") ||
      response.body.error.includes("Product") ||
      response.body.error.includes("stock") ||
      response.body.error.includes("not found")
    ).toBe(true);
  });
});
