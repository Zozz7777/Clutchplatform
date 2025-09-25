import SwiftUI

struct RequestToJoinView: View {
    @EnvironmentObject var authService: AuthService
    @Environment(\.dismiss) private var dismiss
    
    @State private var businessName = ""
    @State private var ownerName = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var businessType = ""
    @State private var businessDescription = ""
    @State private var yearsInBusiness = ""
    @State private var numberOfEmployees = ""
    @State private var website = ""
    @State private var socialMedia = ""
    @State private var businessAddress = ""
    @State private var city = ""
    @State private var state = ""
    @State private var zipCode = ""
    @State private var country = "Egypt"
    @State private var preferredPartnerType = PartnerType.repairCenter
    @State private var reasonForJoining = ""
    @State private var expectedMonthlyOrders = ""
    @State private var hasExistingCustomers = false
    @State private var existingCustomerCount = ""
    @State private var businessLicense = ""
    @State private var taxId = ""
    @State private var bankAccountInfo = ""
    @State private var references = ""
    @State private var additionalInfo = ""
    @State private var isLoading = false
    @State private var errorMessage = ""
    @State private var showAlert = false
    @State private var showSuccessAlert = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Text("Request to Join")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("Fill out the form below to request partnership with Clutch")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 32)
                    
                    // Form
                    VStack(spacing: 16) {
                        // Business Information Section
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Business Information")
                                .font(.headline)
                                .foregroundColor(.designPrimary)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Business Name")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter your business name", text: $businessName)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Owner Name")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter owner name", text: $ownerName)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Business Type")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("e.g., Auto Repair, Parts Store", text: $businessType)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Business Description")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Describe your business", text: $businessDescription, axis: .vertical)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .lineLimit(3...6)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Years in Business")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Number of years", text: $yearsInBusiness)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .keyboardType(.numberPad)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Number of Employees")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Number of employees", text: $numberOfEmployees)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .keyboardType(.numberPad)
                            }
                        }
                        
                        // Contact Information Section
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Contact Information")
                                .font(.headline)
                                .foregroundColor(.designPrimary)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Email")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter your email", text: $email)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .keyboardType(.emailAddress)
                                    .autocapitalization(.none)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Phone Number")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter your phone number", text: $phone)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .keyboardType(.phonePad)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Website")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Your website URL (optional)", text: $website)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .autocapitalization(.none)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Social Media")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Social media handles (optional)", text: $socialMedia)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                        }
                        
                        // Business Address Section
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Business Address")
                                .font(.headline)
                                .foregroundColor(.designPrimary)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Street Address")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter street address", text: $businessAddress)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                            
                            HStack(spacing: 16) {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("City")
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    
                                    TextField("City", text: $city)
                                        .textFieldStyle(RoundedBorderTextFieldStyle())
                                }
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("State")
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    
                                    TextField("State", text: $state)
                                        .textFieldStyle(RoundedBorderTextFieldStyle())
                                }
                            }
                            
                            HStack(spacing: 16) {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("ZIP Code")
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    
                                    TextField("ZIP code", text: $zipCode)
                                        .textFieldStyle(RoundedBorderTextFieldStyle())
                                        .keyboardType(.numberPad)
                                }
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Country")
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    
                                    TextField("Country", text: $country)
                                        .textFieldStyle(RoundedBorderTextFieldStyle())
                                }
                            }
                        }
                        
                        // Partnership Preferences Section
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Partnership Preferences")
                                .font(.headline)
                                .foregroundColor(.designPrimary)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Preferred Partner Type")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                Picker("Partner Type", selection: $preferredPartnerType) {
                                    ForEach(PartnerType.allCases, id: \.self) { type in
                                        Text(type.displayName).tag(type)
                                    }
                                }
                                .pickerStyle(MenuPickerStyle())
                                .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Reason for Joining")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Why do you want to join Clutch?", text: $reasonForJoining, axis: .vertical)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .lineLimit(3...6)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Expected Monthly Orders")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Expected number of orders per month", text: $expectedMonthlyOrders)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .keyboardType(.numberPad)
                            }
                            
                            Toggle("Do you have existing customers?", isOn: $hasExistingCustomers)
                                .font(.subheadline)
                                .fontWeight(.medium)
                            
                            if hasExistingCustomers {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Number of Existing Customers")
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    
                                    TextField("Approximate number", text: $existingCustomerCount)
                                        .textFieldStyle(RoundedBorderTextFieldStyle())
                                        .keyboardType(.numberPad)
                                }
                            }
                        }
                        
                        // Legal & Financial Information Section
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Legal & Financial Information")
                                .font(.headline)
                                .foregroundColor(.designPrimary)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Business License Number")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter license number", text: $businessLicense)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Tax ID")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter tax ID", text: $taxId)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Bank Account Information")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Bank name and account details", text: $bankAccountInfo, axis: .vertical)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .lineLimit(2...4)
                            }
                        }
                        
                        // Additional Information Section
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Additional Information")
                                .font(.headline)
                                .foregroundColor(.designPrimary)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("References")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Business references (optional)", text: $references, axis: .vertical)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .lineLimit(2...4)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Additional Information")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Any additional information", text: $additionalInfo, axis: .vertical)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .lineLimit(3...6)
                            }
                        }
                        
                        // Error message
                        if !errorMessage.isEmpty {
                            Text(errorMessage)
                                .font(.caption)
                                .foregroundColor(.designDestructive)
                                .multilineTextAlignment(.center)
                        }
                        
                        // Submit button
                        Button(action: submitRequest) {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text("Submit Request")
                                    .font(.headline)
                                    .foregroundColor(.white)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.designPrimary)
                        .cornerRadius(12)
                        .disabled(isLoading || !isFormValid)
                    }
                    .padding(.horizontal, 32)
                }
                .padding(.vertical)
            }
            .navigationTitle("Request to Join")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .alert("Request Failed", isPresented: $showAlert) {
                Button("OK") { }
            } message: {
                Text(errorMessage)
            }
            .alert("Request Submitted", isPresented: $showSuccessAlert) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("Your request has been submitted successfully. We will review it and get back to you soon.")
            }
        }
    }
    
    private var isFormValid: Bool {
        return !businessName.isEmpty &&
               !ownerName.isEmpty &&
               !email.isEmpty &&
               !phone.isEmpty &&
               !businessType.isEmpty &&
               !businessDescription.isEmpty &&
               !yearsInBusiness.isEmpty &&
               !numberOfEmployees.isEmpty &&
               !businessAddress.isEmpty &&
               !city.isEmpty &&
               !state.isEmpty &&
               !zipCode.isEmpty &&
               !country.isEmpty &&
               !reasonForJoining.isEmpty &&
               !expectedMonthlyOrders.isEmpty &&
               !businessLicense.isEmpty &&
               !taxId.isEmpty &&
               !bankAccountInfo.isEmpty
    }
    
    private func submitRequest() {
        isLoading = true
        errorMessage = ""
        
        let businessAddress = BusinessAddress(
            street: businessAddress,
            city: city,
            state: state,
            zipCode: zipCode,
            country: country,
            coordinates: nil
        )
        
        let request = RequestToJoinRequest(
            businessName: businessName,
            ownerName: ownerName,
            email: email,
            phone: phone,
            businessType: businessType,
            businessDescription: businessDescription,
            yearsInBusiness: Int(yearsInBusiness) ?? 0,
            numberOfEmployees: Int(numberOfEmployees) ?? 0,
            website: website.isEmpty ? nil : website,
            socialMedia: socialMedia.isEmpty ? nil : socialMedia,
            businessAddress: businessAddress,
            preferredPartnerType: preferredPartnerType.rawValue,
            reasonForJoining: reasonForJoining,
            expectedMonthlyOrders: Int(expectedMonthlyOrders) ?? 0,
            hasExistingCustomers: hasExistingCustomers,
            existingCustomerCount: hasExistingCustomers ? (Int(existingCustomerCount) ?? 0) : nil,
            businessLicense: businessLicense,
            taxId: taxId,
            bankAccountInfo: bankAccountInfo,
            references: references.isEmpty ? nil : references,
            additionalInfo: additionalInfo.isEmpty ? nil : additionalInfo
        )
        
        authService.requestToJoin(request)
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
                        showSuccessAlert = true
                    }
                }
            )
            .store(in: &authService.cancellables)
    }
}

#Preview {
    RequestToJoinView()
        .environmentObject(AuthService())
}
