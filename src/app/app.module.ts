import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatCardModule } from '@angular/material/card';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { NouvelledemandeComponent } from './nouvelledemande/nouvelledemande.component';
import { SuivdemandeComponent } from './suivdemande/suivdemande.component';
import { LoginComponent } from './login/login.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MdpoublierComponent } from './mdpoublier/mdpoublier.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DemandesComponent } from './demandes/demandes.component';
import { UsersComponent } from './users/users.component';
import { ConfirmDialogComponent } from './demandes/confirm-dialog/confirm-dialog.component';
import { ConfirmDeleteDialogComponent } from './users/confirm-delete-dialog/confirm-delete-dialog.component';
import { ConfirmStatusChangeDialogComponent } from './dialogs/confirm-status-change-dialog/confirm-status-change-dialog.component';





@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    NouvelledemandeComponent,
    SuivdemandeComponent,
    LoginComponent,
    MdpoublierComponent,
    DashboardComponent,
    DemandesComponent,
    UsersComponent,
    ConfirmDialogComponent,
    ConfirmDeleteDialogComponent,
    ConfirmStatusChangeDialogComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    FormsModule,
    MatCardModule,
    RouterModule.forRoot([]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NoopAnimationsModule,
    MatIconModule,
    ReactiveFormsModule,
    MatDialogModule, MatButtonModule,
    MatFormFieldModule,

  ],
  providers: [],
  entryComponents: [ConfirmDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }