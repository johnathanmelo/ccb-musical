import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { ViewContactPage } from '../../contact/view-contact/view-contact';
import { EditLocalRehearsalPage } from '../../local-rehearsal/edit-local-rehearsal/edit-local-rehearsal';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-view-local-rehearsal',
  templateUrl: 'view-local-rehearsal.html',
})
export class ViewLocalRehearsalPage {
  loading: any;
  localRehearsal: Object;
  hasPermissionToEdit: Boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
  ) {
  }

  openEditLocalRehearsal() {
    this.navCtrl.push(EditLocalRehearsalPage, { localRehearsal: this.localRehearsal });
  }

  onClickViewLocalRehearsalContact(objectId: any) {
    if (objectId) {
      this.navCtrl.push(ViewContactPage, { contactId: objectId });
    }
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

  checkUserPermission() {
    const RegisteredEmail = Parse.Object.extend('RegisteredEmail');
    var query = new Parse.Query(RegisteredEmail);
    query.equalTo('email', Parse.User.current().get("email"));

    query.first().then(registeredUser => {
      this.hasPermissionToEdit = registeredUser.get("permissionToEdit");
    });
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

  ionViewWillEnter() {
    this.presentLoading();

    this.checkUserPermission();

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
  }

}
