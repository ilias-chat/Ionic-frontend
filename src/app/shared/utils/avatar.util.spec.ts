import { isValidAvatarUrl, resolveAvatarUrl, userInitials } from './avatar.util';

describe('avatar.util', () => {
  it('resolveAvatarUrl prefers valid mongo avatar', () => {
    expect(resolveAvatarUrl('https://mongo/photo.jpg', 'https://firebase/photo.jpg')).toBe(
      'https://mongo/photo.jpg'
    );
  });

  it('resolveAvatarUrl falls back to firebase when mongo avatar is empty', () => {
    expect(resolveAvatarUrl('', 'https://firebase/photo.jpg')).toBe('https://firebase/photo.jpg');
  });

  it('resolveAvatarUrl falls back to firebase when mongo avatar is invalid', () => {
    expect(resolveAvatarUrl('not-a-url', 'https://firebase/photo.jpg')).toBe(
      'https://firebase/photo.jpg'
    );
  });

  it('isValidAvatarUrl rejects non-http schemes', () => {
    expect(isValidAvatarUrl('javascript:alert(1)')).toBe(false);
    expect(isValidAvatarUrl('https://cdn.example.com/a.png')).toBe(true);
  });

  it('userInitials builds from full name', () => {
    expect(userInitials('Alex Rivera')).toBe('AR');
  });

  it('userInitials falls back to email', () => {
    expect(userInitials(null, 'alex@footylocal.com')).toBe('al');
  });
});
