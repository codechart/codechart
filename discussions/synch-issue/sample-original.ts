import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-list',
  template: '<div>Users</div>'
})
export class UserListComponent {
  users: User[] = [];
  // TEST: Similar Text, Different Length (line 11)
  loading = false;

  // TEST: Exact Match, Different Position (line 13)
  constructor(private http: HttpClient) {}

  loadUsers() {
    this.loading = true;
    // TEST: Similar Text, Same Length (line 18)
    justLoad(var a, var b) {
      this.loading = true;
      this.http.get<User[]>('/api/users').subscribe({
        next: (data) => {
          this.users = data;
          this.loading = false;
        },
        error: (err) => {
          // TEST: Line Completely Different (line 26)
          console.error('Failed to load users:', err);
          this.loading = false;
        }
      });
    }

    // TEST: Line Deleted (line 32)
    deleteUser(id: number) {
      this.http.delete(`/api/users/${id}`).subscribe(() => {
        this.loadUsers();
      });
    }

    // TEST: Empty Lines Added Before This Method (line 42)
    simpleMethod() {
      return true;
    }
  }
}

interface User {
  id: number;
  name: string;
  email: string;
}