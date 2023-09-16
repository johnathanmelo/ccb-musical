import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import * as moment from 'moment';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-edit-rehearsal',
  templateUrl: 'edit-rehearsal.html',
})
export class EditRehearsalPage {
  rehearsal: Object;
  anciaoContacts: Object[];
  encarregadoRegContacts: Object[];
  minDate: String;
  maxDate: String;
  loading: any;

  constructor(
    private navParams: NavParams,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
  }

  onClickEditRehearsal() {
    if (this.areFieldsInvalid()) {
      return;
    }

    const confirm = this.alertCtrl.create({
      title: 'Deseja editar este ensaio regional?',
      buttons: [
        {
          text: 'Não',
          handler: () => { }
        },
        {
          text: 'Editar',
          handler: () => {
            this.editRehearsal();
          }
        }
      ]
    });
    confirm.present();
  }

  editRehearsal() {
    this.presentLoading();

    const Rehearsal = Parse.Object.extend('Rehearsal');
    const query = new Parse.Query(Rehearsal);

    query.get(this.rehearsal['objectId']).then(object => {

      object.set('city', this.rehearsal['city']);
      object.set('church', this.rehearsal['church']);
      object.set('dateTime', new Date(moment(this.rehearsal['date'] + ' ' + this.rehearsal['time']).format()));
      object.set('responsible', this.rehearsal['responsible']);
      object.set('musicalResponsible1', this.rehearsal['musicalResponsible1']);
      object.set('musicalResponsible2', this.rehearsal['musicalResponsible2']);
      object.set('observation', this.rehearsal['observation']);

      object.save().then(
        () => {
          this.loading.dismiss();
          this.presentToast('O ensaio regional foi editado com sucesso');
          this.navCtrl.pop().then(() => this.navCtrl.pop());
        },
        (error) => {
          this.loading.dismiss();
          console.error('Erro ao editar ensaio regional: ', error);
        });
    });
  }

  areFieldsInvalid() {
    if (this.rehearsal['city'] === undefined || !this.rehearsal['city'].replace(/\s/g, '').length) {
      this.presentToast('A cidade deve ser informada');
      return true;
    }

    if (this.rehearsal['date'] === undefined) {
      this.presentToast('A data deve ser informada');
      return true;
    }

    if (this.rehearsal['time'] === undefined) {
      this.presentToast('O horário deve ser informado');
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

    return composedQuery.find().then(results => {
      var sortedResults = _.orderBy(results, result => {
        return [result.get("function").get("name"), _.deburr(result.get("name"))];
      }, ['asc']);

      var contacts = sortedResults.map(result => ({
        '__type': 'Pointer',
        'className': 'Contact',
        'objectId': result.id,
        name: result.get("name"),
        city: result.get("city"),
        functionName: result.get("function").get("name")
      }));

      this.anciaoContacts = _.filter(contacts , contact => contact['functionName'] === 'Ancião');
      this.encarregadoRegContacts = _.filter(contacts , contact => contact['functionName'] === 'Encarregado Regional');
    }, (error) => {
      console.error('Erro ao buscar contatos: ', error);
    });
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

    promises.push(this.fetchContacts());

    Parse.Promise.all(promises).then(() => {
      this.minDate = moment().format("YYYY-MM-DD");
      this.maxDate = moment().add(5, 'years').format("YYYY");

      this.rehearsal = this.navParams.get('rehearsal');
      this.loading.dismiss();
    });
  }

}
