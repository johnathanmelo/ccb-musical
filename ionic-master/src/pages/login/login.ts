import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, ToastController, LoadingController } from 'ionic-angular';
import { ResetPasswordPage } from '../reset-password/reset-password';
import Parse from 'parse';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  email: string;
  password: string;
  passwordValidation: string;
  loading: any;
  isPasswordVisible: Boolean = false;

  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
  ) {
  }

  onClickForgotPassword() {
    this.navCtrl.push(ResetPasswordPage);
  }

  onClickSignUp() {
    if (this.areFieldsInvalid()) {
      return;
    }

    this.presentLoading();

    const RegisteredEmail = Parse.Object.extend('RegisteredEmail');
    const query = new Parse.Query(RegisteredEmail);

    query.equalTo("email", this.email.toLowerCase());
    query.find().then((response) => {
      if (response.length == 1 && response[0].id != null) {
        this.signUp();
      } else {
        this.loading.dismiss();

        this.alertCtrl.create({
          title: 'Acesso negado',
          message: 'Solicite seu acesso enviando uma mensagem para (31) 99326-6210',
          buttons: ['Ok']
        }).present();
      }
    }, (error) => {
      this.loading.dismiss();
      console.error('Erro ao buscar RegisteredEmail: ', error);
    });
  }

  signUp() {
    Parse.User.signUp(this.email.toLowerCase(), this.password, { email: this.email.toLowerCase() }).then(() => {
      this.loading.dismiss();

      this.alertCtrl.create({
        title: 'Bem vindo!',
        message: 'Conta criada com sucesso!',
        buttons: ['Ok']
      }).present();

      this.navCtrl.setRoot('HomePage');
    }, err => {
      this.loading.dismiss();
      var msg = this.translateMessage(err.message);
      this.presentToast(msg);
    });
  }

  translateMessage(message: String) {
    if (message === 'Account already exists for this username.') {
      return 'Esse e-mail já está sendo usado por outra conta.';
    }

    if (message === 'Invalid username/password.') {
      return 'Usuário inexistente ou senha inválida.';
    }
  }

  areFieldsInvalid() {
    if (this.email === undefined || !this.email.replace(/\s/g, '').length) {
      this.email = '';
      this.presentToast('O e-mail deve ser informado.');
      return true;
    }

    if (this.password === undefined || !this.password.replace(/\s/g, '').length) {
      this.password = '';
      this.presentToast('A senha deve ser informada.');
      return true;
    }

    if (this.passwordValidation === undefined || !this.passwordValidation.replace(/\s/g, '').length) {
      this.passwordValidation = '';
      this.presentToast('Digite a senha novamente.');
      return true;
    }

    if (this.password !== this.passwordValidation) {
      this.password = '';
      this.passwordValidation = '';

      this.presentToast('Os campos de senha estão diferentes. Digite-os novamente.');
      return true;
    }

    return false;
  }

  signIn() {
    if (this.areFieldsInvalid()) {
      return;
    }

    this.presentLoading();

    Parse.User.logIn(this.email.toLowerCase(), this.password).then(() => {
      this.loading.dismiss();
      this.navCtrl.setRoot('HomePage');
    }, err => {
      this.loading.dismiss();
      var msg = this.translateMessage(err.message);
      this.presentToast(msg);
    });
  }

  redirectToYoutube() {
    var link = 'https://youtu.be/-2pwe1XpUXU';
    window.open(link, '_blank', 'location=yes');
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
}