const fileLabel = document.getElementById("custom_file_label");
let fileInputForm = document.getElementById("file_input_form");
const recipeSearchInput = document.getElementById('recipe_search_input');
const resetButton = document.getElementById("reset_button");
const uploadButton = document.getElementById("upload_button");
const searchButton = document.getElementById("search_button");
const openFavoriteButton = document.getElementById("open_favorites_button");
const closeFavoriteButton = document.getElementById("close_favorite_button");
const mainContent = document.getElementById("main_content");
const errorContainer = document.getElementById("error_container");
const errorNoFile = document.getElementById("error_no_file");
const errorIncorrectFile = document.getElementById("error_incorrect_file");
const errorFileExceedsSize = document.getElementById("error_file_exceeds_size");
const errorNoSearch = document.getElementById("error_no_search");
let yPosition;

class Form {
  constructor() {
    uploadButton.addEventListener("click", this.imgValidation.bind(this));
    searchButton.addEventListener("click", this.search.bind(this));
    fileInputForm.addEventListener("change", this.handleAddImage.bind(this));
    openFavoriteButton.addEventListener("click", this.openFavorites.bind(this));
    closeFavoriteButton.addEventListener("click", this.closeFavorites.bind(this));
    overlay.addEventListener("click", this.handleOverlayClick.bind(this));
    recipeSearchInput.addEventListener("keyup", this.enterSearch.bind(this));
    fileLabel.addEventListener("dragover", this.imgValidation.bind(this));
    document.addEventListener("dragover", function(event) {
      event.preventDefault();
    }, false);
  }


  clickDietInfo(dietInfo) {
    this.dietInfo = dietInfo;
  }

  clickPostImage(postImage) {
    this.postImage = postImage;
  }

  clickGetRecipes(getRecipes) {
    this.getRecipes = getRecipes;
  }

    clickGetFavoriteRecipes(getFavoriteRecipes) {
    this.getFavoriteRecipes = getFavoriteRecipes;
  }

