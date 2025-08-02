import Invoice from "../domain/invoice.entity";

export default interface InvoiceGateway {
  save(invoice: Invoice): Promise<Invoice>;
  find(id: string): Promise<Invoice>;
}
