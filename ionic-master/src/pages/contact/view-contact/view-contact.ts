import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { EditContactPage } from '../edit-contact/edit-contact';
import { BrMaskerIonic3, BrMaskModel } from 'brmasker-ionic-3';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-view-contact',
  templateUrl: 'view-contact.html',
  providers: [BrMaskerIonic3]
})
export class ViewContactPage {
  loading: any;
  contact: Object;
  hasPermissionToEdit: Boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public brMaskerIonic3: BrMaskerIonic3
  ) {
  }

  redirectToWhatsapp(val: string) {
    if ( (!val) || (val && val.length !== 11) ) {
      return;
    }

    var link = 'https://wa.me/55' + val;
    window.open(link, '_blank', 'location=yes');
  }

  // Source: https://stackoverflow.com/questions/49102724/angular-5-copy-to-clipboard
  copyToClipboard(val: string) {
    if (val === undefined) {
      return;
    }

    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.presentToast('Copiado para a Área de Transferência');
  }

  openEditContact() {
    this.navCtrl.push(EditContactPage, { contact: this.contact });
  }

  checkMeetings() {
    const Meeting = Parse.Object.extend('Meeting');
    const meetingQuery = new Parse.Query(Meeting);
    meetingQuery.equalTo('responsible', { '__type': 'Pointer', 'className': 'Contact', 'objectId': this.contact['objectId'] });
    return meetingQuery.find().then((results) => {
      if (results.length == 0) {
        return true;
      } else {
        return false;
      }
    });
  }

  checkLocalRehearsals() {
    const LocalRehearsal = Parse.Object.extend('LocalRehearsal');

    const query = new Parse.Query(LocalRehearsal);
    query.equalTo('responsible', { '__type': 'Pointer', 'className': 'Contact', 'objectId': this.contact['objectId'] });

    return query.find().then((results) => {
      if (results.length == 0) {
        return true;
      } else {
        return false;
      }
    });
  }

  checkRehearsals() {
    const Rehearsal = Parse.Object.extend('Rehearsal');

    const responsibleQuery = new Parse.Query(Rehearsal);
    responsibleQuery.equalTo('responsible', { '__type': 'Pointer', 'className': 'Contact', 'objectId': this.contact['objectId'] });

    const musicalResponsible1Query = new Parse.Query(Rehearsal);
    musicalResponsible1Query.equalTo('musicalResponsible1', { '__type': 'Pointer', 'className': 'Contact', 'objectId': this.contact['objectId'] });

    const musicalResponsible2Query = new Parse.Query(Rehearsal);
    musicalResponsible2Query.equalTo('musicalResponsible2', { '__type': 'Pointer', 'className': 'Contact', 'objectId': this.contact['objectId'] });

    const composedQuery = Parse.Query.or(responsibleQuery, musicalResponsible1Query, musicalResponsible2Query);

    return composedQuery.find().then((results) => {
      if (results.length == 0) {
        return true;
      } else {
        return false;
      }
    });
  }

  canDeleteContact() {
    const promises = [];

    //promises.push(this.checkMeetings());
    promises.push(this.checkRehearsals());
    promises.push(this.checkLocalRehearsals());

    return Parse.Promise.all(promises);
  }

  onClickDeleteContact() {
    const confirm = this.alertCtrl.create({
      title: 'Deseja excluir este contato?',
      buttons: [
        {
          text: 'Não',
          handler: () => { }
        },
        {
          text: 'Excluir',
          cssClass: 'alertDanger',
          handler: () => {
            this.presentLoading();

            this.canDeleteContact().then((results) => {
              var canDelete = _.every(results, r => { return r === true });

              if (canDelete) {
                this.deleteContact();
              } else {
                this.loading.dismiss();
                this.presentAlert();
              }
            }, (error) => {
              this.loading.dismiss();
              console.error('Erro ao buscar reuniões vinculadas: ', error);
            });
          }
        }
      ]
    });
    confirm.present();
  }

  deleteContact() {
    const Contact = Parse.Object.extend('Contact');
    const query = new Parse.Query(Contact);
    query.get(this.contact['objectId']).then((object) => {
      object.destroy().then(() => {
        this.loading.dismiss();
        this.presentToast('O contato foi removido com sucesso');
        this.navCtrl.pop();
      }, (error) => {
        this.loading.dismiss();
        console.error('Erro ao deletar contato: ', error);
      });
    });
  }

  presentAlert() {
    this.alertCtrl.create({
      title: 'Atenção',
      message: 'Não é possível excluir este contato, pois ele está sendo usado em algum ensaio.',
      buttons: ['Ok']
    }).present();
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

  getSimpleObject(object: any, className: string, columnName: string, fieldName: string) {
    return {
      '__type': 'Pointer',
      'className': className,
      'objectId': object.get(columnName).id,
      [fieldName]: object.get(columnName).get(fieldName)
    };
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

    const config: BrMaskModel = new BrMaskModel();
    config.phone = true;

    let contactId = this.navParams.get('contactId');

    const Contact = Parse.Object.extend("Contact");
    const query = new Parse.Query(Contact);

    query.include("function.name");

    query.get(contactId).then((object) => {
      this.loading.dismiss();
      this.contact = {
        'objectId': object.id,
        name: object.get("name"),
        function: this.getSimpleObject(object, 'Function', 'function', 'name'),
        city: object.get("city"),
        church: object.get("church"),
        email: object.get("email"),
        phone1: object.get("phone1") ? object.get("phone1").toString() : null,
        phone2: object.get("phone2") ? object.get("phone2").toString() : null,
        phoneFormatted1: object.get("phone1") ? this.brMaskerIonic3.writeCreateValue(object.get("phone1").toString(), config) : null,
        phoneFormatted2: object.get("phone2") ? this.brMaskerIonic3.writeCreateValue(object.get("phone2").toString(), config) : null,
      };
    }, (error) => {
      this.loading.dismiss();
      console.error('Erro ao buscar contato: ', error);
    });
  }

}
