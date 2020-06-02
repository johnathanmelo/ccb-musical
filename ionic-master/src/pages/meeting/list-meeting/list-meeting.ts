import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { AddMeetingPage } from '../add-meeting/add-meeting';
import { ViewMeetingPage } from '../view-meeting/view-meeting';
import * as moment from 'moment';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-list-meeting',
  templateUrl: 'list-meeting.html',
})
export class ListMeetingPage {
  dateFilter: moment.unitOfTime.StartOf = 'month';
  textFilter: string = '';
  meetings: Object[];
  loading: any;
  hasPermissionToEdit: Boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
  ) {
  }

  viewMeeting(meeting: Object) {
    this.navCtrl.push(ViewMeetingPage, { meetingId: meeting['objectId'] });
  }

  onChangeSearchbar(ev: any) {
    this.textFilter = ev.target.value;
    this.fetchMeetings();
  }

  getTextQuery(Meeting: Object) {
    // Regional
    const Regional = Parse.Object.extend("Regional");
    const regionalQuery = new Parse.Query(Regional);
    regionalQuery.matches("name", this.textFilter, "i");

    const mainRegionalQuery = new Parse.Query(Meeting);
    mainRegionalQuery.matchesQuery("regional", regionalQuery);

    // Meeting Summary
    const MeetingType = Parse.Object.extend("MeetingType");
    const meetingTypeQuery = new Parse.Query(MeetingType);
    meetingTypeQuery.matches("summary", this.textFilter, "i");

    const mainMeetingTypeQuery = new Parse.Query(Meeting);
    mainMeetingTypeQuery.matchesQuery("type", meetingTypeQuery);

    // Place
    const Sectorial = Parse.Object.extend("Sectorial");
    const sectorialQuery = new Parse.Query(Sectorial);
    sectorialQuery.matches("name", this.textFilter, "i");

    const mainSectorialQuery = new Parse.Query(Meeting);
    mainSectorialQuery.matchesQuery("place", sectorialQuery);

    // Responsible
    const Contact = Parse.Object.extend("Contact");
    const contactQuery = new Parse.Query(Contact);
    contactQuery.matches("name", this.textFilter, "i");

    const mainContactQuery = new Parse.Query(Meeting);
    mainContactQuery.matchesQuery("responsible", contactQuery);

    return Parse.Query.or(mainRegionalQuery, mainMeetingTypeQuery, mainSectorialQuery, mainContactQuery);
  }

  getDateQuery(Meeting: Object) {
    var minDate, maxDate;

    minDate = new Date(moment().startOf(this.dateFilter).format());
    maxDate = new Date(moment().endOf(this.dateFilter).format());

    const minDateQuery = new Parse.Query(Meeting);
    minDateQuery.greaterThanOrEqualTo("dateTime", minDate);

    const maxDateQuery = new Parse.Query(Meeting);
    maxDateQuery.lessThanOrEqualTo("dateTime", maxDate);

    return Parse.Query.and(minDateQuery, maxDateQuery);
  }

  fetchMeetings() {
    this.presentLoading();
    const Meeting = Parse.Object.extend("Meeting");

    const dateQuery = (this.dateFilter == 'month' || this.dateFilter == 'year')
      ? this.getDateQuery(Meeting)
      : new Parse.Query(Meeting);

    const textQuery = (this.textFilter && this.textFilter.trim() != '')
      ? this.getTextQuery(Meeting)
      : new Parse.Query(Meeting);

    const query = Parse.Query.and(dateQuery, textQuery);
    query.include("place.name");
    query.include("type.name");
    query.include("type.summary");

    query.find().then((results) => {
      this.loading.dismiss();

      var sortedResults = _.orderBy(results, (result) => {
        return [result.get("dateTime").getTime(), result.get("type").get("name")];
      }, ['asc']);

      this.meetings = sortedResults.map((result) => {
        return {
          'objectId': result.id,
          placeName: result.get("place").get("name"),
          date: result.get("dateTime").toLocaleString('pt-BR', { year: 'numeric', month: 'numeric', day: 'numeric' }),
          time: result.get("dateTime").toLocaleString('pt-BR', { hour: 'numeric', minute: 'numeric' }),
          typeSummary: result.get("type").get("summary"),
          done: result.get("dateTime").getTime() < new Date().getTime()
        };
      });
    }, (error) => {
      this.loading.dismiss();
      console.error('Erro ao buscar reuniões: ', error);
    });
  }

  addMeeting() {
    this.navCtrl.push(AddMeetingPage);
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }

  isEmpty(meetings: Object[]) {
    return _.isEmpty(meetings);
  }

  checkUserPermission() {
    const RegisteredEmail = Parse.Object.extend('RegisteredEmail');
    var query = new Parse.Query(RegisteredEmail);
    query.equalTo('email', Parse.User.current().get("email"));

    query.first().then(registeredUser => {
      this.hasPermissionToEdit = registeredUser.get("permissionToEdit");
    });
  }

  ionViewWillEnter() {
    this.checkUserPermission();
    this.fetchMeetings();
  }

}