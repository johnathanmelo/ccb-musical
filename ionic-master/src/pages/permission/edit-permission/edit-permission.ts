import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, AlertController } from 'ionic-angular';
import Parse from 'parse';

@Component({
  selector: 'page-edit-permission',
  templateUrl: 'edit-permission.html',
})
export class EditPermissionPage {
  registeredEmail: Object;
  loading: any;
  isMyPermission: boolean = false;

  constructor(
    private navParams: NavParams,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
  ) {
  }

  onClickEditPermission() {
    const confirm = this.alertCtrl.create({
      title: 'Deseja editar esta permissão?',
      buttons: [
        {
          text: 'Não',
          handler: () => { }
        },
        {
          text: 'Editar',
          handler: () => {
            this.editPermission();
          }
        }
      ]
    });
    confirm.present();
  }

  editPermission() {
    this.presentLoading();

    const RegisteredEmail = Parse.Object.extend('RegisteredEmail');
    const query = new Parse.Query(RegisteredEmail);

    query.get(this.registeredEmail['objectId']).then((object) => {

      object.set('permissionToEdit', this.registeredEmail['permissionToEdit']);
      object.set('isAdmin', this.registeredEmail['isAdmin']);

      object.save().then(
        () => {
          this.loading.dismiss();
          this.presentToast('A permissão foi editada com sucesso');
          this.navCtrl.pop();
        },
        (error) => {
          this.loading.dismiss();
          console.error('Erro ao editar permissão: ', error);
        });
    });
  }

  canDeletePermission() {
    const User = Parse.Object.extend('User');

    const query = new Parse.Query(User);
    query.equalTo('email', this.registeredEmail['email']);

    return query.find().then((results) => {
      if (results.length == 0) {
        return true;
      } else {
        return false;
      }
    });
  }

  onClickDeleteContact() {
    const confirm = this.alertCtrl.create({
      title: 'Deseja excluir esta permissão?',
      buttons: [
        {
          text: 'Não',
          handler: () => { }
        },
        {
          text: 'Excluir',
          cssClass: 'alertDanger',
          handler: () => {
            this.presentLoading();

            this.canDeletePermission().then((canDelete) => {
              if (canDelete) {
                this.deletePermission();
              } else {
                this.loading.dismiss();
                this.presentAlert();
              }
            }, (error) => {
              this.loading.dismiss();
              console.error('Erro ao buscar usuários vinculados: ', error);
            });
          }
        }
      ]
    });
    confirm.present();
  }

  deletePermission() {
    const RegisteredEmail = Parse.Object.extend('RegisteredEmail');
    const query = new Parse.Query(RegisteredEmail);

    query.get(this.registeredEmail['objectId']).then((object) => {
      object.destroy().then(() => {
        this.loading.dismiss();
        this.presentToast('A permissão foi removida com sucesso');
        this.navCtrl.pop();
      }, (error) => {
        this.loading.dismiss();
        console.error('Erro ao deletar permissão: ', error);
      });
    });
  }

  presentAlert() {
    this.alertCtrl.create({
      title: 'Atenção',
      message: 'Não é possível excluir esta permissão, pois ela está vinculada a uma conta ativa.',
      buttons: ['Ok']
    }).present();
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
    this.registeredEmail = this.navParams.get('registeredEmail');
    this.registeredEmail['permissionToEdit'] = true;

    this.isMyPermission = Parse.User.current().get("email") === this.registeredEmail['email'];
  }

}
