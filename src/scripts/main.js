window.AwesomeScript = (function() {
  var _this = {};

  _this.init = function() {
  };

  _this.utils = {
    isMobile: function(agent) {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent || window.navigator.userAgent);
    }
  };

  _this.fixIE = function() {
    if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
      var msViewportStyle = document.createElement('style')
      msViewportStyle.appendChild(document.createTextNode('@-ms-viewport{width:auto!important}'))
      document.querySelector('head').appendChild(msViewportStyle)
    }
  };

  return _this;
})();

$('document').ready(function() {
  window.AwesomeScript.init();
});
