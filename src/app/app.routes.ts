import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './layout/layout.component';

const loadDashboardComponent = () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent);
const loadDeliveryPartnerComponent = () => import('./components/delivery-partner/delivery-partner.component').then(m => m.DeliveryPartnerComponent);
const loadDeliveryPartnerDetailComponent = () => import('./components/delivery-partner-detail/delivery-partner-detail.component').then(m => m.DeliveryPartnerDetailComponent);
const loadOrdersComponent = () => import('./components/orders/orders.component').then(m => m.OrdersComponent);
const loadNotFoundComopnent = () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent);

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: 'dashboard', loadComponent: loadDashboardComponent },
            { path: 'deliverypartner', loadComponent: loadDeliveryPartnerComponent },
            { path: 'deliverypartnerdetail', loadComponent: loadDeliveryPartnerDetailComponent },
            { path: 'orders', loadComponent: loadOrdersComponent },
            // { path: '**', loadComponent: loadNotFoundComopnent }
        ]
    },
    { path: '**', loadComponent: loadNotFoundComopnent }
];
