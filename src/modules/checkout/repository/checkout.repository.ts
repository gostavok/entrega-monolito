import Id from "../../@shared/domain/value-object/id.value-object";
import Client from "../domain/client.entity";
import Order from "../domain/order.entity";
import Product from "../domain/product.entity";
import CheckoutGateway from "../gateway/checkout.gateway";
import OrderModel from "./order.model";
import OrderProductModel from "./order-product.model";

export default class CheckoutRepository implements CheckoutGateway {
  async addOrder(order: Order): Promise<void> {
    // Create the order
    await OrderModel.create({
      id: order.id.id,
      clientId: order.client.id.id,
      clientName: order.client.name,
      clientEmail: order.client.email,
      clientAddress: order.client.address,
      status: order.status,
      total: order.total,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create the order products separately
    for (const product of order.products) {
      await OrderProductModel.create({
        id: product.id.id,
        orderId: order.id.id,
        productId: product.id.id,
        name: product.name,
        description: product.description,
        salesPrice: product.salesPrice,
      });
    }
  }

  async findOrder(id: string): Promise<Order | null> {
    const orderModel = await OrderModel.findOne({
      where: { id },
    });

    if (!orderModel) {
      return null;
    }

    // Get the order products
    const orderProducts = await OrderProductModel.findAll({
      where: { orderId: id },
    });

    const client = new Client({
      id: new Id(orderModel.clientId),
      name: orderModel.clientName,
      email: orderModel.clientEmail,
      address: orderModel.clientAddress,
    });

    const products = orderProducts.map(
      (productModel) =>
        new Product({
          id: new Id(productModel.productId),
          name: productModel.name,
          description: productModel.description,
          salesPrice: productModel.salesPrice,
        })
    );

    return new Order({
      id: new Id(orderModel.id),
      client,
      products,
      status: orderModel.status,
    });
  }
}
