class NotificationView {
  constructor() {
    this.container = document.querySelector("#main-content")
  }

  render() {
    return `
      <div class="skip-link">
        <a href="#content" class="skip-to-content">Skip to content</a>
      </div>
      <section id="content" class="container notification-settings-container">
        <h1 class="page-title">Notification Settings</h1>
        
        <div class="notification-card">
          <div class="notification-info">
            <h2>Push Notifications</h2>
            <p>Receive notifications about new stories and updates from Dicoding Stories.</p>
          </div>
          
          <div class="notification-actions">
            <button id="subscribe-button" class="button button-primary">
              Subscribe to Notifications
            </button>
            <button id="unsubscribe-button" class="button button-danger" style="display: none;">
              Unsubscribe from Notifications
            </button>
          </div>
          
          <div id="notification-status" class="notification-status">
            <p>Checking notification status...</p>
          </div>
        </div>
        
        <div class="notification-permissions">
          <h2>Browser Permissions</h2>
          <p>To receive notifications, you need to grant permission in your browser.</p>
          <p>Current permission status: <span id="permission-status">Checking...</span></p>
        </div>
      </section>
    `
  }

  updateSubscriptionStatus(isSubscribed) {
    const subscribeButton = document.getElementById("subscribe-button")
    const unsubscribeButton = document.getElementById("unsubscribe-button")
    const notificationStatus = document.getElementById("notification-status")

    if (subscribeButton && unsubscribeButton && notificationStatus) {
      if (isSubscribed) {
        subscribeButton.style.display = "none"
        unsubscribeButton.style.display = "block"
        notificationStatus.innerHTML = `
          <p class="status-subscribed">You are currently subscribed to notifications.</p>
        `
      } else {
        subscribeButton.style.display = "block"
        unsubscribeButton.style.display = "none"
        notificationStatus.innerHTML = `
          <p class="status-unsubscribed">You are not subscribed to notifications.</p>
        `
      }
    }
  }

  updatePermissionStatus(permission) {
    const permissionStatus = document.getElementById("permission-status")

    if (permissionStatus) {
      let statusText = ""
      let statusClass = ""

      switch (permission) {
        case "granted":
          statusText = "Granted"
          statusClass = "status-granted"
          break
        case "denied":
          statusText = "Denied (You need to change this in your browser settings)"
          statusClass = "status-denied"
          break
        case "default":
          statusText = "Not decided (Please click Subscribe to request permission)"
          statusClass = "status-default"
          break
        default:
          statusText = "Unknown"
          statusClass = "status-unknown"
      }

      permissionStatus.textContent = statusText
      permissionStatus.className = statusClass
    }
  }

  setupSubscribeButton(callback) {
    const subscribeButton = document.getElementById("subscribe-button")
    if (subscribeButton) {
      subscribeButton.addEventListener("click", callback)
    }
  }

  setupUnsubscribeButton(callback) {
    const unsubscribeButton = document.getElementById("unsubscribe-button")
    if (unsubscribeButton) {
      unsubscribeButton.addEventListener("click", callback)
    }
  }

  showLoading() {
    const subscribeButton = document.getElementById("subscribe-button")
    const unsubscribeButton = document.getElementById("unsubscribe-button")

    if (subscribeButton) {
      subscribeButton.disabled = true
      subscribeButton.innerHTML = `
        <span class="loading-spinner" style="width: 20px; height: 20px; border-width: 3px; margin-right: 8px;"></span>
        Processing...
      `
    }

    if (unsubscribeButton) {
      unsubscribeButton.disabled = true
      unsubscribeButton.innerHTML = `
        <span class="loading-spinner" style="width: 20px; height: 20px; border-width: 3px; margin-right: 8px;"></span>
        Processing...
      `
    }
  }

  resetButtons() {
    const subscribeButton = document.getElementById("subscribe-button")
    const unsubscribeButton = document.getElementById("unsubscribe-button")

    if (subscribeButton) {
      subscribeButton.disabled = false
      subscribeButton.textContent = "Subscribe to Notifications"
    }

    if (unsubscribeButton) {
      unsubscribeButton.disabled = false
      unsubscribeButton.textContent = "Unsubscribe from Notifications"
    }
  }

  showError(message) {
    const notificationStatus = document.getElementById("notification-status")

    if (notificationStatus) {
      notificationStatus.innerHTML = `
        <p class="status-error">${message}</p>
      `
    }
  }

  applyViewTransition() {
    document.documentElement.classList.add("view-transition")
  }
}

export default NotificationView
