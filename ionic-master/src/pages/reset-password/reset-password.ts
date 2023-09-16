import { Component } from "@angular/core";
import {
  NavController,
  ToastController,
  LoadingController
} from "ionic-angular";
import Parse from "parse";

@Component({
  selector: "page-reset-password",
  templateUrl: "reset-password.html"
})
export class ResetPasswordPage {
  email: string;
  loading: any;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  onClickResetPassword() {
    this.presentLoading();

    Parse.User.requestPasswordReset(this.email)
      .then(() => {
        const msg = `Obrigado! Verifique se você recebeu um link para redefinir a sua senha no email ${this.email}`;
        this.presentToast(msg);

        this.loading.dismiss();
        this.navCtrl.pop();
      })
      .catch(err => {
        this.loading.dismiss();
        this.presentToast(this.getErrorMessage(err));
      });
  }

  getErrorMessage(error) {
    const errorMessage = {
      100: 'Conecte-se à internet e tente novamente.',
      204: "Digite um email válido.",
      205: `Desculpe! Não encontramos nenhuma conta com o email ${this.email}`,
    };

    return errorMessage[error.code] || error.message;
  }

  presentToast(message) {
    this.toastCtrl
      .create({
        message: message,
        showCloseButton: true,
        closeButtonText: "OK"
      })
      .present();
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }
}
