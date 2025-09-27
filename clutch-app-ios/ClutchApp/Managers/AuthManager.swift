import Foundation
import Combine

class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    @Published var isLoggedIn = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = ClutchApiService.shared
    private var cancellables = Set<AnyCancellable>()
    
    private init() {
        loadSavedAuthState()
    }
    
    private func loadSavedAuthState() {
        // Load saved auth token and user data from UserDefaults
        if let token = UserDefaults.standard.string(forKey: "auth_token"),
           let userData = UserDefaults.standard.data(forKey: "user_data"),
           let user = try? JSONDecoder().decode(User.self, from: userData) {
            
            apiService.setAuthToken(token)
            DispatchQueue.main.async {
                self.currentUser = user
                self.isLoggedIn = true
            }
        }
    }
    
    func signIn(email: String, password: String) async throws {
        DispatchQueue.main.async {
            self.isLoading = true
            self.errorMessage = nil
        }
        
        do {
            let response = try await apiService.login(emailOrPhone: email, password: password)
            
            // Save auth data
            UserDefaults.standard.set(response.data.token, forKey: "auth_token")
            UserDefaults.standard.set(response.data.refreshToken, forKey: "refresh_token")
            
            if let userData = try? JSONEncoder().encode(response.data.user) {
                UserDefaults.standard.set(userData, forKey: "user_data")
            }
            
            apiService.setAuthToken(response.data.token)
            
            DispatchQueue.main.async {
                self.currentUser = response.data.user
                self.isLoggedIn = true
                self.isLoading = false
            }
        } catch {
            DispatchQueue.main.async {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
            throw error
        }
    }
    
    func signUp(email: String, phone: String, firstName: String, lastName: String, password: String, confirmPassword: String) async throws {
        DispatchQueue.main.async {
            self.isLoading = true
            self.errorMessage = nil
        }
        
        do {
            let response = try await apiService.register(
                email: email,
                phone: phone,
                firstName: firstName,
                lastName: lastName,
                password: password,
                confirmPassword: confirmPassword,
                agreeToTerms: true
            )
            
            // Save auth data
            UserDefaults.standard.set(response.data.token, forKey: "auth_token")
            UserDefaults.standard.set(response.data.refreshToken, forKey: "refresh_token")
            
            if let userData = try? JSONEncoder().encode(response.data.user) {
                UserDefaults.standard.set(userData, forKey: "user_data")
            }
            
            apiService.setAuthToken(response.data.token)
            
            DispatchQueue.main.async {
                self.currentUser = response.data.user
                self.isLoggedIn = true
                self.isLoading = false
            }
        } catch {
            DispatchQueue.main.async {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
            throw error
        }
    }
    
    func signOut() {
        // Clear saved auth data
        UserDefaults.standard.removeObject(forKey: "auth_token")
        UserDefaults.standard.removeObject(forKey: "refresh_token")
        UserDefaults.standard.removeObject(forKey: "user_data")
        
        apiService.clearAuthToken()
        
        DispatchQueue.main.async {
            self.currentUser = nil
            self.isLoggedIn = false
            self.errorMessage = nil
        }
    }
    
    func resetPassword(email: String) async throws {
        DispatchQueue.main.async {
            self.isLoading = true
            self.errorMessage = nil
        }
        
        do {
            _ = try await apiService.forgotPassword(emailOrPhone: email)
            DispatchQueue.main.async {
                self.isLoading = false
            }
        } catch {
            DispatchQueue.main.async {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
            throw error
        }
    }
    
    func verifyOtp(emailOrPhone: String, otp: String) async throws {
        DispatchQueue.main.async {
            self.isLoading = true
            self.errorMessage = nil
        }
        
        do {
            _ = try await apiService.verifyOtp(emailOrPhone: emailOrPhone, otp: otp)
            DispatchQueue.main.async {
                self.isLoading = false
            }
        } catch {
            DispatchQueue.main.async {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
            throw error
        }
    }
    
    func refreshUserProfile() async {
        guard isLoggedIn else { return }
        
        do {
            let user = try await apiService.getUserProfile()
            DispatchQueue.main.async {
                self.currentUser = user
            }
            
            // Update saved user data
            if let userData = try? JSONEncoder().encode(user) {
                UserDefaults.standard.set(userData, forKey: "user_data")
            }
        } catch {
            // Handle error silently or show user-friendly message
            DispatchQueue.main.async {
                self.errorMessage = "Failed to refresh user profile"
            }
        }
    }
}
