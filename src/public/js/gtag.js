window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("consent", "default", {
  ad_user_data: "granted",
  ad_personalization: "granted",
  ad_storage: "granted",
  analytics_storage: "granted",
  wait_for_update: 500,
});
gtag("js", new Date());

gtag("config", "G-BL9LRG9CK6");

document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
  const grantButton = document.querySelector(".fc-cta-consent");
  if (grantButton) {
    grantButton.addEventListener("click", function (event) {
      console.log("ok");
      localStorage.setItem("consentGranted", "true");

      gtag("consent", "update", {
        ad_user_data: "granted",
        ad_personalization: "granted",
        ad_storage: "granted",
        analytics_storage: "granted",
      });

      // Load gtag.js script.
      const gtagScript = document.createElement("script");
      gtagScript.async = true;
      gtagScript.src =
        "https://www.googletagmanager.com/gtag/js?id=G-BL9LRG9CK6";

      const firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode.insertBefore(gtagScript, firstScript);
    });
  }
}
