import { Sequelize } from "sequelize-typescript";
import Id from "../../@shared/domain/value-object/id.value-object";
import Product from "../domain/product.entity";
import CheckoutRepository from "./checkout.repository";
import OrderModel from "./order.model";
import OrderProductModel from "./order-product.model";
import Client from "../domain/client.entity";
import Order from "../domain/order.entity";

describe("Checkout Repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([OrderModel, OrderProductModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create an order", async () => {
    const client = new Client({
      id: new Id("c1"),
      name: "Client 1",
      email: "client@test.com",
      address: "Street 1, 123",
    });

    const product = new Product({
      id: new Id("p1"),
      name: "Product 1",
      description: "Product 1 description",
      salesPrice: 100,
    });

    const order = new Order({
      id: new Id("o1"),
      client: client,
      products: [product],
      status: "pending",
    });

    const repository = new CheckoutRepository();
    await repository.addOrder(order);

    const orderDb = await OrderModel.findOne({
      where: { id: "o1" },
    });

    const orderProducts = await OrderProductModel.findAll({
      where: { orderId: "o1" },
    });

    expect(orderDb).toBeDefined();
    expect(orderDb.id).toBe(order.id.id);
    expect(orderDb.clientId).toBe(client.id.id);
    expect(orderDb.clientName).toBe(client.name);
    expect(orderDb.clientEmail).toBe(client.email);
    expect(orderDb.clientAddress).toBe(client.address);
    expect(orderDb.status).toBe(order.status);
    expect(orderDb.total).toBe(order.total);
    expect(orderProducts).toHaveLength(1);
    expect(orderProducts[0].productId).toBe(product.id.id);
    expect(orderProducts[0].name).toBe(product.name);
    expect(orderProducts[0].description).toBe(product.description);
    expect(orderProducts[0].salesPrice).toBe(product.salesPrice);
  });

  it("should find an order", async () => {
    const client = new Client({
      id: new Id("c1"),
      name: "Client 1",
      email: "client@test.com",
      address: "Street 1, 123",
    });

    const product = new Product({
      id: new Id("p1"),
      name: "Product 1",
      description: "Product 1 description",
      salesPrice: 100,
    });

    const order = new Order({
      id: new Id("o1"),
      client: client,
      products: [product],
      status: "pending",
    });

    const repository = new CheckoutRepository();
    await repository.addOrder(order);

    const result = await repository.findOrder("o1");

    expect(result).toBeDefined();
    expect(result.id.id).toBe(order.id.id);
    expect(result.client.id.id).toBe(client.id.id);
    expect(result.client.name).toBe(client.name);
    expect(result.client.email).toBe(client.email);
    expect(result.client.address).toBe(client.address);
    expect(result.status).toBe(order.status);
    expect(result.total).toBe(order.total);
    expect(result.products).toHaveLength(1);
    expect(result.products[0].id.id).toBe(product.id.id);
    expect(result.products[0].name).toBe(product.name);
    expect(result.products[0].description).toBe(product.description);
    expect(result.products[0].salesPrice).toBe(product.salesPrice);
  });

  it("should return null when order not found", async () => {
    const repository = new CheckoutRepository();
    const result = await repository.findOrder("nonexistent");

    expect(result).toBeNull();
  });

  it("should create an order with multiple products", async () => {
    const client = new Client({
      id: new Id("c1"),
      name: "Client 1",
      email: "client@test.com",
      address: "Street 1, 123",
    });

    const product1 = new Product({
      id: new Id("p1"),
      name: "Product 1",
      description: "Product 1 description",
      salesPrice: 100,
    });

    const product2 = new Product({
      id: new Id("p2"),
      name: "Product 2",
      description: "Product 2 description",
      salesPrice: 200,
    });

    const order = new Order({
      id: new Id("o1"),
      client: client,
      products: [product1, product2],
      status: "approved",
    });

    const repository = new CheckoutRepository();
    await repository.addOrder(order);

    const orderDb = await OrderModel.findOne({
      where: { id: "o1" },
    });

    const orderProducts = await OrderProductModel.findAll({
      where: { orderId: "o1" },
    });

    expect(orderDb).toBeDefined();
    expect(orderProducts).toHaveLength(2);
    expect(orderDb.total).toBe(300);
    expect(orderDb.status).toBe("approved");
  });
});
