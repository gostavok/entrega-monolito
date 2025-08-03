import { app, sequelize } from "../express";
import request from "supertest";

describe("E2E tests for Client API", () => {

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /clients", () => {
    it("should create a client", async () => {
      const input = {
        name: "Client 1",
        email: "client@test.com",
        document: "123456789",
        address: {
          street: "Street 1",
          number: "123",
          complement: "Apt 1",
          city: "City 1",
          state: "State 1",
          zipCode: "12345678",
        },
      };

      const response = await request(app)
        .post("/clients")
        .send(input);

      expect(response.status).toBe(201);
    });

    it("should create a client without complement (optional field)", async () => {
      const input = {
        name: "Client 2",
        email: "client2@test.com",
        document: "987654321",
        address: {
          street: "Street 2",
          number: "456",
          complement: "", // Optional field as empty string
          city: "City 2",
          state: "State 2",
          zipCode: "87654321",
        },
      };

      const response = await request(app)
        .post("/clients")
        .send(input);

      expect(response.status).toBe(201);
    });

    it("should return 500 when name is missing", async () => {
      const input = {
        // name: missing
        email: "client@test.com",
        document: "123456789",
        address: {
          street: "Street 1",
          number: "123",
          complement: "Apt 1",
          city: "City 1",
          state: "State 1",
          zipCode: "12345678",
        },
      };

      const response = await request(app)
        .post("/clients")
        .send(input);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 500 when email is missing", async () => {
      const input = {
        name: "Client 1",
        // email: missing
        document: "123456789",
        address: {
          street: "Street 1",
          number: "123",
          complement: "Apt 1",
          city: "City 1",
          state: "State 1",
          zipCode: "12345678",
        },
      };

      const response = await request(app)
        .post("/clients")
        .send(input);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 500 when document is missing", async () => {
      const input = {
        name: "Client 1",
        email: "client@test.com",
        // document: missing
        address: {
          street: "Street 1",
          number: "123",
          complement: "Apt 1",
          city: "City 1",
          state: "State 1",
          zipCode: "12345678",
        },
      };

      const response = await request(app)
        .post("/clients")
        .send(input);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 500 when address is missing", async () => {
      const input = {
        name: "Client 1",
        email: "client@test.com",
        document: "123456789",
        // address: missing
      };

      const response = await request(app)
        .post("/clients")
        .send(input);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 500 when address.street is missing", async () => {
      const input = {
        name: "Client 1",
        email: "client@test.com",
        document: "123456789",
        address: {
          // street: missing
          number: "123",
          complement: "Apt 1",
          city: "City 1",
          state: "State 1",
          zipCode: "12345678",
        },
      };

      const response = await request(app)
        .post("/clients")
        .send(input);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 500 when address.number is missing", async () => {
      const input = {
        name: "Client 1",
        email: "client@test.com",
        document: "123456789",
        address: {
          street: "Street 1",
          // number: missing
          complement: "Apt 1",
          city: "City 1",
          state: "State 1",
          zipCode: "12345678",
        },
      };

      const response = await request(app)
        .post("/clients")
        .send(input);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 500 when address.city is missing", async () => {
      const input = {
        name: "Client 1",
        email: "client@test.com",
        document: "123456789",
        address: {
          street: "Street 1",
          number: "123",
          complement: "Apt 1",
          // city: missing
          state: "State 1",
          zipCode: "12345678",
        },
      };

      const response = await request(app)
        .post("/clients")
        .send(input);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 500 when address.state is missing", async () => {
      const input = {
        name: "Client 1",
        email: "client@test.com",
        document: "123456789",
        address: {
          street: "Street 1",
          number: "123",
          complement: "Apt 1",
          city: "City 1",
          // state: missing
          zipCode: "12345678",
        },
      };

      const response = await request(app)
        .post("/clients")
        .send(input);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 500 when address.zipCode is missing", async () => {
      const input = {
        name: "Client 1",
        email: "client@test.com",
        document: "123456789",
        address: {
          street: "Street 1",
          number: "123",
          complement: "Apt 1",
          city: "City 1",
          state: "State 1",
          // zipCode: missing
        },
      };

      const response = await request(app)
        .post("/clients")
        .send(input);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 500 when request body is empty", async () => {
      const response = await request(app)
        .post("/clients")
        .send({});

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 500 when request body is invalid JSON", async () => {
      const response = await request(app)
        .post("/clients")
        .send("invalid json");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });
});
