const recipeRoot = "https://api.edamam.com/api/recipes/v2?type=public&q=";
const APIid = "10153ee1";
const APIKey = "027bd5bbabe6fabd88736c41b30ffe19";

console.log("test");

const queryURL = recipeRoot + "tea" + "&app_id=" + APIid + "&app_key=" + APIKey + "&type=public";



function foodClick() {
    fetch(queryURL)
    .then (function(response) {
    return response.json();
    })
    .then(function(data) {
        console.log(data);

        const results = data;

        console.log(results.hits[1]);

        const foodName = results.hits[1].recipe.label;
        const foodImage = results.hits[1].recipe.images.THUMBNAIL.url;

        console.log(foodName, foodImage);

//    const p = $("<p>");
//    p.text(foodName);

        })
    }


$("#button").on("click", function(event) {
    event.preventDefault();

    foodClick();

});