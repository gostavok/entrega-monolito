import UseCaseInterface from "../../@shared/usecase/use-case.interface";
import CheckoutFacadeInterface, {
  PlaceOrderFacadeInputDto,
  PlaceOrderFacadeOutputDto,
} from "./checkout.facade.interface";

export interface UseCaseProps {
  placeOrderUseCase: UseCaseInterface;
}

export default class CheckoutFacade implements CheckoutFacadeInterface {
  private _placeOrderUseCase: UseCaseInterface;

  constructor(usecaseProps: UseCaseProps) {
    this._placeOrderUseCase = usecaseProps.placeOrderUseCase;
  }

  async placeOrder(input: PlaceOrderFacadeInputDto): Promise<PlaceOrderFacadeOutputDto> {
    return await this._placeOrderUseCase.execute(input);
  }
}
