import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environements/environement';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl; // URL de l'API
  private currentUserSubject: BehaviorSubject<any>; // Sujet pour l'utilisateur courant
  public currentUser: Observable<any>; // Observable pour l'utilisateur courant

  constructor(private http: HttpClient, private router: Router) {
    // Initialise l'utilisateur courant à partir du localStorage
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * Méthode pour se connecter.
   * @param credentials - Les identifiants de l'utilisateur (username et password).
   * @returns Un Observable avec la réponse du serveur.
   */
  login(credentials: { username: string; password: string }): Observable<any> {
    const url = `${this.apiUrl}/authentification/users/login`;
    return this.http.post(url, credentials).pipe(
      map((response: any) => {
        // Stocke les tokens dans le localStorage
        if (response.access && response.refresh) {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          localStorage.setItem('currentUser', JSON.stringify(response)); // Stocke les infos utilisateur
          this.currentUserSubject.next(response); // Met à jour l'utilisateur courant
        }
        return response;
      }),
      catchError((error) => {
        console.error('Erreur lors de la connexion :', error);
        throw error;
      })
    );
  }

  /**
   * Méthode pour se déconnecter.
   */
  logout(): void {
    // Supprime les tokens et les infos utilisateur du localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null); // Réinitialise l'utilisateur courant
    this.router.navigate(['/login']); // Redirige vers la page de connexion
  }

  /**
   * Méthode pour vérifier si l'utilisateur est connecté.
   * @returns True si l'utilisateur est connecté, sinon False.
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token; // Retourne true si le token existe, sinon false
  }

  /**
   * Méthode pour récupérer le token d'accès.
   * @returns Le token d'accès ou null s'il n'existe pas.
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Méthode pour récupérer le token de rafraîchissement.
   * @returns Le token de rafraîchissement ou null s'il n'existe pas.
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Méthode pour récupérer l'utilisateur courant.
   * @returns L'utilisateur courant ou null s'il n'existe pas.
   */
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
}