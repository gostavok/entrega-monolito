import { app, sequelize } from "../express";
import request from "supertest";
import InvoiceFacadeFactory from "../../modules/invoice/factory/invoice.facade.factory";

describe("E2E tests for Invoice API", () => {

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should successfully get an existing invoice", async () => {
    const facade = InvoiceFacadeFactory.create();
    const generateInput = {
      name: "Client 1",
      document: "123.456.789-00",
      street: "Rua 123",
      number: "99",
      complement: "Casa Verde",
      city: "Criciúma",
      state: "SC",
      zipCode: "88888-888",
      items: [
        {
          id: "1",
          name: "Item 1",
          price: 100,
        },
        {
          id: "2",
          name: "Item 2",
          price: 200,
        },
      ],
    };

    const createdInvoice = await facade.generate(generateInput);

    const response = await request(app)
      .get(`/invoice/${createdInvoice.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", createdInvoice.id);
    expect(response.body).toHaveProperty("name", "Client 1");
    expect(response.body).toHaveProperty("document", "123.456.789-00");
    expect(response.body.address).toHaveProperty("street", "Rua 123");
    expect(response.body.address).toHaveProperty("number", "99");
    expect(response.body.address).toHaveProperty("complement", "Casa Verde");
    expect(response.body.address).toHaveProperty("city", "Criciúma");
    expect(response.body.address).toHaveProperty("state", "SC");
    expect(response.body.address).toHaveProperty("zipCode", "88888-888");
    expect(response.body.items).toHaveLength(2);
    expect(response.body.items[0]).toHaveProperty("name", "Item 1");
    expect(response.body.items[0]).toHaveProperty("price", 100);
    expect(response.body.items[1]).toHaveProperty("name", "Item 2");
    expect(response.body.items[1]).toHaveProperty("price", 200);
    expect(response.body).toHaveProperty("total", 300);
    expect(response.body).toHaveProperty("createdAt");
  });

  it("should return 500 error when invoice is not found", async () => {
    const response = await request(app)
      .get("/invoice/non-existent-id");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("not found");
  });

  it("should return 500 error when invoice id is empty", async () => {
    const response = await request(app)
      .get("/invoice/");

    expect(response.status).toBe(404);
  });

  it("should return 500 error when trying to find invoice with null id", async () => {
    const response = await request(app)
      .get("/invoice/null");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when trying to find invoice with undefined id", async () => {
    const response = await request(app)
      .get("/invoice/undefined");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when trying to find invoice with numeric id that doesn't exist", async () => {
    const response = await request(app)
      .get("/invoice/123");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("not found");
  });

  it("should return 500 error when trying to find invoice with UUID that doesn't exist", async () => {
    const response = await request(app)
      .get("/invoice/550e8400-e29b-41d4-a716-446655440000");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("not found");
  });

  it("should return 500 error when trying to find invoice with very long id", async () => {
    const longId = "a".repeat(1000);
    const response = await request(app)
      .get(`/invoice/${longId}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 error when trying to find invoice with special characters in id", async () => {
    const response = await request(app)
      .get("/invoice/@#$%^&*()");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 404 error when trying to find invoice with whitespace id", async () => {
    const response = await request(app)
      .get("/invoice/ ");

    expect(response.status).toBe(404);
  });

  it("should return 500 error when trying to find invoice with empty string id", async () => {
    const response = await request(app)
      .get("/invoice/%20");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });

  it("should handle valid request format but return 500 for non-existent invoice", async () => {
    const response = await request(app)
      .get("/invoice/valid-looking-id-123");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("not found");
  });
});
