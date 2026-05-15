import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({ providedIn: 'root' })
export class GeoLocateService {
  async getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    try {
      const perm = await Geolocation.requestPermissions();
      if (perm.location === 'denied' || perm.location === 'prompt-with-rationale') {
        return this.browserFallback();
      }
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      return this.browserFallback();
    }
  }

  private browserFallback(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not available'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });
  }
}
