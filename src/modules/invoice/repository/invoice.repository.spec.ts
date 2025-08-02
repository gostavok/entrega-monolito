import { Sequelize } from "sequelize-typescript";
import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import InvoiceItems from "../domain/invoice-items.entity";
import Invoice from "../domain/invoice.entity";
import InvoiceItemsModel from "./invoice-items.model";
import InvoiceModel from "./invoice.model";
import InvoiceRepository from "./invoice.repository";

describe("InvoiceRepository test", () => {
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

  it("should save an invoice", async () => {
    const items = [
      new InvoiceItems({
        id: new Id("1"),
        name: "Item 1",
        price: 100,
      }),
      new InvoiceItems({
        id: new Id("2"),
        name: "Item 2",
        price: 200,
      }),
    ];

    const invoice = new Invoice({
      id: new Id("1"),
      name: "Client 1",
      document: "123.456.789-00",
      address: new Address(
        "Rua 123",
        "99",
        "Casa Verde",
        "Criciúma",
        "SC",
        "88888-888"
      ),
      items: items,
    });

    const repository = new InvoiceRepository();
    const result = await repository.save(invoice);

    expect(result.id.id).toBe("1");
    expect(result.name).toBe("Client 1");
    expect(result.document).toBe("123.456.789-00");
    expect(result.total).toBe(300);

    const invoiceDb = await InvoiceModel.findOne({ where: { id: "1" } });
    expect(invoiceDb).toBeDefined();
    expect(invoiceDb.id).toBe("1");
    expect(invoiceDb.name).toBe("Client 1");

    const itemsDb = await InvoiceItemsModel.findAll({ where: { invoiceId: "1" } });
    expect(itemsDb.length).toBe(2);
    expect(itemsDb[0].name).toBe("Item 1");
    expect(itemsDb[1].name).toBe("Item 2");
  });

  it("should find an invoice", async () => {
    await InvoiceModel.create({
      id: "1",
      name: "Client 1",
      document: "123.456.789-00",
      street: "Rua 123",
      number: "99",
      complement: "Casa Verde",
      city: "Criciúma",
      state: "SC",
      zipCode: "88888-888",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await InvoiceItemsModel.create({
      id: "1",
      name: "Item 1",
      price: 100,
      invoiceId: "1",
    });

    await InvoiceItemsModel.create({
      id: "2",
      name: "Item 2",
      price: 200,
      invoiceId: "1",
    });

    const repository = new InvoiceRepository();
    const invoice = await repository.find("1");

    expect(invoice.id.id).toBe("1");
    expect(invoice.name).toBe("Client 1");
    expect(invoice.document).toBe("123.456.789-00");
    expect(invoice.address.street).toBe("Rua 123");
    expect(invoice.items.length).toBe(2);
    expect(invoice.items[0].name).toBe("Item 1");
    expect(invoice.items[1].name).toBe("Item 2");
    expect(invoice.total).toBe(300);
  });
});
