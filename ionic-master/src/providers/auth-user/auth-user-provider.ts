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

    const registeredUser = await this.getRegisteredUserAsync();
    return registeredUser.get("isAdmin");
  }

  async hasPermissionToEditAsync(): Promise<boolean> {
    if (!this.isLogged()) return false;

    const registeredUser = await this.getRegisteredUserAsync();
    return registeredUser.get("permissionToEdit");
  }

  private async getRegisteredUserAsync(): Promise<any> {
    const RegisteredEmail = Parse.Object.extend('RegisteredEmail');
    const query = new Parse.Query(RegisteredEmail);

    query.equalTo('email', Parse.User.current().get("email"));

    const registeredUser = await query.first();
    return registeredUser;
  }

}
