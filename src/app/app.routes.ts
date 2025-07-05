import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/guard/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DeliveryPartnerComponent } from './components/delivery-partner/delivery-partner.component';
import { DeliveryPartnerDetailComponent } from './components/delivery-partner-detail/delivery-partner-detail.component';
import { OrdersComponent } from './components/orders/orders.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'deliverypartner', component: DeliveryPartnerComponent },
            { path: 'deliverypartnerdetail', component: DeliveryPartnerDetailComponent },
            { path: 'orders', component: OrdersComponent },
            // { path: '**', loadComponent: loadNotFoundComopnent }
        ]
    },
    { path: '**', component: NotFoundComponent }
];
