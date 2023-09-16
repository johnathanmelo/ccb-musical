import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { ListContactPage } from '../list-contact/list-contact';
import { AddContactPage } from '../add-contact/add-contact';
import Parse from 'parse';

@Component({
  selector: 'page-list-contact-type',
  templateUrl: 'list-contact-type.html',
})
export class ListContactTypePage {
  loading: any;
  functions: Object[];
  hasPermissionToEdit: Boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
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
      {
        __type: 'Pointer',
        className: 'Function',
        objectId: 'uNRbyF380N',
        name: 'Examinadora de Organista',
      },
    ];
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }

  checkUserPermission() {
    this.presentLoading();

    const RegisteredEmail = Parse.Object.extend('RegisteredEmail');
    var query = new Parse.Query(RegisteredEmail);
    query.equalTo('email', Parse.User.current().get("email"));

    query.first().then(registeredUser => {
      this.hasPermissionToEdit = registeredUser.get("permissionToEdit");
      this.loading.dismiss();
    });
  }

  ionViewWillEnter() {
    this.checkUserPermission();
    this.fetchFunctions();
  }

}
