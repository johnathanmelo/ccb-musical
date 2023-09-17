import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import * as moment from 'moment';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-edit-local-rehearsal',
  templateUrl: 'edit-local-rehearsal.html',
})
export class EditLocalRehearsalPage {
  localRehearsal: Object = new Object();
  encarregadoLocalContacts: Object[];
  weekDays: Object[];
  weekOrders: Object[];
  monthlyFrequencies: Object[];
  months: Object[];
  loading: any;

  constructor(
    private navParams: NavParams,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
  }

  onClickEditLocalRehearsal() {
    if (this.areFieldsInvalid()) {
      return;
    }

    const confirm = this.alertCtrl.create({
      title: 'Deseja editar este ensaio local?',
      buttons: [
        {
          text: 'Não',
          handler: () => { }
        },
        {
          text: 'Editar',
          handler: () => {
            this.editLocalRehearsal();
          }
        }
      ]
    });
    confirm.present();
  }

  editLocalRehearsal() {
    this.presentLoading();

    const LocalRehearsal = Parse.Object.extend('LocalRehearsal');
    const query = new Parse.Query(LocalRehearsal);

    query.get(this.localRehearsal['objectId']).then((object) => {

      object.set('city', this.localRehearsal['city']);
      object.set('church', this.localRehearsal['church']);
      object.set('responsible', this.localRehearsal['responsible']);
      object.set('monthlyFrequency', this.localRehearsal['monthlyFrequency']['objectId']);
      object.set('time', new Date(moment('1970-01-01 ' + this.localRehearsal['time']).format()));

      this.localRehearsal['weekDay']
        ? object.set('weekDay', this.localRehearsal['weekDay']['value'])
        : object.unset('weekDay');

      this.localRehearsal['weekOrder']
        ? object.set('weekOrder', this.localRehearsal['weekOrder']['objectId'])
        : object.unset('weekOrder');

      this.localRehearsal['specificMonths']
        ? object.set('specificMonths', this.localRehearsal['specificMonths'])
        : object.unset('specificMonths');
      
      this.localRehearsal['observation']
        ? object.set('observation', this.localRehearsal['observation'])
        : object.unset('observation');

      object.save().then(
        () => {
          this.loading.dismiss();
          this.presentToast('O ensaio local foi editado com sucesso');
          this.navCtrl.pop().then(() => this.navCtrl.pop());
        },
        (error) => {
          this.loading.dismiss();
          console.error('Erro ao editar ensaio local: ', error);
        }
      );
    });
  }

