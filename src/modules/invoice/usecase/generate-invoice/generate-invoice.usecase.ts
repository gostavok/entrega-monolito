import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import Address from "../../../@shared/domain/value-object/address";
import Id from "../../../@shared/domain/value-object/id.value-object";
import InvoiceItems from "../../domain/invoice-items.entity";
import Invoice from "../../domain/invoice.entity";
import InvoiceGateway from "../../gateway/invoice.gateway";
import { GenerateInvoiceUseCaseInputDto, GenerateInvoiceUseCaseOutputDto } from "./generate-invoice.dto";

export default class GenerateInvoiceUseCase implements UseCaseInterface {
  constructor(private invoiceRepository: InvoiceGateway) {}

  async execute(input: GenerateInvoiceUseCaseInputDto): Promise<GenerateInvoiceUseCaseOutputDto> {
    const items = input.items.map((item) => 
      new InvoiceItems({
        id: new Id(item.id),
        name: item.name,
        price: item.price,
      })
    );

    const invoice = new Invoice({
      name: input.name,
      document: input.document,
      address: new Address(
        input.street,
        input.number,
        input.complement,
        input.city,
        input.state,
        input.zipCode
      ),
      items: items,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    return {
      id: savedInvoice.id.id,
      name: savedInvoice.name,
      document: savedInvoice.document,
      street: savedInvoice.address.street,
      number: savedInvoice.address.number,
      complement: savedInvoice.address.complement,
      city: savedInvoice.address.city,
      state: savedInvoice.address.state,
      zipCode: savedInvoice.address.zipCode,
      items: savedInvoice.items.map((item) => ({
        id: item.id.id,
        name: item.name,
        price: item.price,
      })),
      total: savedInvoice.total,
    };
  }
}
