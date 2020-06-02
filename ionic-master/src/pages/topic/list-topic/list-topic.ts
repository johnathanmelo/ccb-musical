import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-list-topic',
  templateUrl: 'list-topic.html',
})
export class ListTopicPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter ListTopicPage');
  }

}
