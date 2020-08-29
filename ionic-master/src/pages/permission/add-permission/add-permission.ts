import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import Parse from 'parse';

@Component({
  selector: 'page-add-permission',
  templateUrl: 'add-permission.html',
})
export class AddPermissionPage {
  registeredEmail: Object = new Object();
  loading: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
  ) {
  }

  saveNewPermission() {
    if (this.areFieldsInvalid()) {
      return;
    }

    this.presentLoading();

    const RegisteredEmail = Parse.Object.extend('RegisteredEmail');
    const myNewObject = new RegisteredEmail();

    myNewObject.set('email', this.registeredEmail['email']);
    myNewObject.set('permissionToEdit', this.registeredEmail['permissionToEdit']);
    myNewObject.set('isAdmin', this.registeredEmail['isAdmin']);

    myNewObject.save().then(
      () => {
        this.loading.dismiss();
        this.presentToast('A permissão foi criada com sucesso');
        this.navCtrl.pop();
      },
      (err) => {
        this.loading.dismiss();
        var msg = this.translateMessage(err.code);
        this.presentToast(msg);
      }
    );
  }

  translateMessage(code: Number) {
    if (code === 137) {
      return 'Este e-mail já está cadastrado no sistema.';
    }
  }

  areFieldsInvalid() {
    if (this.registeredEmail['email'] === undefined || !this.registeredEmail['email'].replace(/\s/g, '').length) {
      this.presentToast('O e-mail deve ser informado.');
      return true;
    }

    return false;
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
    this.registeredEmail['permissionToEdit'] = false;
    this.registeredEmail['isAdmin'] = false;
  }

}
