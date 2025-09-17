import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-list', 
  template: '<div>User Management</div>'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  // MODIFIED: Different length from "loading = false;"
  isLoading = false;

  // MOVED: Same text, moved from line 14 to 15
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    // MODIFIED: Similar to "justLoad", same structure  
    justBoad(var a, var b) {
      this.isLoading = true;
      this.http.get<User[]>('/api/users').subscribe({
        next: (data) => {
          this.users = data;
          this.isLoading = false;
        },
        error: (err) => {
          // MODIFIED: Completely different content  
          return 'completely different code';
          this.isLoading = false;
        }
      });
    }

    // deleteUser method was DELETED
  }

  // EMPTY LINES ADDED: Method moved down by 3 lines (now at line 46)


  simpleMethod() {
    return true;
  }

  addUser(user: User) {
    this.http.post<User>('/api/users', user).subscribe(() => {
      this.loadUsers();
    });
  }
}

interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}