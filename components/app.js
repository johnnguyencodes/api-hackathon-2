class App {
  constructor(pageHeader, dietForm, imageTitleContainer, recipesContainer) {
    this.pageHeader = pageHeader,
    this.dietForm = dietForm,
    this.imageTitleContainer = imageTitleContainer,
    this.recipesContainer = recipesContainer;
    this.imgValidation = this.imgValidation.bind(this);
    this.postImage = this.postImage.bind(this);
    this.imageRecognition = this.imageRecognition.bind(this);
    this.getRecipes = this.getRecipes.bind(this);
    this.handlePostImageSuccess = this.handlePostImageSuccess.bind(this);
    this.handlePostImageError = this.handlePostImageError.bind(this);
  }

  start() {
  this.imgValidation(event);
  }

  imgValidation(event) {
    event.preventDefault();
    const fileInput = document.getElementById("file_input_form");
    if (fileInput.files[1]) {
      fileInput.files.splice(1, 1);
    }
    const imageFile = fileInput.files[0];
    if (!(imageFile)) {
      alert("Error: No file selected, please select a file to upload.");
      fileInput.value = "";
      return;
    }
    const inputs = document.querySelectorAll(".input");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].disabled = true;
    }
    const fileType = imageFile.type;
    const formData = new FormData();
    const mimeTypes = ['image/jpg', 'image/png', 'image/gif'];
    if (!(mimeTypes.indexOf(fileType))) {
      alert("Error: Incorrect file type, please select a jpeg, png or gif file.");
      fileInput.value = "";
      return;
    }
    if (imageFile.size > 10 * 1024 * 1024) {
      alert("Error: Image exceeds 10MB size limit");
      fileInput.value = "";
      return;
    }
    formData.append("image", imageFile);
    dietInfo();
    postImage(formData);
    fileInput.value = "";
  }

//*App Begin

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
      "Authorization": "Client-ID 62cbd49ff79d018"
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
  imageOnPage(imageURL);
  imageRecognition();
}

handlePostImageError(error) {
  console.error(error)
}


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

//POST request to Google's Cloud Vision API with image from IMGUR to label the object in the image
imageRecognition() {
  document.getElementById("title_download_text").className = "text-center";
  $.ajax({
    url: "https://vision.googleapis.com/v1/images:annotate?fields=responses&key=AIzaSyAJzv7ThEspgv8_BxX2EwCs8PUEJMtJN6c",
    type: "POST",
    dataType: "JSON",
    contentType: "application/json",
    data: JSON.stringify(dataForImageRecognition),
    success: function (response) {
      if (!(response.responses[0].labelAnnotations)) {
        alert("Sorry, your image could not be recognized. Please upload a different image or enter a search");
        document.getElementById("my_image").src = "";
        return;
      }
      const imageTitle = response.responses[0].labelAnnotations[0].description;
      imageTitleOnPage(imageTitle);
      document.getElementById("title_download_text").className = "text-center d-none";
      getRecipes(imageTitle);
    },
    error: function (err) {
      console.log(err);
    }
  });
}

let spoonacularDataToSend = {
  "diet": null,
  "intolerances": null
}

//GET request to Spoonacular's API with label from Google to get a list of up to 10 recipes containing the item from the image and other nutrition info.
getRecipes(imageTitle) {
  document.getElementById("recipe_download_text").className = "text-center";
  var spoonacularURL = "https://api.spoonacular.com/recipes/complexSearch?query=" + imageTitle + "&apiKey=5d83fe3f2cf14616a6ea74137c2be564&addRecipeNutrition=true"
  $.ajax({
    method: "GET",
    url: spoonacularURL,
    data: spoonacularDataToSend,
    headers: {
      "Content-Type": "application/json"
    },
    success: function (data) {
      recipeOnPage(data);
    },
    error: function (err) {
      console.log(err);
    }
  })
}

}
