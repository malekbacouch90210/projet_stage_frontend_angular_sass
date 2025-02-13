import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  userForm!: FormGroup;
  showForm = false;
  editingUserId: string | null = null;
  users: User[] = [];
  filteredUsers: User[] = [];
  searchUser: string = '';

  constructor(
    private translate: TranslateService,
    private router: Router,
    private dialog: MatDialog,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userForm = new FormGroup({
      nom: new FormControl('', [Validators.required]),
      prenom: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      role: new FormControl('', Validators.required),
      numero_telephone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{8}$')]),
    });
    this.fetchUsers();
  }

  fetchUsers(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Le token est nul. Veuillez vous reconnecter.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http.get<{ users: User[] }>('http://localhost:8000/authentification/users/affiche/', { headers })
      .subscribe(
        (response) => {
          if (Array.isArray(response.users)) {
            this.users = response.users;
            this.filteredUsers = [...response.users];
          } else {
            console.error('La réponse du serveur n\'est pas un tableau d\'utilisateurs :', response);
          }
        },
        (error) => {
          console.error('Erreur lors de la récupération des utilisateurs:', error);
        }
      );
  }

  handleAddUser(): void {
    if (this.userForm.valid) {
      const newUser = this.userForm.value;
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('Le token est nul. Veuillez vous reconnecter.');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      this.http.post<{ users: User[] }>('http://localhost:8000/authentification/users/register/', newUser, { headers })
        .subscribe(
          (response) => {
            this.fetchUsers();
            this.userForm.reset();
            this.showForm = false;
            Swal.fire("Utilisateur ajoutee avec succès.");
          },
          (error) => {
            console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
          }
        );
    }
  }
  handleDeleteUser(user: User): void {
    console.log('Received user object:', user);

    if (!user || !user.id) {
      console.error('User ID is missing or undefined');
      return;
    }

    const userId = String(user.id);  // Convertir l'id en chaîne (si nécessaire)

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '300px',
      data: { id: userId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('Token is null. Please log in again.');
          return;
        }

        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        this.http.delete(`http://localhost:8000/authentification/users/delete/${userId}/`, { headers })
          .subscribe(
            (response) => {
              console.log('User deleted successfully', response);
              Swal.fire("Utilisateur supprimé avec succès.");
              this.fetchUsers();  // Re-fetch the users after deletion
            },
            (error) => {
              console.error('Error deleting user', error);
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Une erreur est survenue lors de la suppression de l\'utilisateur.',
              });
            }
          );
      }
    });
  }
  getUserById(id: number): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Le token est nul. Veuillez vous reconnecter.');
      return;
    }

    const apiUrl = `http://localhost:8000/authentification/users/affiche/${id}/`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http.get<any>(apiUrl, { headers })
      .subscribe(
        (response) => {
          console.log('Utilisateur récupéré avec succès:', response);
        },
        (error) => {
          console.error('Erreur lors de la récupération de lutilisateur:', error);
        }
      );
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter((user) =>
      Object.values(user).some((value) =>
        value.toString().toLowerCase().includes(this.searchUser.toLowerCase())
      )
    );
  }

  onUserSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchUser = target.value;
    this.filterUsers();
  }

  switchLanguage(language: string): void {
    this.translate.use(language);
  }

  // Modification ici pour passer à l'utilisation de l'id de l'utilisateur
  editUser(userId: string): void {
    this.editingUserId = userId;

    // Rechercher l'utilisateur dans la liste des utilisateurs
    const userToEdit = this.users.find(user => user.id === userId);

    if (userToEdit) {
      this.userForm.setValue({
        nom: userToEdit.nom,
        prenom: userToEdit.prenom,
        email: userToEdit.email,
        password: '',  // Le mot de passe reste vide lors de l'édition
        role: userToEdit.role,
        numero_telephone: userToEdit.numero_telephone.toString(),
      });
      this.showForm = true;
    }
  }

  saveUser(): void {
    if (this.userForm.valid && this.editingUserId) {
      const updatedUser = { ...this.userForm.value };
      const apiUrl = `http://localhost:8000/authentification/users/modifier/${this.editingUserId}/`;
      const token = localStorage.getItem('access_token');

      if (!token) {
        console.error('Le token est nul. Veuillez vous reconnecter.');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      console.log('API URL:', apiUrl);
      console.log('Updated User Data:', updatedUser);
      Swal.fire("Utilisateur modifier avec succès.");

      this.http.put(apiUrl, updatedUser, { headers })
        .subscribe(
          () => {
            this.fetchUsers();
            this.editingUserId = null;
            this.userForm.reset();
            this.showForm = false;
          },
          (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: "Une erreur est survenue lors de la mise à jour de l'utilisateur.",
            });
          }
        );
    }
  }
  

  cancelEdit(): void {
    this.editingUserId = null;
    this.userForm.reset();
  }
}

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
  numero_telephone: string;  // Updated to string
}
