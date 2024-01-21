const recipeRoot = "https://api.edamam.com/api/recipes/v2?type=public&q=";
const APIid = "10153ee1";
const APIKey = "027bd5bbabe6fabd88736c41b30ffe19";

console.log("test");

const input = $("#input").val().trim();
console.log(input);

//const queryURL = recipeRoot + input + "&app_id=" + APIid + "&app_key=" + APIKey + "&type=public";

$("#button").on("click", function(event) {
    event.preventDefault;
//    function foodClick() {
    const input = $("#input").val().trim();
    console.log(input)

    const queryURL = recipeRoot + input + "&app_id=" + APIid + "&app_key=" + APIKey + "&type=public";
    const emptyURL = recipeRoot + "food" + "&app_id=" + APIid + "&app_key=" + APIKey + "&type=public";

    if (input == "") {
        alert("Don't forget to input a sample food! Here's a yummy dish to hold you over!");
        

        fetch(emptyURL)
            .then (function(response) {
            return response.json();
            })
            .then(function(data) {
            console.log(data);

            const results = data;
//            const number = randInt()

            console.log(results.hits[1]);

            const foodName = results.hits[1].recipe.label;
            const foodImage = results.hits[1].recipe.images.THUMBNAIL.url;

            console.log(foodName, foodImage);

                const name = $("<p>").text(foodName);
                const image = $("<img>").attr("src", foodImage);

                $("#emptySpace").prepend(image, name);
        })
    }
    
    else {

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

                const name = $("<p>").text(foodName);
                const image = $("<img>").attr("src", foodImage);

                $("#emptySpace").prepend(image, name);
        })
    }


})


//window.onload = function() {
//    console.log(input);
    
//    document.getElementById("button").onclick = function run() {
//    foodClick();
    


//    };
//}





//$("#button").on("click", function(event) {
//    event.preventDefault();
//});

//    const p = $("<p>");
//    p.text(foodName);