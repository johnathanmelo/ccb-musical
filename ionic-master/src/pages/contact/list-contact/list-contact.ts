import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { ViewContactPage } from '../view-contact/view-contact';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-list-contact',
  templateUrl: 'list-contact.html',
})
export class ListContactPage {
  function: Object;
  textFilter: string = '';
  contacts: Object[];
  loading: any;
  reActiveInfinite: any;

  constructor(
    public navParams: NavParams,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
  ) {
  }

  doInfinite(infiniteScroll: any) {
    this.reActiveInfinite = infiniteScroll;
    this.fetchContacts(infiniteScroll);
  }

  viewContact(contact: Object) {
    this.navCtrl.push(ViewContactPage, { contactId: contact['objectId'] });
  }

  enableInfiniteScroll() {
    if (this.reActiveInfinite) {
      this.reActiveInfinite.enable(true);
    }
  }

  onChangeSearchbar(ev: any) {
    this.contacts = [];
    this.enableInfiniteScroll();

    this.textFilter = ev.target.value;
    this.fetchContacts();
  }

  getFunctionQuery(Contact: Object) {
    const functionQuery = new Parse.Query(Contact);
    functionQuery.equalTo("function", this.function);

    return functionQuery;
  }

  getTextQuery(Contact: Object) {
    // Name
    const nameQuery = new Parse.Query(Contact);
    nameQuery.matches("name", this.textFilter, "i");

    // City
    const cityQuery = new Parse.Query(Contact);
    cityQuery.matches("city", this.textFilter, "i");

    return Parse.Query.or(nameQuery, cityQuery);
  }

  fetchContacts(infiniteScroll?: any) {
    if (!infiniteScroll) this.presentLoading();
    const Contact = Parse.Object.extend("Contact");

    const functionQuery = this.getFunctionQuery(Contact);

    const textQuery = (this.textFilter && this.textFilter.trim() != '')
      ? this.getTextQuery(Contact)
      : new Parse.Query(Contact);

    const query = Parse.Query.and(functionQuery, textQuery);
    query.include("function.name");
    query.ascending("name");
    query.addAscending("id");

    query.limit(12);
    query.skip(this.contacts.length);

    query.find().then((results) => {
      var loadedContacts = results.map((result) => {
        return {
          'objectId': result.id,
          name: result.get("name"),
          city: result.get("city"),
          church: result.get("church"),
        };
      });

      _.forEach(loadedContacts, loadedContact => {
        this.contacts.push(loadedContact);
      });

      if (infiniteScroll) {
        infiniteScroll.enable(results.length > 0);
        infiniteScroll.complete();
      }

      this.loading.dismiss();
    }, (error) => {
      this.loading.dismiss();
      console.error('Erro ao buscar contatos: ', error);
    });
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }

  isChurchPresent(contact: Object) {
    return contact['church'] !== undefined && contact['church'].replace(/\s/g, '').length;
  }

  isEmpty(contacts: Object[]) {
    return _.isEmpty(contacts);
  }

  ionViewWillEnter() {
    this.contacts = [];

    this.function = this.navParams.get('function');
    this.fetchContacts();
    this.enableInfiniteScroll();
  }

}
