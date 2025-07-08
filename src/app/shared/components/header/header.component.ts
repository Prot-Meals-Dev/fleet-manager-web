import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationService } from '../confirmation-modal/service/confirmation.service';
import { AuthService } from '../../../core/interceptor/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) { }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  async logout() {
    const confirmed = await this.confirmationService.confirm('Are you sure you want to logout?');
    if (confirmed) {
      this.authService.logout();
      this.router.navigate(['/login'])
    }
  }

}
