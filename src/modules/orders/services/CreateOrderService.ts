import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(

    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) { }

  public async execute({ customer_id, products }: IRequest): Promise<Order> {

    const customerExist = await this.customersRepository.findById(customer_id);

    if (!customerExist || customerExist === undefined) {
      throw new AppError('Could not find any customer with given id.');
    }

    const existentProducts = await this.productsRepository.findAllById(products);

    if (!existentProducts.length) {
      throw new AppError('Could not find products with the given ids.');
    }

    const existentProductsIds = existentProducts.map(product => product.id);

    const checkInexistentProducts = products.filter(product =>
      !existentProductsIds.includes(product.id),
    );

    if (checkInexistentProducts.length) {
      throw new AppError(`Could not find products: ${checkInexistentProducts.length}.`);
    }

    const findProductsWithNoQuantityAvalible = products.filter(product => {
      const p = existentProducts.find(pr => pr.id === product.id);

      if (!p) {
        return;
      }

      if (p?.quantity < product.quantity) {
        return product;
      }

    });

    if (findProductsWithNoQuantityAvalible.length) {
      throw new AppError(`Quantity insuficient for: ${findProductsWithNoQuantityAvalible.length} products.`);
    }

    const serializedProducts = products.map(product => ({
      product_id: product.id,
      price: existentProducts.filter(p => p.id === product.id)[0].price,
      quantity: product.quantity,
    }));

    const order = await this.ordersRepository.create({
      customer: customerExist,
      products: serializedProducts,
    });

    const serializedProductsUpdated = products.map(product => ({
      id: product.id,
      quantity: product.quantity,
    }));

    await this.productsRepository.updateQuantity(serializedProductsUpdated);

    return order;
  }
}

export default CreateOrderService;
