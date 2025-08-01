// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   role: 'staff' | 'admin';
//   avatar?: string;
// }

// export interface LoginCredentials {
//   email: string;
//   password: string;
// }

// export interface AuthResponse {
//   user: User;
//   token: string;
// }

// export const authService = {
//   // Login user
//   async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
//     await delay(800);
    
//     // Mock authentication - check if user exists
//     const user = mockUsers.find(u => u.email === credentials.email);
    
//     if (!user) {
//       throw new Error('Invalid email or password');
//     }
    
//     // Mock password validation (in real app, this would be secure)
//     if (credentials.password !== 'password123') {
//       throw new Error('Invalid email or password');
//     }
    
//     const token = `mock-token-${user.id}-${Date.now()}`;
    
//     // Store in localStorage for persistence
//     localStorage.setItem('auth-token', token);
//     localStorage.setItem('current-user', JSON.stringify(user));
    
//     return { user, token };
//   },

//   // Logout user
//   async logout(): Promise<void> {
//     await delay(200);
//     localStorage.removeItem('auth-token');
//     localStorage.removeItem('current-user');
//   },

//   // Get current user
//   getCurrentUser(): User | null {
//     const userStr = localStorage.getItem('current-user');
//     return userStr ? JSON.parse(userStr) : null;
//   },

//   // Check if user is authenticated
//   isAuthenticated(): boolean {
//     return !!localStorage.getItem('auth-token');
//   },

//   // Get auth token
//   getToken(): string | null {
//     return localStorage.getItem('auth-token');
//   }
// };