  areFieldsInvalid() {
    if (this.localRehearsal['city'] === undefined || !this.localRehearsal['city'].replace(/\s/g, '').length) {
      this.presentToast('A cidade deve ser informada');
      return true;
    }

    if (this.localRehearsal['monthlyFrequency'] === undefined) {
      this.presentToast('A frequência mensal deve ser informada');
      return true;
    }

    if (this.localRehearsal['monthlyFrequency']['objectId'] === 'SPECIFIC' && (this.localRehearsal['specificMonths'] === undefined || this.localRehearsal['specificMonths'].length == 0)) {
      this.presentToast('Os meses específicos devem ser informados');
      return true;
    }

    if (this.localRehearsal['monthlyFrequency']['objectId'] !== 'NONE' && this.localRehearsal['weekDay'] === undefined) {
      this.presentToast('O dia da semana deve ser informado');
      return true;
    }

    if (this.localRehearsal['monthlyFrequency']['objectId'] !== 'NONE' && this.localRehearsal['weekOrder'] === undefined) {
      this.presentToast('A semana deve ser informada');
      return true;
    }

    if (this.localRehearsal['monthlyFrequency']['objectId'] === 'NONE' && (this.localRehearsal['observation'] === undefined || !this.localRehearsal['observation'].replace(/\s/g, '').length)) {
      this.presentToast('As datas devem ser informadas');
      return true;
    }

    if (this.localRehearsal['time'] === undefined) {
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

    const query = new Parse.Query(Contact);
    query.equalTo("function", this.getContactObjectByFunctionId('32OWVYU7Ja'));

    return query.find().then((results) => {
      var sortedResults = _.orderBy(results, (result) => {
        return [result.get("function").get("name"), _.deburr(result.get("name"))];
      }, ['asc']);

      this.encarregadoLocalContacts = sortedResults.map((result) => {
        return {
          '__type': 'Pointer',
          'className': 'Contact',
          'objectId': result.id,
          name: result.get("name"),
          city: result.get("city"),
        };
      });
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

  getWeekDays() {
    return [
      {objectId: 1, value: 'Domingo'},
      {objectId: 7, value: 'Sábado'},
      {objectId: 6, value: 'Sexta-feira'},
      {objectId: 5, value: 'Quinta-feira'},
      {objectId: 4, value: 'Quarta-feira'},
      {objectId: 3, value: 'Terça-feira'},
      {objectId: 2, value: 'Segunda-feira'},
    ]
  }

  onChangeWeekDay() {
    this.weekOrders = this.getWeekOrders();
  }

  onChangeMonthlyFrequency() {
    delete this.localRehearsal['specificMonths'];
    delete this.localRehearsal['observation'];

    if (this.localRehearsal['monthlyFrequency']['objectId'] === 'NONE') {
      delete this.localRehearsal['weekDay'];
      delete this.localRehearsal['weekOrder'];
    }
  }

  getWeekOrders() {
    if (!this.localRehearsal['weekDay']) return;

    var isMale = this.localRehearsal['weekDay'].objectId == 1 || this.localRehearsal['weekDay'].objectId == 7;

    return [
      {objectId: 1, value: (isMale ? '1º ' : '1ª ') + this.localRehearsal['weekDay'].value},
      {objectId: 2, value: (isMale ? '2º ' : '2ª ') + this.localRehearsal['weekDay'].value},
      {objectId: 3, value: (isMale ? '3º ' : '3ª ') + this.localRehearsal['weekDay'].value},
      {objectId: 4, value: (isMale ? '4º ' : '4ª ') + this.localRehearsal['weekDay'].value},
      {objectId: 5, value: (isMale ? 'Último ' : 'Última ') + this.localRehearsal['weekDay'].value},
    ];
  }

  getMonthlyFrequencies() {
    return [
      {objectId: 'ALL', value: 'Todos os meses'},
      {objectId: 'EVEN', value: 'Meses pares'},
      {objectId: 'ODD', value: 'Meses ímpares'},
      {objectId: 'SPECIFIC', value: 'Selecionar meses específicos'},
      {objectId: 'NONE', value: 'Selecionar dias específicos'},
    ];
  }

  getMonths() {
    return [
      {objectId: 1, value: 'Janeiro'},
      {objectId: 2, value: 'Fevereiro'},
      {objectId: 3, value: 'Março'},
      {objectId: 4, value: 'Abril'},
      {objectId: 5, value: 'Maio'},
      {objectId: 6, value: 'Junho'},
      {objectId: 7, value: 'Julho'},
      {objectId: 8, value: 'Agosto'},
      {objectId: 9, value: 'Setembro'},
      {objectId: 10, value: 'Outubro'},
      {objectId: 11, value: 'Novembro'},
      {objectId: 12, value: 'Dezembro'},
    ];
  }

  ionViewWillEnter() {
    this.presentLoading();

    this.weekDays = this.getWeekDays();
    this.monthlyFrequencies = this.getMonthlyFrequencies();
    this.months = this.getMonths();

    const promises = [];

    promises.push(this.fetchContacts());

    Parse.Promise.all(promises).then(() => {
      this.localRehearsal = this.navParams.get('localRehearsal');

      this.localRehearsal['weekDay'] = _.find(this.weekDays, (weekDay) => {
        return weekDay['value'] == this.localRehearsal['weekDay'];
      });

      this.localRehearsal['monthlyFrequency'] = _.find(this.monthlyFrequencies, (monthlyFrequency) => {
        return monthlyFrequency['objectId'] == this.localRehearsal['monthlyFrequency'];
      });

      this.weekOrders = this.getWeekOrders();

      this.localRehearsal['weekOrder'] = _.find(this.weekOrders, (weekOrder) => {
        return weekOrder['objectId'] == this.localRehearsal['weekOrder'];
      });
    
      if (this.localRehearsal['monthlyFrequency'].objectId === 'NONE') {
        this.localRehearsal['observation'] = _.clone(this.localRehearsal['frequency']);
      }
      
      this.loading.dismiss();
    });
  }

}
