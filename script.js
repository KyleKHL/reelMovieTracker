import firebaseInfo from "./firebase.js";

import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
// initialize db content
const database = getDatabase(firebaseInfo);
// create reference to db content
const dbRef = ref(database);

// JS begins for MVP --> track them movies

// create variables for what elements we will be using
const formElement = document.querySelector('form');
const ulElement = document.querySelector('.listOfMovies')

// add event listener to our form
const submitHandler = function(event){
    // prevent form from refreshing
    event.preventDefault();

    // create variable userInput
    const userInput = document.querySelector('#inputMovieTitle');
    // create a variable for the value of userInput
    const movieInput = userInput.value.trim();
    // create variable for rating
    const ratingSelect = document.querySelector('#rating-select');
    // create value for rating
    const ratingValue = ratingSelect.value;

    // ADDED RATING to be sent to firebase w/ movie title
    if (movieInput) {
        const movieObj = {
            movieTitle: movieInput,
            rating: ratingValue
        };

        push(dbRef, movieObj)

        // return value of userInput to empty string
        userInput.value = '';
        // return value or selected rating back to default: Choose a rating!
        ratingSelect.value = '';
    }

}

formElement.addEventListener('submit', submitHandler)
// end of form event listner

// start of onValue module to track userInputs in REAL TIME
onValue(dbRef, (data) => {

    // make a variable that contains data, using .val() to take a snapshot of the data
    const movieData = data.val();
    
    // make an empty array which will add each movie title user enters
    const movieArray = [];

    // make a ratings array in order to SORT through the the movie list by RATINGS
    const ratingsArray = [];

    for (let prop in movieData){
        // create new li element
        const liElement = document.createElement('li');
        // create variable to contain each movieObj
        const propObj = prop;

        // assign the id of each element with it's prop value -> the auto gen key
        liElement.setAttribute("id", propObj);

        // DELETE BUTTON
        // create new delete button
        const deleteButton = document.createElement('button');
        // add the font awesome 'x' icon
        deleteButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        // give delete button class to give it a style
        deleteButton.classList.add("deleteButton");

        // create textnode with movie title contained in a variable
        const movieTitleTextNode = document.createTextNode(`${movieData[prop].movieTitle} | Rating: `);
        // create textnode with rating contained in a variable
        const ratingTextNode = document.createTextNode(movieData[prop].rating);    
        
        // append the text nodes and delete button to the li
        liElement.append(movieTitleTextNode, ratingTextNode, deleteButton)

        // make value of each li equal to the rating
        liElement.value = movieData[prop].rating;
        
        // push the li element into the ratings array
        ratingsArray.push(liElement);

        // Sort through the array based on the value of each li using a sort method
        ratingsArray.sort(function (a, b){
            return b.value - a.value;
        })

    }
    // Use forEach Loop to loop through the array so that we can create a new variable that contains the liElement.outerHTML value
    ratingsArray.forEach(liElement => {
        const newLiElement = liElement.outerHTML;
        // pushed into a new li element into movies array
        movieArray.push(newLiElement)
    });
    // set the innerHTML of ul element to be the movieArray
    ulElement.innerHTML = movieArray.join('');
    
})



// Use Event propagation to attach event listener to ul element in order to then use conditional statement to target the button of each li element
ulElement.addEventListener('click', (event) => {

    // function which contains the remove() module 
    const removeFunc = (removeLi) => {
        const liRef = ref(database, `/${removeLi}`)
        remove(liRef);
    }
    // use conditional statement to target when the user clicks on either Icon or button. If true, call removeFunc() which will delete the liElement
    if (event.target.tagName === 'I') {
        // create variable which contains the path to liElement's id (In this case its the grandparent Element)
        const selectedLiId = event.target.parentElement.parentElement.id;
            removeFunc(selectedLiId)

        } else if (event.target.tagName === 'BUTTON') {
        // create variable which contains the path to liElement's id (In this case its the parent Element)
        const selectedLiId = event.target.parentElement.id;
        removeFunc(selectedLiId)
    }

});
