import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { EditPermissionPage } from '../edit-permission/edit-permission';
import { AddPermissionPage } from '../add-permission/add-permission';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-list-permission',
  templateUrl: 'list-permission.html',
})
export class ListPermissionPage {
  textFilter: string = '';
  registeredEmails: Object[];
  loading: any;
  reActiveInfinite: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController
  ) {
  }

  doInfinite(infiniteScroll: any) {
    this.reActiveInfinite = infiniteScroll;
    this.fetchRegisteredEmails(infiniteScroll);
  }

  enableInfiniteScroll() {
    if (this.reActiveInfinite) {
      this.reActiveInfinite.enable(true);
    }
  }

  editPermission(registeredEmail: Object) {
    this.navCtrl.push(EditPermissionPage, { registeredEmail });
  }

  addPermission() {
    this.navCtrl.push(AddPermissionPage);
  }

  onChangeSearchbar(ev: any) {
    this.registeredEmails = [];
    this.enableInfiniteScroll();

    this.textFilter = ev.target.value;
    this.fetchRegisteredEmails();
  }

  fetchRegisteredEmails(infiniteScroll?: any) {
    if (!infiniteScroll) this.presentLoading();
    const RegisteredEmail = Parse.Object.extend("RegisteredEmail");

    const query = new Parse.Query(RegisteredEmail);
    query.matches("email", this.textFilter, "i");
    query.ascending("email");
    query.addAscending("id");

    query.limit(12);
    query.skip(this.registeredEmails.length);

    query.find().then((results) => {
      var loadedRegisteredEmails = results.map((result) => {
        return {
          'objectId': result.id,
          email: result.get("email"),
          permissionToEdit: result.get("permissionToEdit"),
          isAdmin: result.get("isAdmin"),
        };
      });

      _.forEach(loadedRegisteredEmails, loadedRegisteredEmail => {
        this.registeredEmails.push(loadedRegisteredEmail);
      });

      if (infiniteScroll) {
        infiniteScroll.enable(results.length > 0);
        infiniteScroll.complete();
      }

      this.loading.dismiss();
    }, (error) => {
      this.loading.dismiss();
      console.error('Erro ao buscar permissões: ', error);
    });
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }

  isEmpty(items: Object[]) {
    return _.isEmpty(items);
  }

  ionViewWillEnter() {
    this.registeredEmails = [];

    this.enableInfiniteScroll();
    this.fetchRegisteredEmails();
  }

}
