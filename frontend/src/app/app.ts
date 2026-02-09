import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private api: ApiService) {}

  ngOnInit(): void {
    // Ensure we try to restore user on app start (persistence on refresh)
    try { this.api.checkUser().subscribe(() => {}, () => {}); } catch {}
  }
}

