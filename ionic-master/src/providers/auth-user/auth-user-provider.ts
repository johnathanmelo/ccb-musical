import { Injectable } from '@angular/core';
import Parse from 'parse';

@Injectable()
export class AuthUserProvider {
  
  constructor() {}

  isLogged(): boolean {
    return !!Parse.User.current();
  }

  async isAdminAsync(): Promise<boolean> {
    if (!this.isLogged()) return false;

    const RegisteredEmail = Parse.Object.extend('RegisteredEmail');
    var query = new Parse.Query(RegisteredEmail);
    query.equalTo('email', Parse.User.current().get("email"));

    const registeredUser = await query.first();
    return registeredUser.get("isAdmin");
  }

}
