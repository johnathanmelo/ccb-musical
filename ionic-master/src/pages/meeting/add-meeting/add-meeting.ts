import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { ListMeetingTypePage } from '../../meeting-type/list-meeting-type/list-meeting-type';
import * as moment from 'moment';
import * as _ from 'lodash';
import Parse from 'parse';

@Component({
  selector: 'page-add-meeting',
  templateUrl: 'add-meeting.html',
})
export class AddMeetingPage {
  meeting: Object = new Object();
  regionals: Object[];
  sectorials: Object[];
  meetingTypes: Object[];
  filteredContacts: Object[];
  minDate: String;
  maxDate: String;
  loading: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
  ) {

  }

  openMeetingTypes() {
    this.navCtrl.push(ListMeetingTypePage);
  }

  saveNewMeeting() {
    if (this.areFieldsInvalid()) {
      return;
    }

    this.presentLoading();

    const Meeting = Parse.Object.extend('Meeting');
    const myNewObject = new Meeting();

    myNewObject.set('regional',this.meeting['regional']);
    myNewObject.set('type', this.meeting['type']);
    myNewObject.set('place', this.meeting['place']);
    myNewObject.set('dateTime', new Date(moment(this.meeting['date'] + ' ' + this.meeting['time']).format()));
    myNewObject.set('responsible', this.meeting['responsible']);
    myNewObject.set('observation', this.meeting['observation']);

    myNewObject.save().then(
      () => {
        this.loading.dismiss();
        this.presentToast('A reunião foi criada com sucesso');
        this.navCtrl.pop();
      },
      (error) => {
        this.loading.dismiss();
        console.error('Erro ao criar reunião: ', error);
      }
    );
  }

  areFieldsInvalid() {
    if (this.meeting['type'] === undefined) {
      this.presentToast('O tipo de reunião deve ser informado');
      return true;
    }

    if (this.meeting['place'] === undefined) {
      this.presentToast('O local deve ser informado');
      return true;
    }

    if (this.meeting['date'] === undefined) {
      this.presentToast('A data deve ser informada');
      return true;
    }

    if (this.meeting['time'] === undefined) {
      this.presentToast('O horário deve ser informado');
      return true;
    }

    if (this.meeting['responsible'] === undefined) {
      this.presentToast('O campo atendimento deve ser informado');
      return true;
    }

    return false;
  }

  presentToast(message) {
    this.toastCtrl.create({
      message: message,
      duration: 3000
    }).present();
  }

  getContactObjectByFunctionId(id: String) {
    return {
      '__type': 'Pointer',
      'className': 'Function',
      'objectId': id
    };
  }

  fetchContacts() {
    const Contact = Parse.Object.extend('Contact');

    const anciaoQuery = new Parse.Query(Contact);
    anciaoQuery.equalTo("function", this.getContactObjectByFunctionId('6UnlzqFTt5'));

    const encarregadoRegQuery = new Parse.Query(Contact);
    encarregadoRegQuery.equalTo("function", this.getContactObjectByFunctionId('hvVr3Dyvep'));

    const composedQuery = Parse.Query.or(anciaoQuery, encarregadoRegQuery);
    composedQuery.include("function.name");

    return composedQuery.find().then((results) => {
      var sortedResults = _.orderBy(results, (result) => {
        return [result.get("function").get("name"), _.deburr(result.get("name"))];
      }, ['asc']);

      this.filteredContacts = sortedResults.map((result) => {
        return {
          '__type': 'Pointer',
          'className': 'Contact',
          'objectId': result.id,
          name: result.get("name"),
          city: result.get("city")
        };
      });
    }, (error) => {
      console.error('Erro ao buscar contatos: ', error);
    });
  }

  fetchMeetingTypes() {
    const MeetingType = Parse.Object.extend('MeetingType');
    const query = new Parse.Query(MeetingType);
    query.ascending("name");
    return query.find().then((results) => {
      this.meetingTypes = results.map((result) => {
        return {
          '__type': 'Pointer',
          'className': 'MeetingType',
          'objectId': result.id,
          name: result.get("name"),
          summary: result.get("summary")
        };
      });
    }, (error) => {
      console.error('Erro ao buscar tipos de reunião: ', error);
    });
  }

  fetchSectorials() {
    const Sectorial = Parse.Object.extend('Sectorial');
    const query = new Parse.Query(Sectorial);
    query.ascending("name");
    return query.find().then((results) => {
      this.sectorials = results.map((result) => {
        return {
          '__type': 'Pointer',
          'className': 'Sectorial',
          'objectId': result.id,
          name: result.get("name")
        };
      });
    }, (error) => {
      console.error('Erro ao buscar setoriais: ', error);
    });
  }

  fetchRegionals() {
    const Regional = Parse.Object.extend('Regional');
    const query = new Parse.Query(Regional);
    query.ascending("name");
    return query.find().then((results) => {
      this.regionals = results.map((result) => {
        return {
          '__type': 'Pointer',
          'className': 'Regional',
          'objectId': result.id,
          name: result.get("name")
        };
      });
    }, (error) => {
      console.error('Erro ao buscar regionais: ', error);
    });
  }

  getMeetingTypeSummary() {
    return _.find(this.meetingTypes, (meetingType) => {
      return meetingType.objectId == this.meeting['type'].objectId;
    }).summary;
  }

  compareFn(m1: any, m2: any): boolean {
    return m1 && m2 ? m1.objectId === m2.objectId : m1 === m2;
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }

  ionViewWillEnter() {
    this.presentLoading();

    const promises = [];

    promises.push(this.fetchRegionals());
    promises.push(this.fetchSectorials());
    promises.push(this.fetchMeetingTypes());
    promises.push(this.fetchContacts());

    Parse.Promise.all(promises).then(() => {
      this.minDate = moment().format("YYYY-MM-DD");
      this.maxDate = moment().add(5, 'years').format("YYYY");

      this.loading.dismiss();
    });
  }

}