import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  loginService = inject(LoginService);
  private router = inject(Router);

  logout(): void {
    this.loginService.postLogout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
