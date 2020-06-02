import { Component } from '@angular/core';
import { IonicPage, NavController,NavParams, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { ListMeetingPage } from '../meeting/list-meeting/list-meeting';
import { ListTopicPage } from '../topic/list-topic/list-topic';
import { ListRehearsalPage } from '../rehearsal/list-rehearsal/list-rehearsal';
import { ListLocalRehearsalPage } from '../local-rehearsal/list-local-rehearsal/list-local-rehearsal'
import { ListContactTypePage } from '../contact/list-contact-type/list-contact-type';
import { AddPermissionPage } from '../permission/add-permission/add-permission';
import Parse from 'parse';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  loading: any;
  isAdmin: Boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
  ) {
  }

  openListMeetingPage() {
    this.navCtrl.push(ListMeetingPage);
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

  openListTopicPage() {
    this.navCtrl.push(ListTopicPage);
  }

  openAddPermissionPage() {
    this.navCtrl.push(AddPermissionPage);
  }

  onClickLogOut() {
    const confirm = this.alertCtrl.create({
      title: 'Sair do aplicativo?',
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

    Parse.User.logOut().then((resp) => {
      this.loading.dismiss();

      this.navCtrl.setRoot('LoginPage');
    }, err => {
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

  checkUserPermission() {
    const RegisteredEmail = Parse.Object.extend('RegisteredEmail');
    var query = new Parse.Query(RegisteredEmail);
    query.equalTo('email', Parse.User.current().get("email"));

    query.first().then(registeredUser => {
      this.isAdmin = registeredUser.get("isAdmin");
    });
  }

  ionViewWillEnter() {
    this.checkUserPermission();
  }

}