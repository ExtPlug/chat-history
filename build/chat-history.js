

define('extplug/chat-history/main',['require','exports','module','jquery','extplug/Plugin','plug/facades/chatFacade','plug/core/Events','meld'],function (require, exports, module) {

  var $ = require('jquery');
  var Plugin = require('extplug/Plugin');
  var chatFacade = require('plug/facades/chatFacade');
  var Events = require('plug/core/Events');

  var _require = require('meld');

  var before = _require.before;

  var UP = 38;
  var DOWN = 40;
  var HISTORY_MAX = 50;

  module.exports = Plugin.extend({
    name: 'Chat History',
    description: 'Adds shell-style chat history. ' + 'Use up+down keys to scroll through your previous messages.',

    init: function init(id, ext) {
      this._super(id, ext);
      this.onKeyDown = this.onKeyDown.bind(this);
    },
    enable: function enable() {
      var _this = this;

      this._super();
      this.history = [];
      this.index = 0;
      this.current = '';
      this.$field = $('#chat-input-field').on('keydown', this.onKeyDown);
      this.advice = before(chatFacade, 'sendChat', function (msg) {
        _this.history.push(msg);
        if (_this.history.length > HISTORY_MAX) {
          _this.history.shift();
        }
        _this.index = _this.history.length;
        _this.current = '';
      });
      Events.on('chat:afterreceive', this.plugCubedCompat, this);
    },
    disable: function disable() {
      this._super();
      this.$field.off('keydown', this.onKeyDown);
      this.advice.remove();
      Events.off('chat:afterreceive', this.plugCubedCompat);
    },

    // clear plugCubed's chat history list if available,
    // to prevent collisions
    plugCubedCompat: function plugCubedCompat() {
      if (window.plugCubedUserData && window.plugCubedUserData[-1] && window.plugCubedUserData[-1].latestInputs) {
        window.plugCubedUserData[-1].latestInputs = [];
      }
    },

    onKeyDown: function onKeyDown(e) {
      var _this2 = this;

      if (e.keyCode === UP) {
        if (this.index >= this.history.length) {
          this.current = this.$field.val();
        }
        if (this.index > 0) {
          _.defer(function () {
            _this2.$field.val(_this2.history[--_this2.index]);
          });
        }
      }
      if (e.keyCode === DOWN) {
        if (this.index < this.history.length) {
          _.defer(function () {
            _this2.$field.val(_this2.history[++_this2.index] || _this2.current);
          });
        }
      }
    }
  });
});
