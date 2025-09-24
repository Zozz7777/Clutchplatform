import SwiftUI

struct SignUpView: View {
    let partnerType: PartnerType
    @EnvironmentObject var authService: AuthService
    @Environment(\.dismiss) private var dismiss
    
    @State private var partnerId = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var businessName = ""
    @State private var ownerName = ""
    @State private var isLoading = false
    @State private var errorMessage = ""
    @State private var showAlert = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Text("Create your account")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("Join as \(partnerType.displayName)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 32)
                    
                    // Form
                    VStack(spacing: 16) {
                        // Partner ID field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Partner ID")
                                .font(.headline)
                            
                            TextField("Provided by Clutch team", text: $partnerId)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        // Email field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Email")
                                .font(.headline)
                            
                            TextField("Enter your email", text: $email)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                        }
                        
                        // Phone field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Phone Number")
                                .font(.headline)
                            
                            TextField("Enter your phone number", text: $phone)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.phonePad)
                        }
                        
                        // Business name field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Business Name")
                                .font(.headline)
                            
                            TextField("Enter your business name", text: $businessName)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        // Owner name field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Owner Name")
                                .font(.headline)
                            
                            TextField("Enter owner name", text: $ownerName)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        // Password field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Password")
                                .font(.headline)
                            
                            SecureField("Enter your password", text: $password)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        // Confirm password field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Confirm Password")
                                .font(.headline)
                            
                            SecureField("Confirm your password", text: $confirmPassword)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        // Error message
                        if !errorMessage.isEmpty {
                            Text(errorMessage)
                                .font(.caption)
                                .foregroundColor(.red)
                                .multilineTextAlignment(.center)
                        }
                        
                        // Sign up button
                        Button(action: signUp) {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text("Sign Up")
                                    .font(.headline)
                                    .foregroundColor(.white)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.primary)
                        .cornerRadius(12)
                        .disabled(isLoading || !isFormValid)
                    }
                    .padding(.horizontal, 32)
                }
                .padding(.vertical)
            }
            .navigationTitle("Sign Up")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .alert("Sign Up Failed", isPresented: $showAlert) {
                Button("OK") { }
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    private var isFormValid: Bool {
        return !partnerId.isEmpty &&
               !email.isEmpty &&
               !phone.isEmpty &&
               !businessName.isEmpty &&
               !ownerName.isEmpty &&
               !password.isEmpty &&
               !confirmPassword.isEmpty &&
               password == confirmPassword &&
               password.count >= 6
    }
    
    private func signUp() {
        isLoading = true
        errorMessage = ""
        
        let businessAddress = BusinessAddress(
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "Egypt",
            coordinates: nil
        )
        
        let request = SignUpRequest(
            partnerId: partnerId,
            email: email,
            phone: phone,
            password: password,
            businessName: businessName,
            ownerName: ownerName,
            partnerType: partnerType.rawValue,
            businessAddress: businessAddress,
            workingHours: nil,
            businessSettings: nil
        )
        
        authService.signUp(request)
            .sink(
                receiveCompletion: { completion in
                    isLoading = false
                    if case .failure(let error) = completion {
                        errorMessage = error.localizedDescription
                        showAlert = true
                    }
                },
                receiveValue: { success in
                    if success {
                        dismiss()
                    }
                }
            )
            .store(in: &authService.cancellables)
    }
}

#Preview {
    SignUpView(partnerType: .repairCenter)
        .environmentObject(AuthService())
}
