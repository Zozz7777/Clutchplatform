import SwiftUI

struct OnboardingView: View {
    let onComplete: () -> Void
    @State private var currentPage = 0
    
    private let pages = [
        OnboardingPage(
            title: "Check Car Health Instantly",
            description: "Get real-time insights about your car's condition with our advanced diagnostics",
            icon: "car.fill"
        ),
        OnboardingPage(
            title: "Book Services & Buy Parts Easily",
            description: "Find trusted mechanics and order genuine parts with just a few taps",
            icon: "wrench.and.screwdriver.fill"
        ),
        OnboardingPage(
            title: "Earn Rewards While Driving",
            description: "Get points for every service, review, and tip you share with the community",
            icon: "star.fill"
        )
    ]
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [Color.clutchRed, Color.clutchRedLight]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            VStack {
                // Skip button
                HStack {
                    Spacer()
                    Button("Skip") {
                        onComplete()
                    }
                    .foregroundColor(.white.opacity(0.7))
                    .padding()
                }
                
                Spacer()
                
                // Page content
                TabView(selection: $currentPage) {
                    ForEach(0..<pages.count, id: \.self) { index in
                        OnboardingPageView(page: pages[index])
                            .tag(index)
                    }
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
                
                Spacer()
                
                // Page indicators
                HStack(spacing: 8) {
                    ForEach(0..<pages.count, id: \.self) { index in
                        Circle()
                            .fill(currentPage == index ? Color.white : Color.white.opacity(0.3))
                            .frame(width: currentPage == index ? 24 : 8, height: 8)
                            .animation(.easeInOut, value: currentPage)
                    }
                }
                
                // Navigation buttons
                HStack {
                    if currentPage > 0 {
                        Button("Previous") {
                            withAnimation {
                                currentPage -= 1
                            }
                        }
                        .foregroundColor(.white)
                    } else {
                        Spacer()
                    }
                    
                    Button(currentPage == pages.count - 1 ? "Get Started" : "Next") {
                        if currentPage == pages.count - 1 {
                            onComplete()
                        } else {
                            withAnimation {
                                currentPage += 1
                            }
                        }
                    }
                    .foregroundColor(.clutchRed)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background(Color.white)
                    .cornerRadius(12)
                    .font(.system(size: 16, weight: .semibold))
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 24)
            }
        }
    }
}

struct OnboardingPageView: View {
    let page: OnboardingPage
    
    var body: some View {
        VStack(spacing: 48) {
            // Icon
            Image(systemName: page.icon)
                .font(.system(size: 120))
                .foregroundColor(.white.opacity(0.1))
            
            VStack(spacing: 16) {
                // Title
                Text(page.title)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                
                // Description
                Text(page.description)
                    .font(.system(size: 16))
                    .foregroundColor(.white.opacity(0.8))
                    .multilineTextAlignment(.center)
                    .lineLimit(nil)
                    .padding(.horizontal, 32)
            }
        }
    }
}

struct OnboardingPage {
    let title: String
    let description: String
    let icon: String
}

#Preview {
    OnboardingView {
        print("Onboarding completed")
    }
}
