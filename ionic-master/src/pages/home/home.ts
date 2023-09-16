import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { ListRehearsalPage } from '../rehearsal/list-rehearsal/list-rehearsal';
import { ListLocalRehearsalPage } from '../local-rehearsal/list-local-rehearsal/list-local-rehearsal'
import { ListContactTypePage } from '../contact/list-contact-type/list-contact-type';
import { ListPermissionPage } from '../permission/list-permission/list-permission';
import Parse from 'parse';
import { AuthUserProvider } from '../../providers/auth-user/auth-user-provider';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [AuthUserProvider],
})
export class HomePage {
  loading: any;
  isLogged: boolean = false;
  isAdmin: boolean = false;

  constructor(
    public navParams: NavParams,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private authUserProvider: AuthUserProvider,
  ) {
  }

  openListRehearsalPage() {
    this.navCtrl.push(ListRehearsalPage);
  }

  openListLocalRehearsalPage() {
    this.navCtrl.push(ListLocalRehearsalPage);
  }

  openListContactTypePage() {
    this.navCtrl.push(ListContactTypePage);
  }

  openListPermissionPage() {
    this.navCtrl.push(ListPermissionPage);
  }

  onClickLogIn() {
    this.navCtrl.setRoot('LoginPage');
  }

  onClickLogOut() {
    const confirm = this.alertCtrl.create({
      title: 'Sair da área restrita?',
      buttons: [
        {
          text: 'Voltar',
          handler: () => {}
        },
        {
          text: 'Sair',
          handler: () => {
            this.logOut();
          }
        }
      ]
    });
    confirm.present();
  }

  logOut() {
    this.presentLoading();

    Parse.User.logOut().then(() => {
      this.loading.dismiss();

      this.navCtrl.setRoot('HomePage');
    }, () => {
      this.loading.dismiss();

      this.toastCtrl.create({
        message: 'Erro ao fazer logout. Tente novamente.',
        duration: 2000
      }).present();
    })
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }

  async ionViewWillEnter() {
    this.isLogged = this.authUserProvider.isLogged();
    this.isAdmin = await this.authUserProvider.isAdminAsync();
  }
}