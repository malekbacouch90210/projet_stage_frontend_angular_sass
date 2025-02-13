import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loginForm: FormGroup;
  passwordVisible: boolean = false;

  constructor(private http: HttpClient, private authService: AuthService,private translate: TranslateService, private router: Router) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  ngOnInit(): void {
    this.translate.setDefaultLang('fr');
    console.log('LoginComponent initialized');
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
  switchLanguage(language: string) {
    this.translate.use(language);
  }
  onLogin() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value; // Récupère les valeurs du formulaire
      this.http.post('http://localhost:8000/authentification/users/login/', loginData).subscribe(
        (response: any) => {
          console.log('Réponse du serveur :', response);
  
          // Vérifiez que les tokens sont bien présents dans la réponse
          if (response.access && response.refresh) {
            localStorage.setItem('access_token', response.access);
            localStorage.setItem('refresh_token', response.refresh);
            this.router.navigateByUrl('/dashboard').then(success => {
              console.log('Redirection réussie :', success);
            }).catch(err => {
              console.error('Erreur lors de la redirection :', err);
            });
          } else {
            console.error('Tokens manquants dans la réponse :', response);
            this.errorMessage = 'Erreur lors de la connexion. Tokens manquants.';
          }
        },
        (error) => {
          console.error('Erreur lors de la connexion :', error);
          this.errorMessage = 'Nom d’utilisateur ou mot de passe incorrect.';
          Swal.fire({
            icon: 'error',
            title: 'Oups...',
            text: 'Nom d’utilisateur ou mot de passe incorrect.',
            confirmButtonText: 'Réessayer'
          });
        }
      );
    } else {
      console.log('Formulaire invalide', this.loginForm.value);
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      Swal.fire({
        icon: 'error',
        title: 'Oups...',
        text: 'Veuillez remplir tous les champs correctement.',
        confirmButtonText: 'Réessayer'
      });
    }
  }}