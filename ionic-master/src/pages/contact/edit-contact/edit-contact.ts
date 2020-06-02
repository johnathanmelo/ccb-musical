import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-edit-contact',
  templateUrl: 'edit-contact.html'
})
export class EditContactPage {
  loading: any;
  contact: Object;
  functions: Object[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController
  ) {
  }

  onClickEditContact() {
    if (this.areFieldsInvalid()) {
      return;
    }

    const confirm = this.alertCtrl.create({
      title: 'Deseja editar este contato?',
      buttons: [
        {
          text: 'Não',
          handler: () => { }
        },
        {
          text: 'Editar',
          handler: () => {
            this.editContact();
          }
        }
      ]
    });
    confirm.present();
  }

  editContact() {
    this.presentLoading();

    const Contact = Parse.Object.extend('Contact');
    const query = new Parse.Query(Contact);

    query.get(this.contact['objectId']).then((object) => {

      object.set('name', this.contact['name']);
      object.set('function', this.contact['function']);
      object.set('city', this.contact['city']);
      object.set('church', this.contact['church']);
      object.set('email', this.contact['email']);
      object.set('phone1', this.contact['phone1'] ? _.toNumber(this.contact['phone1'].replace(/\D/g, '')) : null);
      object.set('phone2', this.contact['phone2'] ? _.toNumber(this.contact['phone2'].replace(/\D/g, '')) : null);

      object.save().then(
        () => {
          this.loading.dismiss();
          this.presentToast('O contato foi editado com sucesso');
          this.navCtrl.pop().then(() => this.navCtrl.pop());
        },
        (error) => {
          this.loading.dismiss();
          console.error('Erro ao editar contato: ', error);
        });
    });
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
    query.ascending("createdAt");
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

  compareFn(m1: any, m2: any): boolean {
    return m1 && m2 ? m1.objectId === m2.objectId : m1 === m2;
  }

  presentToast(message) {
    this.toastCtrl.create({
      message: message,
      duration: 3000
    }).present();
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
      this.contact = this.navParams.get('contact');

      this.loading.dismiss();
    });
  }

}