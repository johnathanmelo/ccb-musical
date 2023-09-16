import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { AddRehearsalPage } from '../add-rehearsal/add-rehearsal';
import { ViewRehearsalPage } from '../view-rehearsal/view-rehearsal';
import * as moment from 'moment';
import * as _ from "lodash";
import Parse from 'parse';

@Component({
  selector: 'page-list-rehearsal',
  templateUrl: 'list-rehearsal.html',
})
export class ListRehearsalPage {
  textFilter: string = '';
  rehearsals: Object[];
  hasPermissionToEdit: boolean = false;
  showAll: boolean = false;
  loading: any;
  reActiveInfinite: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
  ) {
  }

  doInfinite(infiniteScroll: any) {
    this.reActiveInfinite = infiniteScroll;
    this.fetchRehearsals(infiniteScroll);
  }

  enableInfiniteScroll() {
    if (this.reActiveInfinite) {
      this.reActiveInfinite.enable(true);
    }
  }

  viewRehearsal(rehearsal: Object) {
    this.navCtrl.push(ViewRehearsalPage, { rehearsalId: rehearsal['objectId'] });
  }

  onChangeSearchbar(ev: any) {
    this.rehearsals = [];
    this.enableInfiniteScroll();

    this.textFilter = ev.target.value;
    this.fetchRehearsals();
  }

  getTextQuery(Rehearsal: Object) {
    // City
    const cityQuery = new Parse.Query(Rehearsal);
    cityQuery.matches("city", this.textFilter, "i");

    // Church
    const churchQuery = new Parse.Query(Rehearsal);
    churchQuery.matches("church", this.textFilter, "i");

    return Parse.Query.or(cityQuery, churchQuery);
  }

  getDateQuery(Rehearsal: Object) {
    const minDate = new Date(moment().format());

    const minDateQuery = new Parse.Query(Rehearsal);
    minDateQuery.greaterThanOrEqualTo("dateTime", minDate);

    return minDateQuery;
  }

  fetchRehearsals(infiniteScroll?: any) {
    if (!infiniteScroll) this.presentLoading();
    const Rehearsal = Parse.Object.extend("Rehearsal");

    const dateQuery = !this.showAll
      ? this.getDateQuery(Rehearsal)
      : new Parse.Query(Rehearsal);

    const textQuery = (this.textFilter && this.textFilter.trim() != '')
      ? this.getTextQuery(Rehearsal)
      : new Parse.Query(Rehearsal);

    const query = Parse.Query.and(dateQuery, textQuery);
    query.ascending("dateTime");
    query.addAscending("id");

    query.limit(12);
    query.skip(this.rehearsals.length);

    query.find().then((results) => {
      var loadedRehearsals = results.map((result) => {
        return {
          'objectId': result.id,
          city: result.get("city"),
          church: result.get("church"),
          date: result.get("dateTime").toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }),
          time: result.get("dateTime").toLocaleString('pt-BR', { hour: 'numeric', minute: 'numeric' }),
          done: result.get("dateTime").getTime() < new Date().getTime()
        };
      });

      _.forEach(loadedRehearsals, loadedRehearsal => {
        this.rehearsals.push(loadedRehearsal);
      });

      if (infiniteScroll) {
        infiniteScroll.enable(results.length > 0);
        infiniteScroll.complete();
      }

      this.loading.dismiss();
    }, (error) => {
      this.loading.dismiss();
      console.error('Erro ao buscar ensaios regionais: ', error);
    });
  }

  onClickToggleFilter() {
    this.rehearsals = [];
    this.enableInfiniteScroll();

    this.showAll = !this.showAll;
    this.fetchRehearsals();
  }

  addRehearsal() {
    this.navCtrl.push(AddRehearsalPage);
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }

  isEmpty(items: Object[]) {
    return _.isEmpty(items);
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
    this.rehearsals = [];

    this.enableInfiniteScroll();
    this.checkUserPermission();
    this.fetchRehearsals();
  }

}
