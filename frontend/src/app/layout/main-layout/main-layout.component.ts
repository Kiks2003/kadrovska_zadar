import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { NAV_ITEMS } from '../nav-items.config';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  loginService = inject(LoginService);
  private router = inject(Router);

  navItems = NAV_ITEMS;

  logout(): void {
    this.loginService.postLogout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
