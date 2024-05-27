import { Component, OnInit } from '@angular/core';
import * as bootstrap from 'bootstrap';


interface User {
  name: string;
  age: number;
  email: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent{
  users: User[] = [
    { name: 'Alice', age: 25, email: 'alice@example.com' },
    { name: 'Bob', age: 30, email: 'bob@example.com' },
    { name: 'Charlie', age: 35, email: 'charlie@example.com' },
    { name: 'David', age: 40, email: 'david@example.com' }
  ];
  filteredUsers: User[] = [];
  filterText: string = '';

  ngOnInit(): void {
    this.filteredUsers = this.users;
  }

  applyFilter(): void {
    if (this.filterText) {
      this.filteredUsers = this.users.filter(user => user.name.toLowerCase().includes(this.filterText.toLowerCase()));
    } else {
      this.filteredUsers = this.users;
    }
  }
}
