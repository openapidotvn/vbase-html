window.vBaseScript = (() => {
  const utils = {
    isMobile: agent => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent || window.navigator.userAgent),
    fixIE: () => {
      if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
        const msViewportStyle = document.createElement('style');
        msViewportStyle.appendChild(document.createTextNode('@-ms-viewport{width:auto!important}'));
        document.querySelector('head').appendChild(msViewportStyle);
      }
    },
  };

  const init = () => {
    /* Fix IE */
    utils.fixIE();
  };

  return {
    init,
  };
})();

$('document').ready(() => {
  window.vBaseScript.init();
});
