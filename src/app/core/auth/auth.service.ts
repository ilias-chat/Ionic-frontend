import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MongoUser } from '../../shared/models/user.model';
import { GuestSessionService } from '../session/guest-session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly guestSession = inject(GuestSessionService);

  readonly mongoUser = signal<MongoUser | null>(null);

  get firebaseUser(): User | null {
    return this.auth.currentUser;
  }

  async signUp(email: string, password: string, displayName?: string): Promise<void> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.syncMongoProfile(cred.user.email || email, displayName?.trim());
    await this.refreshMongoUser();
    this.guestSession.exitGuest();
  }

  async signIn(email: string, password: string): Promise<void> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    await this.syncMongoProfile(cred.user.email || email, cred.user.displayName || undefined);
    await this.refreshMongoUser();
    this.guestSession.exitGuest();
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
    this.mongoUser.set(null);
    this.guestSession.exitGuest();
    await this.router.navigateByUrl('/welcome', { replaceUrl: true });
  }

  continueAsGuest(): void {
    void signOut(this.auth).catch(() => undefined);
    this.mongoUser.set(null);
    this.guestSession.enterGuest();
    void this.router.navigateByUrl('/tabs/discovery', { replaceUrl: true });
  }

  private async syncMongoProfile(email: string, name?: string): Promise<void> {
    const u = this.auth.currentUser;
    if (!u) {
      throw new Error('Not signed in');
    }
    const body: Record<string, string> = {
      firebaseUID: u.uid,
      email,
    };
    if (name) {
      body['name'] = name;
    }
    await firstValueFrom(
      this.http.post<MongoUser>(`${environment.apiBaseUrl}/api/users/sync`, body)
    );
  }

  async refreshMongoUser(): Promise<void> {
    const u = this.auth.currentUser;
    if (!u) {
      this.mongoUser.set(null);
      return;
    }
    try {
      const me = await firstValueFrom(
        this.http.get<MongoUser>(`${environment.apiBaseUrl}/api/users/me`)
      );
      this.mongoUser.set(me);
    } catch {
      this.mongoUser.set(null);
    }
  }

  isSignedIn(): boolean {
    return !!this.auth.currentUser && !this.guestSession.isGuest();
  }
}
