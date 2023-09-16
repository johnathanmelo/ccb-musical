import { Component } from '@angular/core';
import { NavController, ToastController, LoadingController } from 'ionic-angular';
import * as moment from 'moment';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-add-local-rehearsal',
  templateUrl: 'add-local-rehearsal.html',
})
export class AddLocalRehearsalPage {
  localRehearsal: Object = new Object();
  encarregadoLocalContacts: Object[];
  weekDays: Object[];
  weekOrders: Object[];
  monthlyFrequencies: Object[];
  months: Object[];
  loading: any;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
  ) {
  }

  saveNewLocalRehearsal() {
    if (this.areFieldsInvalid()) {
      return;
    }

    this.presentLoading();

    const LocalRehearsal = Parse.Object.extend('LocalRehearsal');
    const myNewObject = new LocalRehearsal();

    myNewObject.set('city', this.localRehearsal['city']);
    myNewObject.set('church', this.localRehearsal['church']);
    myNewObject.set('responsible', this.localRehearsal['responsible']);
    myNewObject.set('weekDay', this.localRehearsal['weekDay'] && this.localRehearsal['weekDay']['value']);
    myNewObject.set('weekOrder', this.localRehearsal['weekOrder'] && this.localRehearsal['weekOrder']['objectId']);
    myNewObject.set('monthlyFrequency', this.localRehearsal['monthlyFrequency']['objectId']);
    myNewObject.set('specificMonths', this.localRehearsal['specificMonths']);
    myNewObject.set('time', new Date(moment('1970-01-01 ' + this.localRehearsal['time']).format()));
    myNewObject.set('observation', this.localRehearsal['observation']);

    myNewObject.save().then(
      () => {
        this.loading.dismiss();
        this.presentToast('O ensaio local foi criado com sucesso');
        this.navCtrl.pop();
      },
      (error) => {
        this.loading.dismiss();
        console.error('Erro ao criar ensaio local: ', error);
      }
    );
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

    query.include("function.name");

    return query.find().then((results) => {
      var sortedResults = _.orderBy(results, (result) => {
        return [result.get("function").get("name"), _.deburr(result.get("name"))];
      }, ['asc']);

      this.encarregadoLocalContacts = sortedResults.map((result) => {
        return {
          '__type': 'Pointer',
          'className': 'Contact',
          'objectId': result.id,
          name: result.get("name")
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
      this.loading.dismiss();
    });
  }

}
