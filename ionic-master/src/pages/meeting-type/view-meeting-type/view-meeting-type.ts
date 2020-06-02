import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import Parse from 'parse';

@Component({
  selector: 'page-view-meeting-type',
  templateUrl: 'view-meeting-type.html',
})
export class ViewMeetingTypePage {
  loading: any;
  meetingType: Object;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
  ) {
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }

  ionViewWillEnter() {
    this.presentLoading();

    let meetingTypeId = this.navParams.get('meetingTypeId');

    const MeetingType = Parse.Object.extend("MeetingType");
    const query = new Parse.Query(MeetingType);

    query.get(meetingTypeId).then((object) => {
      this.loading.dismiss();
      this.meetingType = {
        id: object.id,
        name: object.get("name"),
        summary: object.get("summary"),
        presidency: object.get("presidency"),
        coverage: object.get("coverage"),
        hasWord: object.get("hasWord"),
        hasRecord: object.get("hasRecord"),
        frequency: object.get("frequency"),
        participants: object.get("participants"),
        agenda: object.get("agenda"),
        goals: object.get("goals")
      };
    }, (error) => {
      this.loading.dismiss();
      console.error('Erro ao buscar tipo de reunião: ', error);
    });
  }

}
