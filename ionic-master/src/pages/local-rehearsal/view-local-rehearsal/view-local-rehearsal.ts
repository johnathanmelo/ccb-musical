import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { ViewContactPage } from '../../contact/view-contact/view-contact';
import { EditLocalRehearsalPage } from '../../local-rehearsal/edit-local-rehearsal/edit-local-rehearsal';
import { AuthUserProvider } from '../../../providers/auth-user/auth-user-provider';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-view-local-rehearsal',
  templateUrl: 'view-local-rehearsal.html',
  providers: [AuthUserProvider],
})
export class ViewLocalRehearsalPage {
  loading: any;
  localRehearsal: Object;
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

  openEditLocalRehearsal() {
    this.navCtrl.push(EditLocalRehearsalPage, { localRehearsal: this.localRehearsal });
  }

  onClickViewLocalRehearsalContact(objectId: any) {
    if (!objectId) return;
    if (!this.hasPermissionToEdit) return;

    this.navCtrl.push(ViewContactPage, { contactId: objectId });
  }

  onClickDeleteLocalRehearsal() {
    const confirm = this.alertCtrl.create({
      title: 'Deseja excluir o ensaio local?',
      buttons: [
        {
          text: 'Não',
          handler: () => { }
        },
        {
          text: 'Excluir',
          cssClass: 'alertDanger',
          handler: () => {
            this.deleteLocalRehearsal();
          }
        }
      ]
    });
    confirm.present();
  }

  deleteLocalRehearsal() {
    this.presentLoading();

    const LocalRehearsal = Parse.Object.extend('LocalRehearsal');
    const query = new Parse.Query(LocalRehearsal);
    query.get(this.localRehearsal['objectId']).then((object) => {
      object.destroy().then(() => {
        this.loading.dismiss();
        this.presentToast('O ensaio local foi removido com sucesso');
        this.navCtrl.pop();
      }, (error) => {
        this.loading.dismiss();
        console.error('Erro ao deletar ensaio local: ', error);
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

  getFrequency(localRehearsal) {
    var buildMonthlyFrequency = function () {
      var isMale = localRehearsal.get("weekDay") == 'Sábado' || localRehearsal.get("weekDay") == 'Domingo';

      var weekOrderTable = {
        1: '1' + (isMale ? 'º' : 'ª'),
        2: '2' + (isMale ? 'º' : 'ª'),
        3: '3' + (isMale ? 'º' : 'ª'),
        4: '4' + (isMale ? 'º' : 'ª'),
        5: (isMale ? 'Último' : 'Última'),
      };

      var monthlyFrequencyTable = {
        'ALL': 'do mês',
        'EVEN': 'dos meses pares',
        'ODD': 'dos meses ímpares',
        'SPECIFIC': 'de ' + _.join(_.map(localRehearsal.get('specificMonths'), 'value'), ', '),
      };

      var weekOrder = weekOrderTable[localRehearsal.get("weekOrder")];
      var weekDay = localRehearsal.get("weekDay").toLowerCase();
      var monthlyFrequency = monthlyFrequencyTable[localRehearsal.get("monthlyFrequency")];

      return weekOrder + ' ' + weekDay + ' ' + monthlyFrequency;
    }

    return localRehearsal.get("monthlyFrequency") !== 'NONE'
      ? buildMonthlyFrequency()
      : localRehearsal.get("observation");
  }

  async ionViewWillEnter() {
    this.presentLoading();

    let localRehearsalId = this.navParams.get('localRehearsalId');

    const LocalRehearsal = Parse.Object.extend("LocalRehearsal");
    const query = new Parse.Query(LocalRehearsal);

    query.include("responsible.name");

    query.get(localRehearsalId).then((object) => {
      this.loading.dismiss();
      this.localRehearsal = {
        objectId: object.id,
        city: object.get("city"),
        church: object.get("church"),
        responsible: this.getSimpleObject(object, 'Contact', 'responsible', ['name']),
        frequency: this.getFrequency(object),
        weekOrder: object.get("weekOrder"),
        weekDay: object.get("weekDay"),
        monthlyFrequency: object.get("monthlyFrequency"),
        specificMonths: object.get("specificMonths"),
        time: object.get("time").toLocaleString('pt-BR', { hour: 'numeric', minute: 'numeric' }),
      };
    }, (error) => {
      this.loading.dismiss();
      console.error('Erro ao buscar ensaio local: ', error);
    });

    this.hasPermissionToEdit = await this.authUserProvider.hasPermissionToEditAsync();
  }

}
