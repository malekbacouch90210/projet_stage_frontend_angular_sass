import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmStatusChangeDialogComponent } from '../dialogs/confirm-status-change-dialog/confirm-status-change-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-demandes',
  templateUrl: './demandes.component.html',
  styleUrls: ['./demandes.component.scss']
})
export class DemandesComponent implements OnInit {
  demandes: Demande[] = [];
  filteredDemandes: Demande[] = [];
  searchTerm: string = '';

  constructor(
    private router: Router,
    private translate: TranslateService,
    private dialog: MatDialog,
    private http: HttpClient
  ) {
    this.translate.setDefaultLang('fr');
  }

  ngOnInit() {
    this.fetchDemandes();
    this.translate.onLangChange.subscribe(() => {
      this.fetchMunicipalites(); // Fetch again when language changes
    });
    this.fetchMunicipalites();
  }

  municipalites: Municipalite[] = [];
  municipaliteIds: string[] = [];
  fetchMunicipalites(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Le token est nul. Veuillez vous reconnecter.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    console.log('Headers:', headers.keys());

    this.http.get<Municipalite[]>('http://localhost:8000/municipalites/', { headers })
      .subscribe(
        (response) => {
          if (Array.isArray(response)) {
            this.municipalites = response.map(municipalite => {
              return {
                id: municipalite.id,
                name_francais: municipalite.name_francais, // Ne conserver que name_francais
              };
            });

            console.log('Municipalités avec les noms en français:', this.municipalites);
          } else {
            console.error('La réponse du serveur n\'est pas un tableau de municipalités :', response);
          }
        },
        (error) => {
          console.error('Erreur lors de la récupération des municipalités:', error);
        }
      );
  }

  openConfirmDialog(demande: Demande): void {
    const previousStatut = demande.statut; // Sauvegarde l'ancien statut

    const dialogRef = this.dialog.open(ConfirmStatusChangeDialogComponent, {
      width: '400px',
      data: { demande } // Passe l'objet entier au lieu de séparer les données
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const accessToken = localStorage.getItem('accessToken');
        
        if (accessToken) {
          console.log(`Statut changé pour la demande ID: ${demande.id} -> ${result}`);
          this.updateStatut(demande.id, result, accessToken); // Appliquer le changement si confirmé
        } else {
          console.error('Token d\'authentification introuvable');
        }
      } else {
        demande.statut = previousStatut; // Annuler le changement si refusé
      }
    });
  }

  fetchDemandes(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Le token est nul. Veuillez vous reconnecter.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    console.log('Headers:', headers.keys());

    this.http.get<Demande[]>('http://localhost:8000/demandes/', { headers })
      .subscribe(
        (response) => {
          if (Array.isArray(response)) {
            this.demandes = response;
            this.filteredDemandes = [...response];
          } else {
            console.error('La réponse du serveur n\'est pas un tableau de demandes :', response);
          }
        },
        (error) => {
          console.error('Erreur lors de la récupération des demandes:', error);
        }
      );
  }

  filterDemandes(): void {
    this.filteredDemandes = this.demandes.filter((d) =>
      Object.values(d).some((value) =>
        value?.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.filterDemandes();
  }

  updateStatut(id: string, statut: string, accessToken: string): void {
    const demande = this.demandes.find((d) => d.id === id);
    if (demande) {
      demande.statut = statut;

      // Définir les en-têtes avec le token
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${accessToken}`,  // En-tête avec le token d'accès
        'Content-Type': 'application/json'
      });

      // URL complète de l'API pour mettre à jour le statut
      const url = `http://localhost:8000/demandes/${id}/`;

      // Corps de la requête avec le nouveau statut
      const body = { statut };

      // Effectuer la requête HTTP PUT pour mettre à jour le statut
      this.http.put(url, body, { headers })
        .subscribe(
          (response) => {
            console.log('Statut mis à jour avec succès', response);
          },
          (error) => {
            console.error('Erreur lors de la mise à jour du statut', error);
          }
        );
    } else {
      console.error(`Demande avec l'ID ${id} non trouvée.`);
      
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  switchLanguage(language: string): void {
    this.translate.use(language);
  }

  onDeleteRequest(Demande: Demande): void {
    console.log("demande", Demande.id)
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Demande supprimée.');
        Swal.fire("Demande supprimée.");

        // Récupérer le token (généralement dans le localStorage ou un service d'authentification)
        const token = localStorage.getItem('auth_token'); // Remplace avec ton stockage de token

        if (token) {
          const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          });

          // Suppression de la demande via API
          this.http.delete<Demande[]>(`http://localhost:8000/demandes/${Demande.id}/`, { headers })
            .subscribe(
              response => {
                console.log('Demande supprimée avec succès');
                // Tu peux aussi actualiser la liste des demandes ici, si nécessaire
              },
              error => {
                console.error('Erreur lors de la suppression de la demande', error);
              }
            );
        } else {
          console.error('Token d\'authentification introuvable');
        }
      }
    });
  }
}

export interface Demande {
  id: string;
  nom_complet: string;
  email: string;
  telephone: string;
  adresse: string;
  request_type: string;
  domaine: string;
  municipalite: Municipalite;
  titre: string;
  description: string;
  piece_jointe?: string | null;
  key?: string | null;
  statut: string;
  municipaliteDisplayName?: string;
}

export interface Municipalite {
  id: string;
  name_francais: string;
}
