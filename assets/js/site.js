/* KATHALATHHA — menu button for small screens. Without JavaScript the menu is simply always visible. */
(function () {
  "use strict";
  var nav = document.getElementById("site-nav");
  if (!nav) { return; }
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "menu-toggle";
  btn.id = "menu-toggle";
  btn.setAttribute("aria-controls", "site-nav");
  btn.setAttribute("aria-expanded", "false");
  btn.textContent = "Menu";
  nav.parentNode.insertBefore(btn, nav);
  nav.setAttribute("data-collapsed", "true");

  function set(open) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    nav.setAttribute("data-collapsed", open ? "false" : "true");
  }
  btn.addEventListener("click", function () {
    set(btn.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true" && nav.contains(document.activeElement)) {
      set(false);
      btn.focus();
    }
  });
})();
