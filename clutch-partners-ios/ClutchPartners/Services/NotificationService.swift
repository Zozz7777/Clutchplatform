import Foundation
import UserNotifications
import Combine

class NotificationService: NSObject, ObservableObject {
    static let shared = NotificationService()
    
    @Published var isAuthorized = false
    
    private override init() {
        super.init()
        requestPermission()
    }
    
    func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { [weak self] granted, error in
            DispatchQueue.main.async {
                self?.isAuthorized = granted
            }
        }
    }
    
    func scheduleLocalNotification(
        title: String,
        body: String,
        identifier: String = UUID().uuidString,
        timeInterval: TimeInterval = 1.0
    ) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: false)
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Error scheduling notification: \(error)")
            }
        }
    }
    
    func sendPushNotification(
        to token: String,
        title: String,
        body: String,
        data: [String: Any] = [:]
    ) -> AnyPublisher<Bool, Error> {
        let networkService = NetworkService.shared
        
        let payload = [
            "to": token,
            "notification": [
                "title": title,
                "body": body
            ],
            "data": data
        ]
        
        guard let requestData = try? JSONSerialization.data(withJSONObject: payload) else {
            return Fail(error: NetworkError.decodingError)
                .eraseToAnyPublisher()
        }
        
        return networkService.request(
            endpoint: "/notifications/push",
            method: .POST,
            body: requestData,
            responseType: NotificationResponse.self
        )
        .map { $0.success }
        .eraseToAnyPublisher()
    }
    
    func sendEmailNotification(
        to email: String,
        subject: String,
        body: String
    ) -> AnyPublisher<Bool, Error> {
        let networkService = NetworkService.shared
        
        let payload = [
            "to": email,
            "subject": subject,
            "body": body
        ]
        
        guard let requestData = try? JSONSerialization.data(withJSONObject: payload) else {
            return Fail(error: NetworkError.decodingError)
                .eraseToAnyPublisher()
        }
        
        return networkService.request(
            endpoint: "/notifications/email",
            method: .POST,
            body: requestData,
            responseType: NotificationResponse.self
        )
        .map { $0.success }
        .eraseToAnyPublisher()
    }
    
    func sendSMSNotification(
        to phone: String,
        message: String
    ) -> AnyPublisher<Bool, Error> {
        let networkService = NetworkService.shared
        
        let payload = [
            "to": phone,
            "message": message
        ]
        
        guard let requestData = try? JSONSerialization.data(withJSONObject: payload) else {
            return Fail(error: NetworkError.decodingError)
                .eraseToAnyPublisher()
        }
        
        return networkService.request(
            endpoint: "/notifications/sms",
            method: .POST,
            body: requestData,
            responseType: NotificationResponse.self
        )
        .map { $0.success }
        .eraseToAnyPublisher()
    }
}

struct NotificationResponse: Codable {
    let success: Bool
    let message: String
}