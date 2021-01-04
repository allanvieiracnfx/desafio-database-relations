import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({
      where: { name },
    });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    let listProducts = []

    const productsId = products.map(product => product.id);

    listProducts = await this.ormRepository.find({
      where: {
        id: In(productsId),
      },
    });

    return listProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {

    let listProducts: Product[] = []

    const productsId = products.map(product => product.id);

    listProducts = await this.ormRepository.find({
      where: {
        id: In(productsId),
      },
    });

    listProducts.map(product => {
      const productFilter = products.find(filterProduct => {
        return product.id === filterProduct.id
      });

      if (productFilter !== undefined) {
        product.quantity = product.quantity - productFilter.quantity;
      }
    });

    await this.ormRepository.save(listProducts);

    return listProducts;

  }
}

export default ProductsRepository;
