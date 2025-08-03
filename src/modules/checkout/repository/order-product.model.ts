import { Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
  tableName: "order_products",
  timestamps: false,
})
export default class OrderProductModel extends Model {
  @PrimaryKey
  @Column({ allowNull: false })
  id: string;

  @Column({ allowNull: false, field: "order_id" })
  orderId: string;

  @Column({ allowNull: false, field: "product_id" })
  productId: string;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false })
  description: string;

  @Column({ allowNull: false, field: "sales_price" })
  salesPrice: number;
}
