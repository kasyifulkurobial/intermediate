import NotificationHelper from "../utils/notification-helper"
import { getToken } from "../data/api"

class NotificationPresenter {
  constructor({ view }) {
    this.view = view
    this.isSubscribed = false
    this.permissionStatus = "default"
  }

  async init() {
    // Check if user is logged in
    const token = getToken()
    if (!token) {
      this.view.showError("You need to be logged in to manage notifications.")
      this.view.applyViewTransition()
      return
    }

    // Check current permission status
    this.permissionStatus = Notification.permission
    this.view.updatePermissionStatus(this.permissionStatus)

    // Check if already subscribed
    await this._checkSubscriptionStatus()

    // Setup buttons
    this.view.setupSubscribeButton(this._handleSubscribe.bind(this))
    this.view.setupUnsubscribeButton(this._handleUnsubscribe.bind(this))

    // Apply view transition
    this.view.applyViewTransition()
  }

  async _checkSubscriptionStatus() {
    try {
      // Check if service worker is registered
      if (!("serviceWorker" in navigator)) {
        this.view.showError("Service Worker is not supported in this browser.")
        return
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      this.isSubscribed = !!subscription
      this.view.updateSubscriptionStatus(this.isSubscribed)
    } catch (error) {
      console.error("Error checking subscription status:", error)
      this.view.showError("Failed to check notification subscription status.")
    }
  }

  async _handleSubscribe() {
    const token = getToken()
    if (!token) {
      this.view.showError("You need to be logged in to subscribe to notifications.")
      return
    }

    this.view.showLoading()

    try {
      const result = await NotificationHelper.subscribePushNotification(token)

      if (result.success) {
        this.isSubscribed = true
        this.view.updateSubscriptionStatus(true)
        this.permissionStatus = Notification.permission
        this.view.updatePermissionStatus(this.permissionStatus)
      } else {
        this.view.showError(result.message || "Failed to subscribe to notifications.")
      }
    } catch (error) {
      console.error("Error subscribing to notifications:", error)
      this.view.showError("An error occurred while subscribing to notifications.")
    } finally {
      this.view.resetButtons()
    }
  }

  async _handleUnsubscribe() {
    const token = getToken()
    if (!token) {
      this.view.showError("You need to be logged in to unsubscribe from notifications.")
      return
    }

    this.view.showLoading()

    try {
      const result = await NotificationHelper.unsubscribePushNotification(token)

      if (result.success) {
        this.isSubscribed = false
        this.view.updateSubscriptionStatus(false)
      } else {
        this.view.showError(result.message || "Failed to unsubscribe from notifications.")
      }
    } catch (error) {
      console.error("Error unsubscribing from notifications:", error)
      this.view.showError("An error occurred while unsubscribing from notifications.")
    } finally {
      this.view.resetButtons()
    }
  }
}

export default NotificationPresenter
