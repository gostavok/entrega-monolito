import { Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
  tableName: "orders",
  timestamps: false,
})
export default class OrderModel extends Model {
  @PrimaryKey
  @Column({ allowNull: false })
  id: string;

  @Column({ allowNull: false, field: "client_id" })
  clientId: string;

  @Column({ allowNull: false, field: "client_name" })
  clientName: string;

  @Column({ allowNull: false, field: "client_email" })
  clientEmail: string;

  @Column({ allowNull: false, field: "client_address" })
  clientAddress: string;

  @Column({ allowNull: false })
  status: string;

  @Column({ allowNull: false })
  total: number;

  @Column({ allowNull: false, field: "created_at" })
  createdAt: Date;

  @Column({ allowNull: false, field: "updated_at" })
  updatedAt: Date;
}
