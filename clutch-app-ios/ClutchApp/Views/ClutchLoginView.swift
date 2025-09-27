import SwiftUI

struct ClutchLoginView: View {
    @StateObject private var authManager = AuthManager.shared
    @State private var email = ""
    @State private var password = ""
    @State private var isSignUpMode = false
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var phone = ""
    @State private var confirmPassword = ""
    @State private var showForgotPassword = false
    @State private var showOtpVerification = false
    @State private var otpCode = ""
    @State private var emailForOtp = ""
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Logo and Header
                    VStack(spacing: 16) {
                        Image(systemName: "car.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.blue)
                        
                        Text("Clutch")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Your Car's Best Friend")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 40)
                    
                    // Form
                    VStack(spacing: 16) {
                        if isSignUpMode {
                            // Sign Up Form
                            VStack(spacing: 12) {
                                TextField("First Name", text: $firstName)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .autocapitalization(.words)
                                
                                TextField("Last Name", text: $lastName)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .autocapitalization(.words)
                                
                                TextField("Email", text: $email)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .keyboardType(.emailAddress)
                                    .autocapitalization(.none)
                                
                                TextField("Phone", text: $phone)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .keyboardType(.phonePad)
                                
                                SecureField("Password", text: $password)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                
                                SecureField("Confirm Password", text: $confirmPassword)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                        } else {
                            // Sign In Form
                            VStack(spacing: 12) {
                                TextField("Email or Phone", text: $email)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .keyboardType(.emailAddress)
                                    .autocapitalization(.none)
                                
                                SecureField("Password", text: $password)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                        }
                        
                        // Error Message
                        if let errorMessage = authManager.errorMessage {
                            Text(errorMessage)
                                .foregroundColor(.red)
                                .font(.caption)
                                .multilineTextAlignment(.center)
                        }
                        
                        // Action Buttons
                        VStack(spacing: 12) {
                            Button(action: handlePrimaryAction) {
                                HStack {
                                    if authManager.isLoading {
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                            .scaleEffect(0.8)
                                    }
                                    
                                    Text(isSignUpMode ? "Sign Up" : "Sign In")
                                        .fontWeight(.semibold)
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                            }
                            .disabled(authManager.isLoading || !isFormValid)
                            
                            if !isSignUpMode {
                                Button("Forgot Password?") {
                                    showForgotPassword = true
                                }
                                .foregroundColor(.blue)
                                .font(.caption)
                            }
                        }
                        
                        // Social Login Buttons
                        VStack(spacing: 12) {
                            Text("Or continue with")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            HStack(spacing: 16) {
                                Button(action: handleGoogleLogin) {
                                    HStack {
                                        Image(systemName: "globe")
                                        Text("Google")
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.white)
                                    .foregroundColor(.black)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 10)
                                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                    )
                                    .cornerRadius(10)
                                }
                                .disabled(authManager.isLoading)
                                
                                Button(action: handleFacebookLogin) {
                                    HStack {
                                        Image(systemName: "person.2")
                                        Text("Facebook")
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.blue)
                                    .foregroundColor(.white)
                                    .cornerRadius(10)
                                }
                                .disabled(authManager.isLoading)
                            }
                        }
                        
                        // Toggle Sign Up/Sign In
                        Button(action: {
                            isSignUpMode.toggle()
                            clearForm()
                        }) {
                            Text(isSignUpMode ? "Already have an account? Sign In" : "Don't have an account? Sign Up")
                                .foregroundColor(.blue)
                                .font(.caption)
                        }
                    }
                    .padding(.horizontal, 24)
                }
            }
            .navigationBarHidden(true)
        }
        .sheet(isPresented: $showForgotPassword) {
            ForgotPasswordView(email: $emailForOtp, showOtpVerification: $showOtpVerification)
        }
        .sheet(isPresented: $showOtpVerification) {
            OtpVerificationView(email: emailForOtp, otpCode: $otpCode)
        }
    }
    
    private var isFormValid: Bool {
        if isSignUpMode {
            return !firstName.isEmpty && !lastName.isEmpty && !email.isEmpty && !phone.isEmpty && !password.isEmpty && !confirmPassword.isEmpty && password == confirmPassword
        } else {
            return !email.isEmpty && !password.isEmpty
        }
    }
    
    private func handlePrimaryAction() {
        if isSignUpMode {
            handleSignUp()
        } else {
            handleSignIn()
        }
    }
    
    private func handleSignIn() {
        Task {
            do {
                try await authManager.signIn(email: email, password: password)
            } catch {
                // Error is handled by AuthManager
            }
        }
    }
    
    private func handleSignUp() {
        Task {
            do {
                try await authManager.signUp(
                    email: email,
                    phone: phone,
                    firstName: firstName,
                    lastName: lastName,
                    password: password,
                    confirmPassword: confirmPassword
                )
            } catch {
                // Error is handled by AuthManager
            }
        }
    }
    
    private func handleGoogleLogin() {
        Task {
            do {
                try await authManager.signInWithGoogle()
            } catch {
                // Error is handled by AuthManager
            }
        }
    }
    
    private func handleFacebookLogin() {
        Task {
            do {
                try await authManager.signInWithFacebook()
            } catch {
                // Error is handled by AuthManager
            }
        }
    }
    
    private func clearForm() {
        email = ""
        password = ""
        firstName = ""
        lastName = ""
        phone = ""
        confirmPassword = ""
        authManager.errorMessage = nil
    }
}

