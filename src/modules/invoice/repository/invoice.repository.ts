import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import InvoiceItems from "../domain/invoice-items.entity";
import Invoice from "../domain/invoice.entity";
import InvoiceGateway from "../gateway/invoice.gateway";
import InvoiceItemsModel from "./invoice-items.model";
import InvoiceModel from "./invoice.model";

export default class InvoiceRepository implements InvoiceGateway {
  async save(invoice: Invoice): Promise<Invoice> {
    await InvoiceModel.create({
      id: invoice.id.id,
      name: invoice.name,
      document: invoice.document,
      street: invoice.address.street,
      number: invoice.address.number,
      complement: invoice.address.complement,
      city: invoice.address.city,
      state: invoice.address.state,
      zipCode: invoice.address.zipCode,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    });

    for (const item of invoice.items) {
      await InvoiceItemsModel.create({
        id: item.id.id,
        name: item.name,
        price: item.price,
        invoiceId: invoice.id.id,
      });
    }

    return invoice;
  }

  async find(id: string): Promise<Invoice> {
    const invoiceModel = await InvoiceModel.findOne({
      where: { id },
    });

    if (!invoiceModel) {
      throw new Error(`Invoice with id ${id} not found`);
    }

    const itemsModel = await InvoiceItemsModel.findAll({
      where: { invoiceId: id },
    });

    const items = itemsModel.map(
      (item) =>
        new InvoiceItems({
          id: new Id(item.id),
          name: item.name,
          price: item.price,
        })
    );

    return new Invoice({
      id: new Id(invoiceModel.id),
      name: invoiceModel.name,
      document: invoiceModel.document,
      address: new Address(
        invoiceModel.street,
        invoiceModel.number,
        invoiceModel.complement,
        invoiceModel.city,
        invoiceModel.state,
        invoiceModel.zipCode
      ),
      items: items,
      createdAt: invoiceModel.createdAt,
      updatedAt: invoiceModel.updatedAt,
    });
  }
}
