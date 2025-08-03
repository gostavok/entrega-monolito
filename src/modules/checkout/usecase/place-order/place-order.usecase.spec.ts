import Address from "../../../@shared/domain/value-object/address";
import Id from "../../../@shared/domain/value-object/id.value-object";
import Client from "../../domain/client.entity";
import Product from "../../domain/product.entity";
import PlaceOrderUseCase from "./place-order.usecase";

const mockClientFacade = () => {
  return {
    add: jest.fn(),
    find: jest.fn(),
  };
};

const mockProductFacade = () => {
  return {
    addProduct: jest.fn(),
    checkStock: jest.fn(),
  };
};

const mockCatalogFacade = () => {
  return {
    find: jest.fn(),
    findAll: jest.fn(),
  };
};

const mockRepository = () => {
  return {
    addOrder: jest.fn(),
    findOrder: jest.fn(),
  };
};

const mockInvoiceFacade = () => {
  return {
    find: jest.fn(),
    generate: jest.fn(),
  };
};

const mockPaymentFacade = () => {
  return {
    process: jest.fn(),
  };
};

describe("PlaceOrderUseCase unit test", () => {
  describe("execute method", () => {
    it("should place an order successfully", async () => {
      const clientFacade = mockClientFacade();
      const productFacade = mockProductFacade();
      const catalogFacade = mockCatalogFacade();
      const repository = mockRepository();
      const invoiceFacade = mockInvoiceFacade();
      const paymentFacade = mockPaymentFacade();

      // Mock client
      clientFacade.find.mockResolvedValue({
        id: "c1",
        name: "Client 1",
        email: "client@test.com",
        document: "123456789",
        address: new Address("Street 1", "123", "Apt 1", "City 1", "State 1", "12345"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock product stock check
      productFacade.checkStock.mockResolvedValue({
        productId: "p1",
        stock: 10,
      });

      // Mock catalog product
      catalogFacade.find.mockResolvedValue({
        id: "p1",
        name: "Product 1",
        description: "Product 1 description",
        salesPrice: 100,
      });

      // Mock payment
      paymentFacade.process.mockResolvedValue({
        transactionId: "t1",
        orderId: "o1",
        amount: 100,
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock invoice
      invoiceFacade.generate.mockResolvedValue({
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
      });

      const usecase = new PlaceOrderUseCase(
        clientFacade,
        productFacade,
        catalogFacade,
        repository,
        invoiceFacade,
        paymentFacade
      );

      const input = {
        clientId: "c1",
        products: [{ productId: "p1" }],
      };

      const result = await usecase.execute(input);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.invoiceId).toBe("i1");
      expect(result.status).toBe("approved");
      expect(result.total).toBe(100);
      expect(result.products).toHaveLength(1);
      expect(result.products[0].productId).toBe("p1");

      // Verify all dependencies were called
      expect(clientFacade.find).toHaveBeenCalledWith({ id: "c1" });
      expect(productFacade.checkStock).toHaveBeenCalledWith({ productId: "p1" });
      expect(catalogFacade.find).toHaveBeenCalledWith({ id: "p1" });
      expect(paymentFacade.process).toHaveBeenCalledWith({
        orderId: expect.any(String),
        amount: 100,
      });
      expect(invoiceFacade.generate).toHaveBeenCalled();
      expect(repository.addOrder).toHaveBeenCalled();
    });

    it("should throw error when client is not found", async () => {
      const clientFacade = mockClientFacade();
      const productFacade = mockProductFacade();
      const catalogFacade = mockCatalogFacade();
      const repository = mockRepository();
      const invoiceFacade = mockInvoiceFacade();
      const paymentFacade = mockPaymentFacade();

      clientFacade.find.mockResolvedValue(null);

      const usecase = new PlaceOrderUseCase(
        clientFacade,
        productFacade,
        catalogFacade,
        repository,
        invoiceFacade,
        paymentFacade
      );

      const input = {
        clientId: "c1",
        products: [{ productId: "p1" }],
      };

      await expect(usecase.execute(input)).rejects.toThrow("Client not found");
      expect(clientFacade.find).toHaveBeenCalledWith({ id: "c1" });
    });

    it("should throw error when no products are selected", async () => {
      const clientFacade = mockClientFacade();
      const productFacade = mockProductFacade();
      const catalogFacade = mockCatalogFacade();
      const repository = mockRepository();
      const invoiceFacade = mockInvoiceFacade();
      const paymentFacade = mockPaymentFacade();

      clientFacade.find.mockResolvedValue({
        id: "c1",
        name: "Client 1",
        email: "client@test.com",
        document: "123456789",
        address: new Address("Street 1", "123", "Apt 1", "City 1", "State 1", "12345"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const usecase = new PlaceOrderUseCase(
        clientFacade,
        productFacade,
        catalogFacade,
        repository,
        invoiceFacade,
        paymentFacade
      );

      const input = {
        clientId: "c1",
        products: [] as { productId: string }[],
      };

      await expect(usecase.execute(input)).rejects.toThrow("No products selected");
    });

    it("should throw error when product has no stock", async () => {
      const clientFacade = mockClientFacade();
      const productFacade = mockProductFacade();
      const catalogFacade = mockCatalogFacade();
      const repository = mockRepository();
      const invoiceFacade = mockInvoiceFacade();
      const paymentFacade = mockPaymentFacade();

      clientFacade.find.mockResolvedValue({
        id: "c1",
        name: "Client 1",
        email: "client@test.com",
        document: "123456789",
        address: new Address("Street 1", "123", "Apt 1", "City 1", "State 1", "12345"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      productFacade.checkStock.mockResolvedValue({
        productId: "p1",
        stock: 0,
      });

      const usecase = new PlaceOrderUseCase(
        clientFacade,
        productFacade,
        catalogFacade,
        repository,
        invoiceFacade,
        paymentFacade
      );

      const input = {
        clientId: "c1",
        products: [{ productId: "p1" }],
      };

      await expect(usecase.execute(input)).rejects.toThrow("Product p1 is not available in stock");
      expect(productFacade.checkStock).toHaveBeenCalledWith({ productId: "p1" });
    });

    it("should throw error when product is not found in catalog", async () => {
      const clientFacade = mockClientFacade();
      const productFacade = mockProductFacade();
      const catalogFacade = mockCatalogFacade();
      const repository = mockRepository();
      const invoiceFacade = mockInvoiceFacade();
      const paymentFacade = mockPaymentFacade();

      clientFacade.find.mockResolvedValue({
        id: "c1",
        name: "Client 1",
        email: "client@test.com",
        document: "123456789",
        address: new Address("Street 1", "123", "Apt 1", "City 1", "State 1", "12345"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      productFacade.checkStock.mockResolvedValue({
        productId: "p1",
        stock: 10,
      });

      catalogFacade.find.mockResolvedValue(null);

      const usecase = new PlaceOrderUseCase(
        clientFacade,
        productFacade,
        catalogFacade,
        repository,
        invoiceFacade,
        paymentFacade
      );

      const input = {
        clientId: "c1",
        products: [{ productId: "p1" }],
      };

      await expect(usecase.execute(input)).rejects.toThrow("Product not found");
      expect(catalogFacade.find).toHaveBeenCalledWith({ id: "p1" });
    });

    it("should place an order with payment declined and no invoice", async () => {
      const clientFacade = mockClientFacade();
      const productFacade = mockProductFacade();
      const catalogFacade = mockCatalogFacade();
      const repository = mockRepository();
      const invoiceFacade = mockInvoiceFacade();
      const paymentFacade = mockPaymentFacade();

      clientFacade.find.mockResolvedValue({
        id: "c1",
        name: "Client 1",
        email: "client@test.com",
        document: "123456789",
        address: new Address("Street 1", "123", "Apt 1", "City 1", "State 1", "12345"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      productFacade.checkStock.mockResolvedValue({
        productId: "p1",
        stock: 10,
      });

      catalogFacade.find.mockResolvedValue({
        id: "p1",
        name: "Product 1",
        description: "Product 1 description",
        salesPrice: 100,
      });

      paymentFacade.process.mockResolvedValue({
        transactionId: "t1",
        orderId: "o1",
        amount: 100,
        status: "declined",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const usecase = new PlaceOrderUseCase(
        clientFacade,
        productFacade,
        catalogFacade,
        repository,
        invoiceFacade,
        paymentFacade
      );

      const input = {
        clientId: "c1",
        products: [{ productId: "p1" }],
      };

      const result = await usecase.execute(input);

      expect(result).toBeDefined();
      expect(result.invoiceId).toBe("");
      expect(result.status).toBe("pending");
      expect(invoiceFacade.generate).not.toHaveBeenCalled();
    });

    it("should place an order with multiple products", async () => {
      const clientFacade = mockClientFacade();
      const productFacade = mockProductFacade();
      const catalogFacade = mockCatalogFacade();
      const repository = mockRepository();
      const invoiceFacade = mockInvoiceFacade();
      const paymentFacade = mockPaymentFacade();

      clientFacade.find.mockResolvedValue({
        id: "c1",
        name: "Client 1",
        email: "client@test.com",
        document: "123456789",
        address: new Address("Street 1", "123", "Apt 1", "City 1", "State 1", "12345"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      productFacade.checkStock
        .mockResolvedValueOnce({ productId: "p1", stock: 10 })
        .mockResolvedValueOnce({ productId: "p2", stock: 5 });

      catalogFacade.find
        .mockResolvedValueOnce({
          id: "p1",
          name: "Product 1",
          description: "Product 1 description",
          salesPrice: 100,
        })
        .mockResolvedValueOnce({
          id: "p2",
          name: "Product 2",
          description: "Product 2 description",
          salesPrice: 200,
        });

      paymentFacade.process.mockResolvedValue({
        transactionId: "t1",
        orderId: "o1",
        amount: 300,
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      invoiceFacade.generate.mockResolvedValue({
        id: "i1",
        name: "Client 1",
        document: "123456789",
        street: "Street 1",
        number: "123",
        complement: "Apt 1",
        city: "City 1",
        state: "State 1",
        zipCode: "12345",
        items: [
          { id: "p1", name: "Product 1", price: 100 },
          { id: "p2", name: "Product 2", price: 200 },
        ],
        total: 300,
      });

      const usecase = new PlaceOrderUseCase(
        clientFacade,
        productFacade,
        catalogFacade,
        repository,
        invoiceFacade,
        paymentFacade
      );

      const input = {
        clientId: "c1",
        products: [{ productId: "p1" }, { productId: "p2" }],
      };

      const result = await usecase.execute(input);

      expect(result).toBeDefined();
      expect(result.total).toBe(300);
      expect(result.products).toHaveLength(2);
      expect(paymentFacade.process).toHaveBeenCalledWith({
        orderId: expect.any(String),
        amount: 300,
      });
    });
  });
});
