import Address from "../../../@shared/domain/value-object/address";
import Id from "../../../@shared/domain/value-object/id.value-object";
import InvoiceItems from "../../domain/invoice-items.entity";
import Invoice from "../../domain/invoice.entity";
import FindInvoiceUseCase from "./find-invoice.usecase";

const invoiceItems = [
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
  items: invoiceItems,
});

const MockRepository = () => {
  return {
    save: jest.fn(),
    find: jest.fn().mockReturnValue(Promise.resolve(invoice)),
  };
};

describe("Find Invoice use case unit test", () => {
  it("should find an invoice", async () => {
    const repository = MockRepository();
    const usecase = new FindInvoiceUseCase(repository);

    const input = {
      id: "1",
    };

    const result = await usecase.execute(input);

    expect(repository.find).toHaveBeenCalled();
    expect(result.id).toBe("1");
    expect(result.name).toBe("Client 1");
    expect(result.document).toBe("123.456.789-00");
    expect(result.address.street).toBe("Rua 123");
    expect(result.address.number).toBe("99");
    expect(result.address.complement).toBe("Casa Verde");
    expect(result.address.city).toBe("Criciúma");
    expect(result.address.state).toBe("SC");
    expect(result.address.zipCode).toBe("88888-888");
    expect(result.items.length).toBe(2);
    expect(result.items[0].id).toBe("1");
    expect(result.items[0].name).toBe("Item 1");
    expect(result.items[0].price).toBe(100);
    expect(result.items[1].id).toBe("2");
    expect(result.items[1].name).toBe("Item 2");
    expect(result.items[1].price).toBe(200);
    expect(result.total).toBe(300);
    expect(result.createdAt).toBe(invoice.createdAt);
  });
});
