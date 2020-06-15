import { EntityRepository, Repository } from "typeorm";
import { Product } from '../models/entities/Product';
import { CreateProduct } from '../models/inputs/CreateProduct';
import { UpdateProduct } from '../models/inputs/UpdateProduct';
import { ProductCategoryRepository } from './ProductCategoryRepository';
import { getPaged, innerJoinById } from './BaseQueries';
import { getCustomRepository } from "typeorm";
import { PagedParamsType, DBTableNames, ProductType, BasePagePaths, getStoreItem } from "@cromwell/core";

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {

    async getProducts(params: PagedParamsType<ProductType>): Promise<Product[]> {
        const qb = this.createQueryBuilder(DBTableNames.Product);
        getPaged(qb, DBTableNames.Product, params);
        return await qb.getMany();
    }

    async getProductById(id: string): Promise<Product> {
        const product = await this.findOne({
            where: { id }
        });
        if (!product) throw new Error(`Product ${id} not found!`);
        return product;
    }

    async getProductBySlug(slug: string): Promise<Product> {
        const product = await this.findOne({
            where: { slug }
        });
        if (!product) throw new Error(`Product ${slug} not found!`);
        return product;
    }


    async createProduct(createProduct: CreateProduct): Promise<Product> {
        const product = new Product();
        product.name = createProduct.name;
        product.price = createProduct.price;
        product.oldPrice = createProduct.oldPrice;
        product.mainImage = createProduct.mainImage;
        product.images = createProduct.images;
        product.description = createProduct.description;
        product.isEnabled = createProduct.isEnabled;
        product.pageTitle = createProduct.pageTitle;
        product.slug = createProduct.slug;
        if (createProduct.categoryIds) {
            product.categories = await getCustomRepository(ProductCategoryRepository)
                .getProductCategoriesById(createProduct.categoryIds);
        }

        await this.save(product);
        if (!product.slug) {
            product.slug = product.id;
            await this.save(product);
        }

        this.buildProductPage(product);

        return product;
    }

    async updateProduct(id: string, updateProduct: UpdateProduct): Promise<Product> {
        const product = await this.findOne({
            where: { id },
            relations: ["categories"]
        });
        if (!product) throw new Error(`Product ${id} not found!`);

        console.log('product', product)

        product.name = updateProduct.name;
        product.price = updateProduct.price;
        product.oldPrice = updateProduct.oldPrice;
        product.mainImage = updateProduct.mainImage;
        product.images = updateProduct.images;
        product.description = updateProduct.description;
        product.isEnabled = updateProduct.isEnabled;
        product.pageTitle = updateProduct.pageTitle;
        product.slug = updateProduct.slug ? updateProduct.slug : product.id;
        if (updateProduct.categoryIds) {
            product.categories = await getCustomRepository(ProductCategoryRepository)
                .getProductCategoriesById(updateProduct.categoryIds);
        }

        await this.save(product);

        this.buildProductPage(product);

        return product;
    }

    async deleteProduct(id: string): Promise<boolean> {
        const product = await this.getProductById(id);
        if (!product) return false;
        await this.delete(id);

        const pageBuilder = getStoreItem('pageBuilder');
        if (pageBuilder) {
            pageBuilder.deletePage(`${BasePagePaths.Product}/${product.slug}`);
        }
        return true;
    }

    async getProductsFromCategory(categoryId: string, params?: PagedParamsType<ProductType>): Promise<ProductType[]> {
        const qb = this.createQueryBuilder(DBTableNames.Product);
        innerJoinById(qb, DBTableNames.Product, 'categories', DBTableNames.ProductCategory, categoryId);
        getPaged(qb, DBTableNames.Product, params);
        return await qb.getMany();
    }

    private buildProductPage(product: Product) {
        const pageBuilder = getStoreItem('pageBuilder');
        if (pageBuilder) {
            pageBuilder.buildPage(`${BasePagePaths.Product}/${product.slug}`);
            if (product.categories) {
                product.categories.forEach(cat => {
                    pageBuilder.buildPage(`${BasePagePaths.ProductCategory}/${cat.slug}`);
                })
            }
        }
    }

}