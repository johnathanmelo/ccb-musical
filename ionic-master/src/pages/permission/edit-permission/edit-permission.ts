import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-edit-permission',
  templateUrl: 'edit-permission.html',
})
export class EditPermissionPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter EditPermissionPage');
  }

}
