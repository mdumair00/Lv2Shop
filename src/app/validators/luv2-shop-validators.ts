import { FormControl, ValidationErrors } from "@angular/forms";

export class Luv2ShopValidators {

    static noOnlyWhiteSpace(control: FormControl): ValidationErrors{ 
        //check if string only contains whitespace
        if((control.value != null) && (control.value.trim().length ===0)){
            return {'notOnlyWhiteSpace': true};
        }
        else{
            return null;
        }

    }
}
