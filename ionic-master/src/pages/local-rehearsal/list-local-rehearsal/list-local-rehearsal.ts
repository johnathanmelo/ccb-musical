import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { AddLocalRehearsalPage } from '../add-local-rehearsal/add-local-rehearsal';
import { ViewLocalRehearsalPage } from '../view-local-rehearsal/view-local-rehearsal';
import * as _ from "lodash";
import Parse from 'parse';
import { AuthUserProvider } from '../../../providers/auth-user/auth-user-provider';

@Component({
  selector: 'page-list-local-rehearsal',
  templateUrl: 'list-local-rehearsal.html',
  providers: [AuthUserProvider],
})
export class ListLocalRehearsalPage {
  textFilter: string = '';
  localRehearsals: Object[];
  hasPermissionToEdit: boolean = false;
  loading: any;
  reActiveInfinite: any;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private authUserProvider: AuthUserProvider,
  ) {
  }

  doInfinite(infiniteScroll: any) {
    this.reActiveInfinite = infiniteScroll;
    this.fetchLocalRehearsals(infiniteScroll);
  }

  viewLocalRehearsal(localRehearsal: Object) {
    this.navCtrl.push(ViewLocalRehearsalPage, { localRehearsalId: localRehearsal['objectId'] });
  }

  enableInfiniteScroll() {
    if (this.reActiveInfinite) {
      this.reActiveInfinite.enable(true);
    }
  }

  onChangeSearchbar(ev: any) {
    this.localRehearsals = [];
    this.enableInfiniteScroll();

    this.textFilter = ev.target.value;
    this.fetchLocalRehearsals();
  }

  getTextQuery(LocalRehearsal: Object) {
    // City
    const cityQuery = new Parse.Query(LocalRehearsal);
    cityQuery.matches("city", this.textFilter, "i");

    // Church
    const churchQuery = new Parse.Query(LocalRehearsal);
    churchQuery.matches("church", this.textFilter, "i");

    return Parse.Query.or(cityQuery, churchQuery);
  }

  fetchLocalRehearsals(infiniteScroll?: any) {
    if (!infiniteScroll) this.presentLoading();
    const LocalRehearsal = Parse.Object.extend("LocalRehearsal");

    const textQuery = (this.textFilter && this.textFilter.trim() != '')
      ? this.getTextQuery(LocalRehearsal)
      : new Parse.Query(LocalRehearsal);

    const query = Parse.Query.and(textQuery);
    query.ascending("city");
    query.addAscending("id");

    query.limit(12);
    query.skip(this.localRehearsals.length);

    query.find().then((results) => {
      var loadedLocalRehearsals = results.map((result) => {
        return {
          'objectId': result.id,
          city: result.get("city"),
          church: result.get("church"),
          frequency: this.getFrequency(result),
          time: result.get("time").toLocaleString('pt-BR', { hour: 'numeric', minute: 'numeric' }),
        };
      });

      _.forEach(loadedLocalRehearsals, loadedLocalRehearsal => {
        this.localRehearsals.push(loadedLocalRehearsal);
      });

      if (infiniteScroll) {
        infiniteScroll.enable(results.length > 0);
        infiniteScroll.complete();
      }

      this.loading.dismiss();
    }, (error) => {
      this.loading.dismiss();
      console.error('Erro ao buscar ensaios locais: ', error);
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
    };

    return localRehearsal.get("monthlyFrequency") !== 'NONE'
      ? buildMonthlyFrequency()
      : localRehearsal.get("observation");
  }

  addLocalRehearsal() {
    this.navCtrl.push(AddLocalRehearsalPage);
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }

  isEmpty(items: Object[]) {
    return _.isEmpty(items);
  }

  async ionViewWillEnter() {
    this.localRehearsals = [];

    this.enableInfiniteScroll();
    this.fetchLocalRehearsals();

    this.hasPermissionToEdit = await this.authUserProvider.hasPermissionToEditAsync();
  }

}
