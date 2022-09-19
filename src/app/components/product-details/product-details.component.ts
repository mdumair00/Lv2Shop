import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouteConfigLoadEnd } from '@angular/router';
import { CartItem } from 'src/app/entity/card-item';
import { Product } from 'src/app/entity/product';
import { CartService } from 'src/app/service/cart.service';
import { ProductService } from 'src/app/service/product.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {

  public product!: Product;
  constructor(private productService: ProductService, private cartService: CartService, private route:ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(()=>{
      this.handleProductDetails()
    })
  }

  handleProductDetails() {

    const productId:number = +this.route.snapshot.paramMap.get('id'!);

    this.productService.getProduct(productId).subscribe((data)=>{
      this.product = data;
    })

  }

  addToCart(){
    console.log(`${this.product.name}`);
    const cartItem = new CartItem(this.product)
    this.cartService.addToCart(cartItem)
  }
}


