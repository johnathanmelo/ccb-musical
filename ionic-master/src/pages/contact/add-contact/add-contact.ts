import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-add-contact',
  templateUrl: 'add-contact.html',
})
export class AddContactPage {
  contact: Object = new Object();
  functions: Object[];
  loading: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
  ) {
  }

  saveNewContact() {
    if (this.areFieldsInvalid()) {
      return;
    }

    this.presentLoading();

    const Contact = Parse.Object.extend('Contact');
    const myNewObject = new Contact();

    myNewObject.set('name', this.contact['name']);
    myNewObject.set('function', this.contact['function']);
    myNewObject.set('city', this.contact['city']);
    myNewObject.set('church', this.contact['church']);
    myNewObject.set('email', this.contact['email']);
    myNewObject.set('phone1', this.contact['phone1'] ? _.toNumber(this.contact['phone1'].replace(/\D/g,'')) : null);
    myNewObject.set('phone2', this.contact['phone2'] ? _.toNumber(this.contact['phone2'].replace(/\D/g,'')) : null);

    myNewObject.save().then(
      () => {
        this.loading.dismiss();
        this.presentToast('O contato foi criado com sucesso');
        this.navCtrl.pop();
      },
      (error) => {
        this.loading.dismiss();
        console.error('Erro ao criar contato: ', error);
      }
    );
  }

  areFieldsInvalid() {
    if (this.contact['name'] === undefined || !this.contact['name'].replace(/\s/g, '').length) {
      this.presentToast('O nome deve ser informado');
      return true;
    }

    if (this.contact['function'] === undefined) {
      this.presentToast('O cargo deve ser informado');
      return true;
    }

    if (this.contact['city'] === undefined || !this.contact['city'].replace(/\s/g, '').length) {
      this.presentToast('A cidade deve ser informada');
      return true;
    }

    if ((this.contact['phone1'] === undefined || this.contact['phone1'] === null || !this.contact['phone1'].replace(/\s/g, '').length) && (this.contact['phone2'] === undefined || this.contact['phone2'] === null || !this.contact['phone2'].replace(/\s/g, '').length)) {
      this.presentToast('Pelo menos um telefone deve ser informado');
      return true;
    }

    return false;
  }

  fetchFunctions() {
    const Function = Parse.Object.extend('Function');
    const query = new Parse.Query(Function);
    query.ascending("position");
    return query.find().then((results) => {
      this.functions = results.map((result) => {
        return {
          '__type': 'Pointer',
          'className': 'Function',
          'objectId': result.id,
          name: result.get("name")
        };
      });
    }, (error) => {
      console.error('Erro ao buscar funções: ', error);
    });
  }

  presentToast(message) {
    this.toastCtrl.create({
      message: message,
      duration: 3000
    }).present();
  }

  compareFn(m1: any, m2: any): boolean {
    return m1 && m2 ? m1.objectId === m2.objectId : m1 === m2;
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }

  ionViewWillEnter() {
    this.presentLoading();

    const promises = [];

    promises.push(this.fetchFunctions());

    Parse.Promise.all(promises).then(() => {
      this.loading.dismiss();
    });
  }

}
