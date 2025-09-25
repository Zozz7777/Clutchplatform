import SwiftUI

struct AuthView: View {
    @EnvironmentObject var authService: AuthService
    @Environment(\.dismiss) private var dismiss
    @State private var showSignIn = false
    @State private var showSignUp = false
    @State private var showRequestToJoin = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 32) {
                // Header
                VStack(spacing: 16) {
                    Image(systemName: "wrench.and.screwdriver.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.designPrimary)
                    
                    Text("Welcome to Clutch Partners")
                        .font(.title)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)
                    
                    Text("Choose how you'd like to get started")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 64)
                
                // Auth options
                VStack(spacing: 16) {
                    // Sign In button
                    Button(action: { showSignIn = true }) {
                        HStack {
                            Image(systemName: "person.fill")
                            Text("Sign In")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.designPrimary)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                    
                    // Sign Up button
                    Button(action: { showSignUp = true }) {
                        HStack {
                            Image(systemName: "person.badge.plus")
                            Text("Sign Up")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray6))
                        .foregroundColor(.designPrimary)
                        .cornerRadius(12)
                    }
                    
                    // Request to Join button
                    Button(action: { showRequestToJoin = true }) {
                        HStack {
                            Image(systemName: "hand.raised.fill")
                            Text("Request to Join")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray6))
                        .foregroundColor(.designPrimary)
                        .cornerRadius(12)
                    }
                }
                .padding(.horizontal, 32)
                
                Spacer()
            }
            .navigationTitle("Authentication")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Back") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showSignIn) {
                SignInView()
                    .environmentObject(authService)
            }
            .sheet(isPresented: $showSignUp) {
                SignUpView(partnerType: authService.selectedPartnerType ?? .repairCenter)
                    .environmentObject(authService)
            }
            .sheet(isPresented: $showRequestToJoin) {
                RequestToJoinView()
                    .environmentObject(authService)
            }
        }
    }
}

#Preview {
    AuthView()
        .environmentObject(AuthService())
}