import { Component, inject } from '@angular/core';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  loginService = inject(LoginService);
}
