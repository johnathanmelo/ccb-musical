import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { ViewContactPage } from '../../contact/view-contact/view-contact';
import { EditRehearsalPage } from '../../rehearsal/edit-rehearsal/edit-rehearsal';
import { AuthUserProvider } from '../../../providers/auth-user/auth-user-provider';
import * as moment from 'moment';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-view-rehearsal',
  templateUrl: 'view-rehearsal.html',
  providers: [AuthUserProvider],
})
export class ViewRehearsalPage {
  loading: any;
  rehearsal: Object;
  hasPermissionToEdit: boolean = false;

  constructor(
    private navParams: NavParams,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private authUserProvider: AuthUserProvider,
  ) {
  }

  openEditRehearsal() {
    this.navCtrl.push(EditRehearsalPage, { rehearsal: this.rehearsal });
  }

  onClickViewRehearsalContact(objectId: any) {
    if (!objectId) return;
    if (!this.hasPermissionToEdit) return;

    this.navCtrl.push(ViewContactPage, { contactId: objectId });
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

  async ionViewWillEnter() {
    this.presentLoading();

    let rehearsalId = this.navParams.get('rehearsalId');

    const Rehearsal = Parse.Object.extend("Rehearsal");
    const query = new Parse.Query(Rehearsal);

    query.include("responsible");
    query.include("musicalResponsible1");
    query.include("musicalResponsible2");

    query.get(rehearsalId).then((object) => {
      this.loading.dismiss();
      this.rehearsal = {
        objectId: object.id,
        city: object.get("city"),
        church: object.get("church"),
        date: moment(object.get("dateTime").toLocaleString('pt-BR'), "DD/MM/YYYY HH:mm").format("YYYY-MM-DD"),
        formattedDate: object.get("dateTime").toLocaleString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: object.get("dateTime").toLocaleString('pt-BR', { hour: 'numeric', minute: 'numeric' }),
        responsible: this.getSimpleObject(object, 'Contact', 'responsible', ['name', 'city']),
        musicalResponsible1: this.getSimpleObject(object, 'Contact', 'musicalResponsible1', ['name', 'city']),
        musicalResponsible2: this.getSimpleObject(object, 'Contact', 'musicalResponsible2', ['name', 'city']),
        observation: object.get("observation"),
        done: object.get("dateTime").getTime() < new Date().getTime()
      };
    }, (error) => {
      this.loading.dismiss();
      console.error('Erro ao buscar ensaio regional: ', error);
    });

    this.hasPermissionToEdit = await this.authUserProvider.hasPermissionToEditAsync();
  }

}
