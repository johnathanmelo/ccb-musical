import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { ViewMeetingTypePage } from '../view-meeting-type/view-meeting-type';
import Parse from 'parse';

@Component({
  selector: 'page-list-meeting-type',
  templateUrl: 'list-meeting-type.html',
})
export class ListMeetingTypePage {
  meetingTypes: Object[];
  loading: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
  ) {
  }

  viewMeetingType(meetingType: Object) {
    this.navCtrl.push(ViewMeetingTypePage, { meetingTypeId: meetingType['objectId'] });
  }

  fetchMeetingTypes() {
    this.presentLoading();

    const MeetingType = Parse.Object.extend('MeetingType');
    const query = new Parse.Query(MeetingType);
    query.ascending("name");
    query.find().then((results) => {
      this.loading.dismiss();

      this.meetingTypes = results.map((result) => {
        return {
          'objectId': result.id,
          name: result.get("name"),
          summary: result.get("summary")
        };
      });
    }, (error) => {
      this.loading.dismiss();
      console.error('Erro ao buscar tipos de reunião: ', error);
    });
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }

  ionViewWillEnter() {
    this.fetchMeetingTypes();
  }

}
