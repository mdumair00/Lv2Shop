import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/entity/country';
import { Order } from 'src/app/entity/order';
import { OrderItem } from 'src/app/entity/order-item';
import { Purchase } from 'src/app/entity/purchase';
import { State } from 'src/app/entity/state';
import { CartService } from 'src/app/service/cart.service';
import { CheckoutService } from 'src/app/service/checkout-service.service';
import { WebsiteFormService } from 'src/app/service/website-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;
  totalQuantity:number = 0;
  totalPrice: number = 0;
  creditCardYear:number[] = [];
  creditCardMonth: number[] = [];
  countries: Country[] = [];
  shippingAddressStates: State[]=[]
  billingAddressStates: State[]=[]

  private purchaseUrl = 'http://localhost:8080/api/checkout/purchase';

  constructor(private formBuilder: FormBuilder, private websiteForm: WebsiteFormService, private cartService: CartService, private checkoutService: CheckoutService, private router: Router) { }

  ngOnInit(): void {

    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(3), Luv2ShopValidators.noOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(3),Luv2ShopValidators.noOnlyWhiteSpace]),
        email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z09.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2),Luv2ShopValidators.noOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2),Luv2ShopValidators.noOnlyWhiteSpace]),
        state: new FormControl('',[Validators.required]),
        country: new FormControl('',[Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2),Luv2ShopValidators.noOnlyWhiteSpace]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2),Luv2ShopValidators.noOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2),Luv2ShopValidators.noOnlyWhiteSpace]),
        state: new FormControl('',[Validators.required]),
        country: new FormControl('',[Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2),Luv2ShopValidators.noOnlyWhiteSpace]),
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('',[Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2),Luv2ShopValidators.noOnlyWhiteSpace]),
        cardNumber: new FormControl('',[Validators.required,Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('',[Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    })

    const startMonth: number = new Date().getMonth()+1;
    this.websiteForm.getCreditCardMonths(startMonth).subscribe(
      data=> {
        console.log("Retrieved credit card months: "+ JSON.stringify(data));
        this.creditCardMonth = data;
      }
    )

    this.websiteForm.getCreditCardYears().subscribe(
      data=>{
        console.log("Retrieved credit card years: "+ JSON.stringify(data));
        this.creditCardYear = data;
      }
    )

    //populate coutries

    this.websiteForm.getCountries().subscribe(
      data =>{
        console.log("Retrieved country: "+ JSON.stringify(data));
        this.countries = data;
      }
    )
  }

  get firstName(){ return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName(){ return this.checkoutFormGroup.get('customer.lastName'); }
  get email(){ return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressStreet(){ return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity(){ return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState(){ return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressCountry(){ return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddressZipCode(){ return this.checkoutFormGroup.get('shippingAddress.zipCode'); }

  get billingAddressStreet(){ return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity(){ return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState(){ return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressCountry(){ return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddressZipCode(){ return this.checkoutFormGroup.get('billingAddress.zipCode'); }

  get creditCardType(){ return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard(){ return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber(){ return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode(){ return this.checkoutFormGroup.get('creditCard.securityCode'); }

  onSubmit(){

    console.log("Handling the submit button");
    
    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalPrice = this.totalQuantity;

    //get cart items
    const cartItems = this.cartService.cartItems;

    //create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map(tempCartItems => new OrderItem(tempCartItems));


    //set up purchase
    let purchase = new Purchase();

    //populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;



    //populate purchase - shipping address
    purchase.shippingAddress  = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    //populate purchase - billing address
    purchase.billingAddress  = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    //populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    //call Rest ApI via the checkoutService
    this.checkoutService.placeOrder(purchase).subscribe({
        next: response =>{
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
          //reset cart
          this.resetCart();
        },
        error: err =>{
          alert(`There was an error: ${err.message}`);
        }
      }
    )
  }

  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    //reset the form
    this.checkoutFormGroup.reset();
    
    //nagivate back to the products page
    this.router.navigateByUrl('/products');
  }

  getStates(formGroupName: string){
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    this.websiteForm.getStates(countryCode).subscribe(
    data=>{
      if(formGroupName === 'shippingAddress'){
        this.shippingAddressStates = data;
      }
      else{
        this.billingAddressStates = data;
      }

      formGroup.get('state').setValue(data[0]);
    })
  }
  copyShippingAddressToBillingAddress(event){
    if(event.target.checked){
      this.checkoutFormGroup.controls.billingAddress.setValue(this.checkoutFormGroup.controls.shippingAddress.value)
      //for bug
      this.billingAddressStates = this.shippingAddressStates
    }
    else{
      this.checkoutFormGroup.controls.billingAddress.reset();
      //for bug (uncheck billingaddress state will vancine)
      this.billingAddressStates = [];
    }
  }

  handleMonthAndYear(){
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);

    let startMonth: number;

    if(currentYear === selectedYear){
      startMonth = new Date().getMonth() + 1;
    }
    else{
      startMonth = 1;
    }

    this.websiteForm.getCreditCardMonths(startMonth).subscribe(
      data=>{
        this.creditCardMonth = data;
      }
    )
  }

  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(data=>{
      this.totalPrice = data;
    });
    this.cartService.totalQuantity.subscribe(data=>{
      this.totalQuantity = data;
    });
  }
}
