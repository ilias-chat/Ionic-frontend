import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

export interface GeoPositionResult {
  lat: number;
  lng: number;
  /** True when coordinates came from the device; false when using a default city. */
  fromDevice: boolean;
}

/** Central London — default map center when geolocation is unavailable. */
export const DEFAULT_MAP_CENTER = { lat: 51.5074, lng: -0.1278 };

@Injectable({ providedIn: 'root' })
export class GeoLocateService {
  /** Capacitor Geolocation with browser fallback, then London default. */
  async getCurrentPositionWithFallback(): Promise<GeoPositionResult> {
    try {
      let status = (await Geolocation.checkPermissions()).location;
      if (status === 'prompt') {
        status = (await Geolocation.requestPermissions()).location;
      }
      if (status === 'granted') {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 12000,
        });
        return {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          fromDevice: true,
        };
      }
    } catch {
      /* try browser / default */
    }

    try {
      const browser = await this.browserFallback();
      return { ...browser, fromDevice: true };
    } catch {
      return { ...DEFAULT_MAP_CENTER, fromDevice: false };
    }
  }

  async getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    const r = await this.getCurrentPositionWithFallback();
    return { lat: r.lat, lng: r.lng };
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
