import { Routes } from '@angular/router';
import { CalculatorComponent } from './components/calculator/calculator';
import { HistoryComponent } from './components/history/history';
import { ApplicationComponent } from './components/application/application';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { ComparisonComponent } from './components/comparison/comparison';
import { LoginComponent } from './components/login/login';
import { authGuard } from './guards/auth.guard';
import { WizardComponent } from './components/wizard/wizard';
import { SavingsComponent } from './components/savings/savings';
import { ProfileComponent } from './components/profile/profile';

export const routes: Routes = [
  { path: 'hesapla', component: CalculatorComponent },
  { path: 'karsilastirma', component: ComparisonComponent },
  { path: 'gecmis', component: HistoryComponent },
  { path: 'hedef', component: SavingsComponent },
  { path: 'profil', component: ProfileComponent },
  { path: 'kredibasvuru', component: ApplicationComponent },
  { path: 'wizard', component: WizardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminDashboard, canActivate: [authGuard] },
  { path: '', redirectTo: '/wizard', pathMatch: 'full' }
];
