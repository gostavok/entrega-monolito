import { Sequelize } from "sequelize-typescript";
import Id from "../../@shared/domain/value-object/id.value-object";
import Address from "../../@shared/domain/value-object/address";
import ClientAdmFacadeInterface from "../../client-adm/facade/client-adm.facade.interface";
import ProductAdmFacadeInterface from "../../product-adm/facade/product-adm.facade.interface";
import StoreCatalogFacadeInterface from "../../store-catalog/facade/store-catalog.facade.interface";
import PaymentFacadeInterface from "../../payment/facade/facade.interface";
import InvoiceFacadeInterface from "../../invoice/facade/invoice.facade.interface";
import CheckoutRepository from "../repository/checkout.repository";
import OrderModel from "../repository/order.model";
import OrderProductModel from "../repository/order-product.model";
import PlaceOrderUseCase from "../usecase/place-order/place-order.usecase";
import CheckoutFacade from "./checkout.facade";

const mockClientFacade = (): ClientAdmFacadeInterface => {
  return {
    add: jest.fn(),
    find: jest.fn().mockReturnValue(Promise.resolve({
      id: "c1",
      name: "Client 1",
      email: "client@test.com",
      document: "123456789",
      address: new Address("Street 1", "123", "Apt 1", "City 1", "State 1", "12345"),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  };
};

const mockProductFacade = (): ProductAdmFacadeInterface => {
  return {
    addProduct: jest.fn(),
    checkStock: jest.fn().mockReturnValue(Promise.resolve({
      productId: "p1",
      stock: 10,
    })),
  };
};

const mockCatalogFacade = (): StoreCatalogFacadeInterface => {
  return {
    find: jest.fn().mockReturnValue(Promise.resolve({
      id: "p1",
      name: "Product 1",
      description: "Product 1 description",
      salesPrice: 100,
    })),
    findAll: jest.fn(),
  };
};

const mockPaymentFacade = (): PaymentFacadeInterface => {
  return {
    process: jest.fn().mockReturnValue(Promise.resolve({
      transactionId: "t1",
      orderId: "o1",
      amount: 100,
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  };
};

const mockInvoiceFacade = (): InvoiceFacadeInterface => {
  return {
    find: jest.fn(),
    generate: jest.fn().mockReturnValue(Promise.resolve({
      id: "i1",
      name: "Client 1",
      document: "123456789",
      street: "Street 1",
      number: "123",
      complement: "Apt 1",
      city: "City 1",
      state: "State 1",
      zipCode: "12345",
      items: [{
        id: "p1",
        name: "Product 1",
        price: 100,
      }],
      total: 100,
    })),
  };
};

describe("Checkout Facade test", () => {

  it("should place an order", async () => {
    const clientFacade = mockClientFacade();
    const productFacade = mockProductFacade();
    const catalogFacade = mockCatalogFacade();
    const paymentFacade = mockPaymentFacade();
    const invoiceFacade = mockInvoiceFacade();
    
    // Mock the repository to avoid Sequelize connection issues
    const repository = {
      addOrder: jest.fn(),
      findOrder: jest.fn(),
    };

    const placeOrderUseCase = new PlaceOrderUseCase(
      clientFacade,
      productFacade,
      catalogFacade,
      repository,
      invoiceFacade,
      paymentFacade
    );

    const facade = new CheckoutFacade({
      placeOrderUseCase: placeOrderUseCase,
    });

    const input = {
      clientId: "c1",
      products: [{ productId: "p1" }],
    };

    const result = await facade.placeOrder(input);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.invoiceId).toBe("i1");
    expect(result.status).toBe("approved");
    expect(result.total).toBe(100);
    expect(result.products).toHaveLength(1);
    expect(result.products[0].productId).toBe("p1");

    // Verify that all facades were called
    expect(clientFacade.find).toHaveBeenCalledWith({ id: "c1" });
    expect(productFacade.checkStock).toHaveBeenCalledWith({ productId: "p1" });
    expect(catalogFacade.find).toHaveBeenCalledWith({ id: "p1" });
    expect(paymentFacade.process).toHaveBeenCalled();
    expect(invoiceFacade.generate).toHaveBeenCalled();
    expect(repository.addOrder).toHaveBeenCalled();
  });

  it("should not place an order when client is not found", async () => {
    const clientFacade = mockClientFacade();
    clientFacade.find = jest.fn().mockReturnValue(Promise.resolve(null));
    
    const productFacade = mockProductFacade();
    const catalogFacade = mockCatalogFacade();
    const paymentFacade = mockPaymentFacade();
    const invoiceFacade = mockInvoiceFacade();
    
    // Mock the repository to avoid Sequelize connection issues
    const repository = {
      addOrder: jest.fn(),
      findOrder: jest.fn(),
    };

    const placeOrderUseCase = new PlaceOrderUseCase(
      clientFacade,
      productFacade,
      catalogFacade,
      repository,
      invoiceFacade,
      paymentFacade
    );

    const facade = new CheckoutFacade({
      placeOrderUseCase: placeOrderUseCase,
    });

    const input = {
      clientId: "c1",
      products: [{ productId: "p1" }],
    };

    await expect(facade.placeOrder(input)).rejects.toThrow("Client not found");
  });

  it("should not place an order when product has no stock", async () => {
    const clientFacade = mockClientFacade();
    const productFacade = mockProductFacade();
    productFacade.checkStock = jest.fn().mockReturnValue(Promise.resolve({
      productId: "p1",
      stock: 0,
    }));
    
    const catalogFacade = mockCatalogFacade();
    const paymentFacade = mockPaymentFacade();
    const invoiceFacade = mockInvoiceFacade();
    
    // Mock the repository to avoid Sequelize connection issues
    const repository = {
      addOrder: jest.fn(),
      findOrder: jest.fn(),
    };

    const placeOrderUseCase = new PlaceOrderUseCase(
      clientFacade,
      productFacade,
      catalogFacade,
      repository,
      invoiceFacade,
      paymentFacade
    );

    const facade = new CheckoutFacade({
      placeOrderUseCase: placeOrderUseCase,
    });

    const input = {
      clientId: "c1",
      products: [{ productId: "p1" }],
    };

    await expect(facade.placeOrder(input)).rejects.toThrow("Product p1 is not available in stock");
  });

  it("should not place an order when no products are selected", async () => {
    const clientFacade = mockClientFacade();
    const productFacade = mockProductFacade();
    const catalogFacade = mockCatalogFacade();
    const paymentFacade = mockPaymentFacade();
    const invoiceFacade = mockInvoiceFacade();
    
    // Mock the repository to avoid Sequelize connection issues
    const repository = {
      addOrder: jest.fn(),
      findOrder: jest.fn(),
    };

    const placeOrderUseCase = new PlaceOrderUseCase(
      clientFacade,
      productFacade,
      catalogFacade,
      repository,
      invoiceFacade,
      paymentFacade
    );

    const facade = new CheckoutFacade({
      placeOrderUseCase: placeOrderUseCase,
    });

    const input = {
      clientId: "c1",
      products: [] as { productId: string }[],
    };

    await expect(facade.placeOrder(input)).rejects.toThrow("No products selected");
  });

  it("should place an order with multiple products", async () => {
    const clientFacade = mockClientFacade();
    const productFacade = mockProductFacade();
    
    const catalogFacade = mockCatalogFacade();
    catalogFacade.find = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        id: "p1",
        name: "Product 1",
        description: "Product 1 description",
        salesPrice: 100,
      }))
      .mockReturnValueOnce(Promise.resolve({
        id: "p2",
        name: "Product 2",
        description: "Product 2 description",
        salesPrice: 200,
      }));

    const paymentFacade = mockPaymentFacade();
    paymentFacade.process = jest.fn().mockReturnValue(Promise.resolve({
      transactionId: "t1",
      orderId: "o1",
      amount: 300,
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const invoiceFacade = mockInvoiceFacade();
    
    // Mock the repository to avoid Sequelize connection issues
    const repository = {
      addOrder: jest.fn(),
      findOrder: jest.fn(),
    };

    const placeOrderUseCase = new PlaceOrderUseCase(
      clientFacade,
      productFacade,
      catalogFacade,
      repository,
      invoiceFacade,
      paymentFacade
    );

    const facade = new CheckoutFacade({
      placeOrderUseCase: placeOrderUseCase,
    });

    const input = {
      clientId: "c1",
      products: [{ productId: "p1" }, { productId: "p2" }],
    };

    const result = await facade.placeOrder(input);

    expect(result).toBeDefined();
    expect(result.total).toBe(300);
    expect(result.products).toHaveLength(2);
    expect(paymentFacade.process).toHaveBeenCalledWith({
      orderId: expect.any(String),
      amount: 300,
    });
    expect(repository.addOrder).toHaveBeenCalled();
  });
});
