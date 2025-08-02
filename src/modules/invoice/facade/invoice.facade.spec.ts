import { Sequelize } from "sequelize-typescript";
import InvoiceFacadeFactory from "../factory/invoice.facade.factory";
import InvoiceItemsModel from "../repository/invoice-items.model";
import InvoiceModel from "../repository/invoice.model";

describe("InvoiceFacade test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([InvoiceModel, InvoiceItemsModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should generate an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const input = {
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

    const result = await facade.generate(input);

    expect(result.id).toBeDefined();
    expect(result.name).toBe("Client 1");
    expect(result.document).toBe("123.456.789-00");
    expect(result.street).toBe("Rua 123");
    expect(result.number).toBe("99");
    expect(result.complement).toBe("Casa Verde");
    expect(result.city).toBe("Criciúma");
    expect(result.state).toBe("SC");
    expect(result.zipCode).toBe("88888-888");
    expect(result.items.length).toBe(2);
    expect(result.items[0].id).toBe("1");
    expect(result.items[0].name).toBe("Item 1");
    expect(result.items[0].price).toBe(100);
    expect(result.items[1].id).toBe("2");
    expect(result.items[1].name).toBe("Item 2");
    expect(result.items[1].price).toBe(200);
    expect(result.total).toBe(300);
  });

  it("should find an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    // First generate an invoice
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

    const generated = await facade.generate(generateInput);

    // Then find it
    const findResult = await facade.find({ id: generated.id });

    expect(findResult.id).toBe(generated.id);
    expect(findResult.name).toBe("Client 1");
    expect(findResult.document).toBe("123.456.789-00");
    expect(findResult.address.street).toBe("Rua 123");
    expect(findResult.address.number).toBe("99");
    expect(findResult.address.complement).toBe("Casa Verde");
    expect(findResult.address.city).toBe("Criciúma");
    expect(findResult.address.state).toBe("SC");
    expect(findResult.address.zipCode).toBe("88888-888");
    expect(findResult.items.length).toBe(2);
    expect(findResult.items[0].id).toBe("1");
    expect(findResult.items[0].name).toBe("Item 1");
    expect(findResult.items[0].price).toBe(100);
    expect(findResult.items[1].id).toBe("2");
    expect(findResult.items[1].name).toBe("Item 2");
    expect(findResult.items[1].price).toBe(200);
    expect(findResult.total).toBe(300);
    expect(findResult.createdAt).toBeDefined();
  });
});
