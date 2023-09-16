import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { ViewContactPage } from '../../contact/view-contact/view-contact';
import { EditRehearsalPage } from '../../rehearsal/edit-rehearsal/edit-rehearsal';
import * as moment from 'moment';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-view-rehearsal',
  templateUrl: 'view-rehearsal.html',
})
export class ViewRehearsalPage {
  loading: any;
  rehearsal: Object;
  hasPermissionToEdit: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
  ) {
  }

  openEditRehearsal() {
    this.navCtrl.push(EditRehearsalPage, { rehearsal: this.rehearsal });
  }

  onClickViewRehearsalContact(objectId: any) {
    if (objectId) {
      this.navCtrl.push(ViewContactPage, { contactId: objectId });
    }
  }

  onClickDeleteRehearsal() {
    const confirm = this.alertCtrl.create({
      title: 'Deseja excluir o ensaio regional?',
      buttons: [
        {
          text: 'Não',
          handler: () => { }
        },
        {
          text: 'Excluir',
          cssClass: 'alertDanger',
          handler: () => {
            this.deleteRehearsal();
          }
        }
      ]
    });
    confirm.present();
  }

  deleteRehearsal() {
    this.presentLoading();

    const Rehearsal = Parse.Object.extend('Rehearsal');
    const query = new Parse.Query(Rehearsal);
    query.get(this.rehearsal['objectId']).then((object) => {
      object.destroy().then(() => {
        this.loading.dismiss();
        this.presentToast('O ensaio foi removido com sucesso');
        this.navCtrl.pop();
      }, (error) => {
        this.loading.dismiss();
        console.error('Erro ao deletar ensaio: ', error);
      });
    });
  }

  presentToast(message) {
    this.toastCtrl.create({
      message: message,
      duration: 3000
    }).present();
  }

  getSimpleObject(object: any, className: string, columnName: string, fieldNames: string[]) {
    if (!object.get(columnName)) return;

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

  presentLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
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

    let rehearsalId = this.navParams.get('rehearsalId');

    const Rehearsal = Parse.Object.extend("Rehearsal");
    const query = new Parse.Query(Rehearsal);

    query.include("city");
    query.include("church");
    query.include("responsible.name");

    query.get(rehearsalId).then((object) => {
      this.loading.dismiss();
      this.rehearsal = {
        objectId: object.id,
        city: object.get("city"),
        church: object.get("church"),
        date: moment(object.get("dateTime").toLocaleString('pt-BR'), "DD/MM/YYYY HH:mm").format("YYYY-MM-DD"),
        formattedDate: object.get("dateTime").toLocaleString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: object.get("dateTime").toLocaleString('pt-BR', { hour: 'numeric', minute: 'numeric' }),
        responsible: this.getSimpleObject(object, 'Contact', 'responsible', ['name']),
        musicalResponsible1: this.getSimpleObject(object, 'Contact', 'musicalResponsible1', ['name']),
        musicalResponsible2: this.getSimpleObject(object, 'Contact', 'musicalResponsible2', ['name']),
        observation: object.get("observation"),
        done: object.get("dateTime").getTime() < new Date().getTime()
      };
    }, (error) => {
      this.loading.dismiss();
      console.error('Erro ao buscar ensaio regional: ', error);
    });
  }

}