// MARK: - Forgot Password View
struct ForgotPasswordView: View {
    @Binding var email: String
    @Binding var showOtpVerification: Bool
    @Environment(\.dismiss) private var dismiss
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var successMessage: String?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                VStack(spacing: 16) {
                    Image(systemName: "key.fill")
                        .font(.system(size: 50))
                        .foregroundColor(.blue)
                    
                    Text("Reset Password")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("Enter your email or phone number to receive a reset code")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)
                
                VStack(spacing: 16) {
                    TextField("Email or Phone", text: $email)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                    
                    if let errorMessage = errorMessage {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                    
                    if let successMessage = successMessage {
                        Text(successMessage)
                            .foregroundColor(.green)
                            .font(.caption)
                    }
                    
                    Button(action: handleForgotPassword) {
                        HStack {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .scaleEffect(0.8)
                            }
                            
                            Text("Send Reset Code")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                    }
                    .disabled(isLoading || email.isEmpty)
                }
                .padding(.horizontal, 24)
                
                Spacer()
            }
            .navigationTitle("Forgot Password")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private func handleForgotPassword() {
        isLoading = true
        errorMessage = nil
        successMessage = nil
        
        Task {
            do {
                try await AuthManager.shared.resetPassword(email: email)
                await MainActor.run {
                    successMessage = "Reset code sent to \(email)"
                    isLoading = false
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                        showOtpVerification = true
                        dismiss()
                    }
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                }
            }
        }
    }
}

// MARK: - OTP Verification View
struct OtpVerificationView: View {
    let email: String
    @Binding var otpCode: String
    @Environment(\.dismiss) private var dismiss
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var successMessage: String?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                VStack(spacing: 16) {
                    Image(systemName: "envelope.fill")
                        .font(.system(size: 50))
                        .foregroundColor(.blue)
                    
                    Text("Verify Code")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("Enter the verification code sent to \(email)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)
                
                VStack(spacing: 16) {
                    TextField("Verification Code", text: $otpCode)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.numberPad)
                        .multilineTextAlignment(.center)
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    if let errorMessage = errorMessage {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                    
                    if let successMessage = successMessage {
                        Text(successMessage)
                            .foregroundColor(.green)
                            .font(.caption)
                    }
                    
                    Button(action: handleOtpVerification) {
                        HStack {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .scaleEffect(0.8)
                            }
                            
                            Text("Verify Code")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                    }
                    .disabled(isLoading || otpCode.isEmpty)
                }
                .padding(.horizontal, 24)
                
                Spacer()
            }
            .navigationTitle("Verify Code")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private func handleOtpVerification() {
        isLoading = true
        errorMessage = nil
        successMessage = nil
        
        Task {
            do {
                try await AuthManager.shared.verifyOtp(emailOrPhone: email, otp: otpCode)
                await MainActor.run {
                    successMessage = "Code verified successfully!"
                    isLoading = false
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                        dismiss()
                    }
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                }
            }
        }
    }
}

#Preview {
    ClutchLoginView()
}
