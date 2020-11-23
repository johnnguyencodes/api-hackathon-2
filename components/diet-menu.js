// const openDietMenuButton = document.getElementById("open_diet_menu_button");
// const closeDietMenuButton = document.getElementById("close_diet_menu_button");
let dietYPosition;


class DietMenu {
  constructor(dietMenu) {
    this.dietMenu = dietMenu;
    // openDietMenuButton.addEventListener("click", this.openDietMenu.bind(this));
    // closeDietMenuButton.addEventListener("click", this.closeDietMenu.bind(this));
    overlay.addEventListener("click", this.handleOverlayClick.bind(this));
  }

  clickDietInfo(dietInfo) {
    this.dietInfo = dietInfo;
  }

  handleOverlayClick() {
    if (dietMenu.classList.contains("diet-menu-visible")) {
      this.closeDietMenu();
    }
  }

  openDietMenu() {
    event.preventDefault();
    dietYPosition = window.scrollY;
    mainContent.className = "row main-content-right noscroll";
    mainContent.style.top = `-${dietYPosition}px`;
    dietMenu.className = "diet-menu-visible d-flex flex-column justify-content-center";
    overlay.className = "";
  }

  closeDietMenu() {
    event.preventDefault();
    mainContent.className = "row";
    dietMenu.className = "diet-menu-hidden d-flex flex-column justify-content-center";
    this.dietInfo();
    overlay.className = "d-none";
    window.scroll(0, dietYPosition);
  }
}
