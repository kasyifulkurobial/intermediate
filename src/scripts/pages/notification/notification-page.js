import NotificationView from "../../views/notification-view"
import NotificationPresenter from "../../presenters/notification-presenter"

export default class NotificationPage {
  constructor() {
    this.view = null
    this.presenter = null
  }

  async render() {
    this.view = new NotificationView()
    return this.view.render()
  }

  async afterRender() {
    this.presenter = new NotificationPresenter({
      view: this.view,
    })

    await this.presenter.init()
  }
}
