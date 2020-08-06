const imgurAPIKey = config.imgurAPIKey;
const googleAPIKey = config.googleAPIKey;
const spoonacularAPIKey = config.spoonacularAPIKey;
const dietMenu = document.getElementById("diet_menu");
let fileInputForm = document.getElementById("file_input_form");
const fileLabel = document.getElementById("custom_file_label");
const searchInput = document.getElementById("recipe_search_input");
const image = document.getElementById("my_image");
const inputs = document.querySelectorAll(".input");
const recipeDownloadText = document.getElementById("recipe_download_text");
const uploadButton = document.getElementById("upload_button");
const searchButton = document.getElementById("search_button");
const recipeSearchInput = document.getElementById('recipe_search_input')
const resetButton = document.getElementById("reset_button");
const openFavoriteButton = document.getElementById("open_favorites_button");
const closeFavoriteButton = document.getElementById("close_favorites_button");
const openDietMenuButton = document.getElementById("open_diet_menu_button");
const closeDietMenuButton = document.getElementById("close_diet_menu_button");

let dataForImageRecognition = {
  "requests": [
    {
      "image": {
        "source": {
          "imageUri": null
        }
      },
      "features": [
        {
          "type": "LABEL_DETECTION"
        }
      ]
    }
  ]
};


let spoonacularDataToSend = {
  "diet": null,
  "intolerances": null
}

let favoritedArray = [125533];

class App {
  constructor(pageHeader, imageTitleContainer, recipesHandler, dietForm) {
    this.pageHeader = pageHeader;
    this.imageTitleContainer = imageTitleContainer;
    this.recipesHandler = recipesHandler;
    this.dietForm = dietForm;
    this.dietInfo = this.dietInfo.bind(this);
    this.postImage = this.postImage.bind(this);
    this.handlePostImageSuccess = this.handlePostImageSuccess.bind(this);
    this.handlePostImageError = this.handlePostImageError.bind(this);
    this.imageRecognition = this.imageRecognition.bind(this);
    this.handleImageRecognitionSuccess = this.handleImageRecognitionSuccess.bind(this);
    this.handleImageRecognitionError = this.handleImageRecognitionError.bind(this);
    this.getRecipes = this.getRecipes.bind(this);
    this.handleGetRecipesSuccess = this.handleGetRecipesSuccess.bind(this);
    this.handleGetRecipesError = this.handleGetRecipesError.bind(this);
    this.getFavoritedRecipes = this.getFavoritedRecipes.bind(this);
    this.handleGetFavoritedRecipesSuccess = this.handleGetFavoritedRecipesSuccess.bind(this);
    this.handleGetFavoritedRecipesError = this.handleGetFavoritedRecipesError.bind(this);
  }


  start() {
  this.pageHeader.clickDietInfo(this.dietInfo);
  this.pageHeader.clickPostImage(this.postImage);
  this.pageHeader.clickGetRecipes(this.getRecipes);
  this.getFavoritedRecipes();
  }

  dietInfo() {
    let restrictionValues = "";
    let intoleranceValues = "";
    var restrictionCheckboxes = document.getElementsByClassName("restrictionCheckbox");
    for (var i = 0; i < restrictionCheckboxes.length; i++) {
      if (restrictionCheckboxes[i].checked) {
        restrictionValues += restrictionCheckboxes[i].value + ", ";
      }
    }
    var intoleranceCheckboxes = document.getElementsByClassName("intoleranceCheckbox");
    for (var j = 0; j < intoleranceCheckboxes.length; j++) {
      if (intoleranceCheckboxes[j].checked) {
        intoleranceValues += intoleranceCheckboxes[j].value + ", ";
      }
    }
    spoonacularDataToSend.diet = restrictionValues.slice(0, -2)
    spoonacularDataToSend.intolerances = intoleranceValues.slice(0, -2);
  }

  //POST request to IMGUR with image id supplied
  postImage(formData) {
    $.ajax({
      method: "POST",
      url: "https://api.imgur.com/3/image/",
      data: formData,
      processData: false,
      contentType: false,
      cache: false,
      headers: {
        "Authorization": `${imgurAPIKey}`
      },
      xhr: function () {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function (evt) {
          if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            $('#upload_progress').css({
              width: percentComplete * 100 + '%'
            });
            if (percentComplete > 0 && percentComplete < 1) {
              $('#image_upload_container').removeClass('d-none');
            }
            if (percentComplete === 1) {
              $('#image_upload_container').addClass('d-none');
            }
          }
        }, false);
        return xhr;
      },
      success: this.handlePostImageSuccess,
      error: this.handlePostImageError
    })
    }

  handlePostImageSuccess(data) {
    const imageURL = data.data.link;
    dataForImageRecognition.requests[0].image.source.imageUri = imageURL;
    this.imageTitleContainer.imageOnPage(imageURL);
    this.imageRecognition();
  }

  handlePostImageError(error) {
    console.error(error)
  }

  //POST request to Google's Cloud Vision API with image from IMGUR to label the object in the image
  imageRecognition() {
    document.getElementById("title_download_text").className = "text-center";
    $.ajax({
      url: `https://vision.googleapis.com/v1/images:annotate?fields=responses&key=${googleAPIKey}`,
      type: "POST",
      dataType: "JSON",
      contentType: "application/json",
      data: JSON.stringify(dataForImageRecognition),
      success: this.handleImageRecognitionSuccess,
      error: this.handleImageRecognitionError
    });
  }

  handleImageRecognitionSuccess(response) {
    if (!(response.responses[0].labelAnnotations)) {
      alert("Sorry, your image could not be recognized. Please upload a different image or enter a search");
      document.getElementById("my_image").src = "";
      return;
    }
    const imageTitle = response.responses[0].labelAnnotations[0].description;
    this.imageTitleContainer.imageTitleOnPage(imageTitle);
    document.getElementById("title_download_text").className = "text-center d-none";
    this.getRecipes(imageTitle);
  }

  handleImageRecognitionError(error) {
    console.error(error);
  }

  //GET request to Spoonacular's API with label from Google to get a list of up to 10 recipes containing the item from the image and other nutrition info.
  getRecipes(imageTitle) {
    document.getElementById("recipe_download_text").className = "text-center";
    let spoonacularURL = `https://api.spoonacular.com/recipes/complexSearch?query=${imageTitle}&apiKey=${spoonacularAPIKey}&addRecipeNutrition=true`
    $.ajax({
      method: "GET",
      url: spoonacularURL,
      data: spoonacularDataToSend,
      headers: {
        "Content-Type": "application/json"
      },
      success: this.handleGetRecipesSuccess,
      error: this.handleGetRecipesError
    })
  }

  handleGetRecipesSuccess(recipes) {
    this.recipesHandler.displaySearchedRecipes(recipes);
  }

  handleGetRecipesError(error) {
    console.error(error);
  }

  getFavoritedRecipes() {
    let spoonacularURL = `https://api.spoonacular.com/recipes/informationBulk?ids=715538,716429&apiKey=${spoonacularAPIKey}&includeNutrition=true&size=312x231`
    $.ajax({
      method: "GET",
      url: spoonacularURL,
      headers: {
        "Content-Type": "application/json"
      },
      success: this.handleGetFavoritedRecipesSuccess,
      error: this.handleGetFavoritedRecipesError
    })
  }

  handleGetFavoritedRecipesSuccess(recipes) {
    this.recipesHandler.displayFavoritedRecipes(recipes);
  }

  handleGetFavoritedRecipesError(error) {
    console.error(error);
  }
}
