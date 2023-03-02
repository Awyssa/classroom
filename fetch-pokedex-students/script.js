/* eslint-disable no-unused-vars */
// Create init function to import JS only when the DOM window has loaded
function init() {
	// Set the DOM elements to variables
	const searchInput = document.querySelector(".search-input");
	const searchButton = document.querySelector(".search-button");
	const errorMsg = document.querySelector(".error-msg");
	const loadingEle = document.querySelector(".loading");
	const navHeader = document.querySelector(".nav-header");
	const getPokemonButton = document.querySelector(".get-pokemon-button");

	const pokemonId = document.querySelector(".pokemon-id");
	const pokemonName = document.querySelector(".pokemon-name");
	const pokemonHeight = document.querySelector(".pokemon-height");
	const pokemonWeight = document.querySelector(".pokemon-weight");
	const pokemonImage = document.querySelector(".pokemon-image");

	// Add the search and loading state
	let searchValue = "";
	
	// Create handler functions 
	// const handleOnChange = (value) => searchValue = value;
	// const handleOnClick = () => fetchPokemon(searchValue);

	// Append handler functions to DOM element events
	navHeader.addEventListener("click", () => location.reload());
	getPokemonButton.addEventListener("click", () => fetchPokemon());

	// searchInput.addEventListener("keyup", (e) => event.keyCode === 13 ? handleOnClick() : handleOnChange(e.target.value));
	// searchButton.addEventListener("click", handleOnClick);

	// Create fetch function to get Pokemon data
	// - - - - - - - - - - - - - - - - * * * ADD YOUR CODE HERE * * * - - - - - - - - - - - - - - - -
	const fetchPokemon = async() =>
	{
		const res = await fetch("https://pokeapi.co/api/v2/pokemon/pikachu");
		const data = await res.json();

		console.log("data", data);

		pokemonId.innerHTML = data.id;
		pokemonName.innerHTML = data.name;
		pokemonHeight.innerHTML = data.height;
		pokemonWeight.innerHTML = data.weight;

		pokemonImage.src = data.sprites.versions["generation-iii"].emerald.front_default;

	};
}

window.addEventListener("DOMContentLoaded", init);



