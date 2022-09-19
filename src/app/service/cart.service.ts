import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../entity/card-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);
  constructor() { }

  addToCart(cardItem: CartItem){
    let alreadyExitsInCart: boolean = false;
    let existingCartItem: CartItem = undefined;

    if(this.cartItems.length > 0){
      
      existingCartItem = this.cartItems.find(tempCarItem => tempCarItem.id === cardItem.id)

      alreadyExitsInCart = (existingCartItem != undefined)
    }
    if(alreadyExitsInCart){
      existingCartItem.quantity++;
    }
    else{
      this.cartItems.push(cardItem);
    }
    this.computeCartTotal()
  }
  computeCartTotal(){
    let totalPriceValue:number = 0;
    let totalQuantityValue: number = 0;

    for(let currentCartItem of this.cartItems){
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
    this.logItem(totalPriceValue, totalQuantityValue);
  }
  logItem(tpv,tqv){
    console.log('Content of cart')
    for(let carditem of this.cartItems)
    {
      const subTotalp:number = carditem.quantity * carditem.unitPrice;
      console.log(`name:${carditem.name} quantity=${carditem.quantity}, unitPrice = ${carditem.unitPrice}, subTotalPrice = ${subTotalp}`);
    }
    console.log(`totalPrice: ${tpv.toFixed(2)}, totalQuantity: ${tqv}`);
    
  }

  decrementQuantity(cartItem: CartItem){
    cartItem.quantity--;
    if (cartItem.quantity === 0)
    {
      this.remove(cartItem)
    }
    else{
      this.computeCartTotal()
    }
  }

  remove(cartItem: CartItem){

    const itemIndex = this.cartItems.findIndex( tempCartItem=> cartItem.id === tempCartItem.id)

    if(itemIndex > -1){
      this.cartItems.splice(itemIndex,1);
      this.computeCartTotal();
    }
  }
}
