import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-list-permission',
  templateUrl: 'list-permission.html',
})
export class ListPermissionPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter ListPermissionPage');
  }

}
