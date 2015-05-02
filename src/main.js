define(function (require, exports, module) {

  const $ = require('jquery')
  const Plugin = require('extplug/Module')
  const chatFacade = require('plug/facades/chatFacade')
  const { before } = require('meld')

  const UP = 38
  const DOWN = 40
  const HISTORY_MAX = 50

  module.exports = Plugin.extend({
    name: 'Chat History',
    description: 'Adds shell-style chat history. ' +
                 'Use up+down keys to scroll through your previous messages.',

    init(id, ext) {
      this._super(id, ext)
      this.onKeyDown = this.onKeyDown.bind(this)
    },
    enable() {
      this._super()
      this.history = []
      this.index = 0
      this.current = ''
      this.$field = $('#chat-input-field').on('keydown', this.onKeyDown)
      this.advice = before(chatFacade, 'sendChat', msg => {
        this.history.push(msg)
        if (this.history.length > HISTORY_MAX) {
          this.history.shift()
        }
        this.index = this.history.length
        this.current = ''
      })
    },
    disable() {
      this._super()
      this.$field.off('keydown', this.onKeyDown)
      this.advice.remove()
    },

    onKeyDown(e) {
      if (e.keyCode === UP) {
        if (this.index >= this.history.length) {
          this.current = this.$field.val()
        }
        if (this.index > 0) {
          _.defer(() => {
            this.$field.val(this.history[--this.index])
          })
        }
      }
      if (e.keyCode === DOWN) {
        if (this.index < this.history.length) {
          _.defer(() => {
            this.$field.val(this.history[++this.index] || this.current)
          })
        }
      }
    }
  })

})
