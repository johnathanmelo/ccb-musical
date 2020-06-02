import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { ViewMeetingTypePage } from '../../meeting-type/view-meeting-type/view-meeting-type';
import { ViewContactPage } from '../../contact/view-contact/view-contact';
import { EditMeetingPage } from '../../meeting/edit-meeting/edit-meeting';
import * as moment from 'moment';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-view-meeting',
  templateUrl: 'view-meeting.html',
})
export class ViewMeetingPage {
  loading: any;
  meeting: Object;
  hasPermissionToEdit: Boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
  ) {
  }

  openEditMeeting() {
    this.navCtrl.push(EditMeetingPage, { meeting: this.meeting });
  }

  onClickViewMeetingResponsible() {
    this.navCtrl.push(ViewContactPage, { contactId: this.meeting['responsible'].objectId });
  }

  onClickViewMeetingType() {
    this.navCtrl.push(ViewMeetingTypePage, { meetingTypeId: this.meeting['type'].objectId });
  }

  onClickDeleteMeeting() {
    const confirm = this.alertCtrl.create({
      title: 'Deseja excluir a reunião?',
      buttons: [
        {
          text: 'Não',
          handler: () => { }
        },
        {
          text: 'Excluir',
          cssClass: 'alertDanger',
          handler: () => {
            this.deleteMeeting();
          }
        }
      ]
    });
    confirm.present();
  }

  deleteMeeting() {
    this.presentLoading();

    const Meeting = Parse.Object.extend('Meeting');
    const query = new Parse.Query(Meeting);
    query.get(this.meeting['objectId']).then((object) => {
      object.destroy().then(() => {
        this.loading.dismiss();
        this.presentToast('A reunião foi removida com sucesso');
        this.navCtrl.pop();
      }, (error) => {
        this.loading.dismiss();
        console.error('Erro ao deletar reunião: ', error);
      });
    });
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

  getSimpleObject(object: any, className: string, columnName: string, fieldNames: string[]) {
    var obj = {
      '__type': 'Pointer',
      'className': className,
      'objectId': object.get(columnName).id,
    };

    _.forEach(fieldNames, fieldName => {
      obj[fieldName] =  object.get(columnName).get(fieldName);
    });

    return obj;
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
    this.presentLoading();

    this.checkUserPermission();

    let meetingId = this.navParams.get('meetingId');

    const Meeting = Parse.Object.extend("Meeting");
    const query = new Parse.Query(Meeting);

    query.include("place.name");
    query.include("type.name");
    query.include("type.summary");
    query.include("responsible.name");
    query.include("regional.name");

    query.get(meetingId).then((object) => {
      this.loading.dismiss();
      this.meeting = {
        objectId: object.id,
        place: this.getSimpleObject(object, 'Sectorial', 'place', ['name']),
        date: moment(object.get("dateTime").toLocaleString('pt-BR'), "DD/MM/YYYY HH:mm").format("YYYY-MM-DD"),
        formattedDate: object.get("dateTime").toLocaleString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: object.get("dateTime").toLocaleString('pt-BR', { hour: 'numeric', minute: 'numeric' }),
        type: this.getSimpleObject(object, 'MeetingType', 'type', ['name', 'summary']),
        responsible: this.getSimpleObject(object, 'Contact', 'responsible', ['name']),
        observation: object.get("observation"),
        regional: object.get("regional") != undefined ? this.getSimpleObject(object, 'Regional', 'regional', ['name']) : null,
        done: object.get("dateTime").getTime() < new Date().getTime()
      };
    }, (error) => {
      this.loading.dismiss();
      console.error('Erro ao buscar reunião: ', error);
    });
  }

}
