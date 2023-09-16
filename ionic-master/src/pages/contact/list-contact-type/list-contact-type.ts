import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ListContactPage } from '../list-contact/list-contact';
import { AddContactPage } from '../add-contact/add-contact';
import { AuthUserProvider } from '../../../providers/auth-user/auth-user-provider';

@Component({
  selector: 'page-list-contact-type',
  templateUrl: 'list-contact-type.html',
  providers: [AuthUserProvider],
})
export class ListContactTypePage {
  loading: any;
  functions: Object[];
  hasPermissionToEdit: boolean = false;

  constructor(
    private navCtrl: NavController,
    private authUserProvider: AuthUserProvider,
  ) {
  }

  openListContactPage(selectedFunction: String) {
    this.navCtrl.push(ListContactPage, { function: selectedFunction });
  }

  addContact() {
    this.navCtrl.push(AddContactPage);
  }

  fetchFunctions() {
    this.functions = [
      {
        __type: 'Pointer',
        className: 'Function',
        objectId: '6UnlzqFTt5',
        name: 'Ancião',
      },
      {
        __type: 'Pointer',
        className: 'Function',
        objectId: 'hvVr3Dyvep',
        name: 'Encarregado Regional',
      },
      {
        __type: 'Pointer',
        className: 'Function',
        objectId: '32OWVYU7Ja',
        name: 'Encarregado Local',
      },
    ];
  }

  async ionViewWillEnter() {
    this.fetchFunctions();
    this.hasPermissionToEdit = await this.authUserProvider.hasPermissionToEditAsync();
  }

}
