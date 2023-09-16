import { Component } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Network } from '@ionic-native/network';
import Parse from 'parse';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;
  connected: boolean;
  APP_ID: string = "insert here app id";
  JS_KEY: string = "insert here js key";

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public network: Network,
    public alertCtrl: AlertController
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      this.listenConnectionChanges(platform, network);

      Parse.initialize(this.APP_ID, this.JS_KEY);
      Parse.serverURL = 'https://parseapi.back4app.com/';

      Parse.User.currentAsync().then(user => {
        //console.log('Logged user', user);

        this.rootPage = 'HomePage';
      });
    });
  }

  listenConnectionChanges(platform: Platform, network: Network) {
    const onDevice = platform.is('cordova');
    if (onDevice) {
      this.connected = network.type !== 'none';
      network.onDisconnect().subscribe(() => {
        this.connected = false;
        this.presentNetworkAlert();
      });

      network.onConnect().subscribe(() => { this.connected = true; });
    } else {
      this.connected = window.navigator.onLine;
      window.addEventListener('offline', () => {
        this.connected = false;
        this.presentNetworkAlert();
      });

      window.addEventListener('online', () => { this.connected = true; });
    }

    if (!this.connected) {
      this.presentNetworkAlert();
    }
  }

  presentNetworkAlert() {
    let alert = this.alertCtrl.create({
      title: 'Sem internet!',
      subTitle: 'Conecte-se à internet para usar o aplicativo CCB Musical.',
      enableBackdropDismiss: false,
      buttons: [{
        text: 'Tentar novamente',
        handler: () => {
          if(this.connected) alert.dismiss();
          return false;
        }
      }]
    });

    alert.present();
  }
}

