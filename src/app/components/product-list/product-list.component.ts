import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/entity/card-item';
import { Product } from 'src/app/entity/product';
import { CartService } from 'src/app/service/cart.service';
import { ProductService } from 'src/app/service/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  searchMode: boolean = false;
  previousCategoryId:number =1;

  //properties for pagenation
  pageNumber:number = 1;
  pageSize:number = 10;
  totalElements:number = 0;

  constructor(private productService: ProductService, private cartService: CartService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(()=>{
      this.listProducts();

    });
  }

  listProducts(){
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if(this.searchMode){
      this.handleSearchProduct();
    }
    else{
      this.handleListProduct();

    }
  }

  handleSearchProduct(){
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword');

    this.productService.searchProducts(theKeyword).subscribe(
      data =>{
        this.products = data;
      }
    )
  }

  handleListProduct(){
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    console.log(hasCategoryId);
    if(hasCategoryId)
    {
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    }
    else{
      this.currentCategoryId =1;
    }

    if(this.previousCategoryId != this.currentCategoryId)
      this.pageNumber = 1;

    this.previousCategoryId = this.currentCategoryId;
    console.log(`currentCategory = ${this.currentCategoryId} and page number = ${this.pageNumber}`);
    
    this.productService.getProductListPaginate(this.pageNumber-1, this.pageSize, this.currentCategoryId).subscribe(
      data => {
        this.products = data._embedded.products;
        this.pageNumber = data.page.number+1;
        this.pageSize = data.page.size;
        this.totalElements = data.page.totalElements;
      }
    )
  }

  addToCart(product: Product){
    console.log(`Add to cart ${product.name}, ${product.unitPrice}`);
    let cartItem:CartItem = new CartItem(product)
    this.cartService.addToCart(cartItem)
  }
}
