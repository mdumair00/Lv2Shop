import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../entity/product';
import {map} from 'rxjs/operators';
import { ProductCategory } from '../entity/product-category';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  

  private baseUrl = 'http://localhost:8080/api/products';
  private categoryUrl = 'http://localhost:8080/api/product-category';

  constructor(private httpClient: HttpClient) { }

  getProductList(categoryId:number): Observable<Product[]>{

    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}`
    return this.httpClient.get<GetResponseProduct>(searchUrl).pipe(
      map(response=> response._embedded.products)
    );
  }
  getProductListPaginate(page:number, pageSize:number, categoryId:number): Observable<GetResponseProduct>{

    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}&page=${page}&size=${pageSize}`
    return this.httpClient.get<GetResponseProduct>(searchUrl);
  }

  getProduct(productId:number):Observable<Product>{
    const productUrl = `${this.baseUrl}/${productId}`
    return this.httpClient.get<Product>(productUrl)
  }

  getProductCategories():Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    )
  }

  searchProducts(keyword:string):Observable<Product[]>{
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${keyword}`;
    return this.httpClient.get<GetResponseProduct>(searchUrl).pipe(
      map(response=> response._embedded.products)
    );
  }
}

interface GetResponseProduct{
  _embedded:{
    products: Product[];
  }
  page:{
    size:number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}
interface GetResponseProductCategory{
  _embedded:{
    productCategory: ProductCategory[];
  }
}