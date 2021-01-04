import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class CreateProductsToOrderProducts1609739326129 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey('orders_products', new TableForeignKey({
      name: 'OrdersProductsProduct',
      columnNames: ['product_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'products',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('orders_products', 'OrdersProductsProduct');
  }

}