  enterSearch() {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.search(event);
    }
  }

  openFavorites() {
    event.preventDefault();
    yPosition = window.scrollY;
    favoriteRecipesSection.className = "favorite-recipes-visible d-flex flex-column justify-content-center";
    if (!(localStorage.getItem('favoriteArray')) || localStorage.getItem('favoriteArray') !== "[]" ) {
      emptyFavoriteTextContainer.className = "d-none";
    }
    mainContent.className="row main-content-right noscroll";
    mainContent.style.top = `-${yPosition}px`;
    formElement.style.top = "0px";
    formElement.className = "ml-3 col-md-6 col-lg-6 col-xl-4 d-flex flex-column align-items-center form-element-left";
    overlay.className = "";
    this.getFavoriteRecipes();
  }

  closeFavorites() {
    event.preventDefault();
    favoriteRecipesSection.className = "favorite-recipes-hidden d-flex flex-column justify-content-center";
    mainContent.className = "row";
    overlay.className = "d-none";
    window.scroll(0, yPosition);
    formElement.className = "ml-3 col-md-6 col-lg-6 col-xl-4 d-flex flex-column align-items-center";
    favoriteRecipesDownloadProgress.className = "recipe-progress-hidden mt-3";
    spoonacularFavoriteError.className = "d-none";
  }

  handleOverlayClick() {
    if (favoriteRecipesSection.classList.contains("favorite-recipes-visible")) {
      this.closeFavorites();
    }
  }

  imgValidation(event) {
    event.preventDefault();
    while (document.getElementById("recipe")) {
      document.getElementById("recipe").remove();
    }
    if (document.getElementById("image_title")) {
      document.getElementById("image_title").remove();
    }
    document.getElementById("percentage_bar_container").className = "col-12 d-flex flex-column justify-content-center my-3";
    uploadedImage.src = "";
    searchResultsQuantityDiv.className = "d-none";
    resultsShownQuantityDiv.className = "d-none";
    imageRecognitionFailedText.className = "d-none";
    errorContainer.className = "d-none";
    errorNoFile.className = "d-none";
    errorIncorrectFile.className = "d-none";
    errorFileExceedsSize.className = "d-none";
    errorNoSearch.className = "d-none";
    titleContainer.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12 d-flex justify-content-around";
    percentageBarContainer.className = "col-12 d-flex flex-column justify-content-center my-3";
    uploadedImageContainer.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12 d-flex justify-content-center my-3";
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].disabled = true;
    }
    if (fileInputForm.files[1]) {
      fileInputForm.files.splice(1, 1);
    }
    const imageFile = fileInputForm.files[0];
    if (!(imageFile)) {
      errorContainer.className="col-12 mt-2";
      errorNoFile.className ="text-danger text-center";
      fileInputForm.value = "";
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = false;
      }
      return;
    }
    const fileType = imageFile.type;
    const formData = new FormData();
    const mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!(mimeTypes.includes(fileType))) {
      errorContainer.className = "col-12 mt-2";
      errorIncorrectFile.className = "text-danger text-center";
      fileInputForm.value = "";
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = false;
      }
      return;
    }
    if (imageFile.size > 10485760) {
      errorContainer.className = "col-12 mt-2";
      errorFileExceedsSize.className = "text-danger text-center";
      fileInputForm.value = "";
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = false;
      }
      return;
    }
    formData.append("image", imageFile);
    this.dietInfo();
    this.postImage(formData);
    fileInputForm.value = "";
  }

  handleAddImage() {
    fileLabel.textContent = "";
    if (!(fileInputForm.files[0])) {
      return;
    }
    let fileName = fileInputForm.files[0].name;
    fileLabel.textContent = fileName;
  }

  search(event) {
    event.preventDefault();
    while (document.getElementById("recipe")) {
      document.getElementById("recipe").remove();
    }
    searchResultsQuantityDiv.className = "d-none";
    resultsShownQuantityDiv.className = "d-none";
    imageRecognitionFailedText.className = "d-none";
    errorContainer.className = "d-none";
    errorNoFile.className = "d-none";
    errorIncorrectFile.className = "d-none";
    errorFileExceedsSize.className = "d-none";
    errorNoSearch.className = "d-none";
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].disabled = true;
    }
    let query = (recipeSearchInput.value)
    if (query === "") {
      errorContainer.className = "col-12 mt-2";
      errorNoSearch.className = "text-danger text-center";
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = false;
      }
      return;
    }
    titleContainer.className = "d-none";
    percentageBarContainer.className = "d-none";
    uploadedImageContainer.className = "d-none";
    this.dietInfo();
    this.getRecipes(query);
  }

  // resetFields() {
    // event.preventDefault();
    // for (var i = 0; i < inputs.length; i++) {
    //   inputs[i].disabled = false;
    // }
    // fileLabel.textContent = "";
    // if (document.getElementById("image_title")) {
    //   document.getElementById("image_title").remove();
    // }
    // recipeSearchInput.value = "";
    // uploadedImage.src = "";
    // searchRecipesDownloadProgress.className = "recipe-progress-hidden text-left mt-3";
    // searchRecipesDownloadText.className = "d-none";
    // noSearchRecipesText.className = "d-none";
    // emptyFavoriteTextContainer.className = "d-none";
    // resultsShownQuantityDiv.className = "d-none";
    // showMoreButton.className = "btn btn-secondary my-2"
    // spoonacularSearchError.className = "d-none";
    // titleContainer.className = "d-none";
    // percentageBarContainer.className = "d-none";
    // uploadedImageContainer.className = "d-none";
    // imageRecognitionFailedText.className = "d-none";
    // errorContainer.className = "d-none";
    // errorNoFile.className = "d-none";
    // errorIncorrectFile.className = "d-none";
    // errorFileExceedsSize.className = "d-none";
    // errorNoSearch.className = "d-none";
  // }
}
