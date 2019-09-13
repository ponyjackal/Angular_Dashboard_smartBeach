import { AbstractControl } from '@angular/forms';
export class PasswordValidation {

    static MatchPassword(AC: AbstractControl) {
       const setPassword = AC.get('setPassword').value; // to get value in input tag
       const confirmPassword = AC.get('confirmPassword').value; // to get value in input tag
        if (setPassword !== confirmPassword) {
            AC.get('confirmPassword').setErrors( {MatchPassword: true} );
        } else {
            return null;
        }
    }
}
