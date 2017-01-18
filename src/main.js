import $ from 'jquery'
import { defer } from 'underscore'
import Plugin from 'extplug/Plugin'
import chatFacade from 'plug/facades/chatFacade'
import Events from 'plug/core/Events'
import { before } from 'meld'

const UP = 38
const DOWN = 40
const HISTORY_MAX = 50

export default Plugin.extend({
  name: 'Chat History',
  description: 'Adds shell-style chat history. ' +
               'Use up+down keys to scroll through your previous messages.',

  init(id, ext) {
    this._super(id, ext)
    this.onKeyDown = this.onKeyDown.bind(this)
  },

  enable() {
    this._super()
    this.history = this.settings.get('history') || []
    this.index = this.history.length
    this.current = ''
    this.$field = $('#chat-input-field').on('keydown', this.onKeyDown)
    this.advice = before(chatFacade, 'sendChat', (msg) => {
      this.history.push(msg)
      if (this.history.length > HISTORY_MAX) {
        this.history.shift()
      }
      // set it to a clone so Backbone triggers change events
      this.settings.set('history', this.history.slice())
      this.index = this.history.length
      this.current = ''
    })
    Events.on('chat:afterreceive', this.plugCubedCompat, this)
  },

  disable() {
    this._super()
    this.$field.off('keydown', this.onKeyDown)
    this.advice.remove()
    Events.off('chat:afterreceive', this.plugCubedCompat)
  },

  // clear plugCubed's chat history list if available,
  // to prevent collisions
  plugCubedCompat() {
    if (window.plugCubedUserData &&
        window.plugCubedUserData[-1] &&
        window.plugCubedUserData[-1].latestInputs) {
      window.plugCubedUserData[-1].latestInputs = []
    }
  },

  onKeyDown(e) {
    if (e.keyCode === UP) {
      if (this.index >= this.history.length) {
        this.current = this.$field.val()
      }
      if (this.index > 0) {
        defer(() => {
          this.$field.val(this.history[--this.index])
        })
      }
    }
    if (e.keyCode === DOWN) {
      if (this.index < this.history.length) {
        defer(() => {
          this.$field.val(this.history[++this.index] || this.current)
        })
      }
    }
  }
})
