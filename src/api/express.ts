
import express, { Express } from "express";
import { Sequelize } from "sequelize-typescript";
import { ClientModel } from "../modules/client-adm/repository/client.model";
import { ProductModel } from "../modules/product-adm/repository/product.model";
import CatalogProductModel from "../modules/store-catalog/repository/product.model";
import TransactionModel from "../modules/payment/repository/transaction.model";
import InvoiceModel from "../modules/invoice/repository/invoice.model";
import InvoiceItemsModel from "../modules/invoice/repository/invoice-items.model";
import OrderModel from "../modules/checkout/repository/order.model";
import OrderProductModel from "../modules/checkout/repository/order-product.model";
import { productRoutes } from "./routes/products.route";
import { clientRoutes } from "./routes/clients.route";
import { checkoutRoutes } from "./routes/checkout.route";
import { invoiceRoutes } from "./routes/invoice.route";
import { migrator } from "../test-migrations/config-migrations/migrator";

export const app: Express = express();
app.use(express.json());
app.use("/products", productRoutes);
app.use("/clients", clientRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/invoice", invoiceRoutes);

export let sequelize: Sequelize;

export let migration: any;

async function setupDb() {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });
  await sequelize.addModels([
    ClientModel, 
    ProductModel, 
    CatalogProductModel, 
    TransactionModel, 
    InvoiceModel, 
    InvoiceItemsModel,
    OrderModel,
    OrderProductModel
  ]);

  migration = migrator(sequelize)
}
setupDb();
