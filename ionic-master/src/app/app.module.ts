import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Network } from '@ionic-native/network';
import { BrMaskerModule } from 'brmasker-ionic-3';

import { MyApp } from './app.component';

import { ListMeetingPage } from '../pages/meeting/list-meeting/list-meeting';
import { AddMeetingPage } from '../pages/meeting/add-meeting/add-meeting';
import { ViewMeetingPage } from '../pages/meeting/view-meeting/view-meeting';
import { EditMeetingPage } from '../pages/meeting/edit-meeting/edit-meeting';

import { ListTopicPage } from '../pages/topic/list-topic/list-topic';

import { ListRehearsalPage } from '../pages/rehearsal/list-rehearsal/list-rehearsal';
import { AddRehearsalPage } from '../pages/rehearsal/add-rehearsal/add-rehearsal';
import { ViewRehearsalPage } from '../pages/rehearsal/view-rehearsal/view-rehearsal';
import { EditRehearsalPage } from '../pages/rehearsal/edit-rehearsal/edit-rehearsal';

import { ListLocalRehearsalPage } from '../pages/local-rehearsal/list-local-rehearsal/list-local-rehearsal';
import { AddLocalRehearsalPage } from '../pages/local-rehearsal/add-local-rehearsal/add-local-rehearsal';
import { ViewLocalRehearsalPage } from '../pages/local-rehearsal/view-local-rehearsal/view-local-rehearsal';
import { EditLocalRehearsalPage } from '../pages/local-rehearsal/edit-local-rehearsal/edit-local-rehearsal';

import { ListContactTypePage } from '../pages/contact/list-contact-type/list-contact-type';
import { ListContactPage } from '../pages/contact/list-contact/list-contact';
import { AddContactPage } from '../pages/contact/add-contact/add-contact';
import { ViewContactPage } from '../pages/contact/view-contact/view-contact';
import { EditContactPage } from '../pages/contact/edit-contact/edit-contact';

import { ListMeetingTypePage } from '../pages/meeting-type/list-meeting-type/list-meeting-type';
import { ViewMeetingTypePage } from '../pages/meeting-type/view-meeting-type/view-meeting-type';

import { ListPermissionPage } from '../pages/permission/list-permission/list-permission';
import { AddPermissionPage } from '../pages/permission/add-permission/add-permission';
import { ViewPermissionPage } from '../pages/permission/view-permission/view-permission';
import { EditPermissionPage } from '../pages/permission/edit-permission/edit-permission';

import { ResetPasswordPage } from '../pages/reset-password/reset-password';

@NgModule({
  declarations: [
    MyApp,
    ListTopicPage,
    ListContactTypePage,
    ListMeetingTypePage,
    ListMeetingPage,
    ListContactPage,
    ListRehearsalPage,
    ListLocalRehearsalPage,
    AddMeetingPage,
    AddContactPage,
    AddRehearsalPage,
    AddLocalRehearsalPage,
    ViewMeetingTypePage,
    ViewMeetingPage,
    ViewContactPage,
    ViewRehearsalPage,
    ViewLocalRehearsalPage,
    EditMeetingPage,
    EditContactPage,
    EditRehearsalPage,
    EditLocalRehearsalPage,
    ListPermissionPage,
    AddPermissionPage,
    ViewPermissionPage,
    EditPermissionPage,
    ResetPasswordPage,
  ],
  imports: [
    BrowserModule,
    BrMaskerModule,
    IonicModule.forRoot(MyApp, {
      monthNames: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro' ],
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      backButtonText: ' ',
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ListTopicPage,
    ListContactTypePage,
    ListMeetingTypePage,
    ListMeetingPage,
    ListContactPage,
    ListRehearsalPage,
    ListLocalRehearsalPage,
    AddMeetingPage,
    AddContactPage,
    AddRehearsalPage,
    AddLocalRehearsalPage,
    ViewMeetingTypePage,
    ViewMeetingPage,
    ViewContactPage,
    ViewRehearsalPage,
    ViewLocalRehearsalPage,
    EditMeetingPage,
    EditContactPage,
    EditRehearsalPage,
    EditLocalRehearsalPage,
    ListPermissionPage,
    AddPermissionPage,
    ViewPermissionPage,
    EditPermissionPage,
    ResetPasswordPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}