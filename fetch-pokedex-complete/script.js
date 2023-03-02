// Create init function to import JS only when the DOM window has loaded
function init() {
	// Set the DOM elements to variables
	const searchInput = document.querySelector(".search-input");
	const searchButton = document.querySelector(".search-button");
	const errorMsg = document.querySelector(".error-msg");
	const loadingEle = document.querySelector(".loading");
	const navHeader = document.querySelector(".nav-header");

	const pokemonId = document.querySelector(".pokemon-id");
	const pokemonName = document.querySelector(".pokemon-name");
	const pokemonHeight = document.querySelector(".pokemon-height");
	const pokemonWeight = document.querySelector(".pokemon-weight");
	const pokemonImage = document.querySelector(".pokemon-image");
	// const pokemonMoves = document.querySelector(".pokemon-moves");
	
	// Add the search and loading state
	let searchValue = undefined;
	let loading = false;
	
	// Create handler functions 
	const handleOnChange = (value) => searchValue = value;
	const handleOnClick = () => fetchPokemon(searchValue);

	// Append handler functions to DOM element events
	searchInput.addEventListener("keyup", (e) => event.keyCode === 13 ? handleOnClick() : handleOnChange(e.target.value));
	searchButton.addEventListener("click", handleOnClick);
	navHeader.addEventListener("click", () => location.reload());

	// Create fetch function to get Pokemon data
	const fetchPokemon = async(pokemonParam) =>
	{
		try
		{
			errorMsg.innerHTML = "";

			if(!pokemonParam)
				throw new Error("Please enter a Pokemon to search!");

			if(loading)
			{
				console.log("Loading...");
				return;
			}

			loading = true;
			loadingEle.innerHTML = "loading...";
			
			const formatPokemonParam = pokemonParam.trim().toLocaleLowerCase();
			
			const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${formatPokemonParam}`);

			if(res.status === 404)
				throw new Error("Cannot find this Pokemon!");
	
			const pokemonData = await res.json();

			const formattedPokemonName = pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);
	
			pokemonId.innerHTML = pokemonData.id;
			pokemonName.innerHTML = formattedPokemonName;
			pokemonHeight.innerHTML = pokemonData.height;
			pokemonWeight.innerHTML = pokemonData.weight;
			pokemonImage.src = pokemonData.sprites?.front_default;

			loading = false;
			loadingEle.innerHTML = "";
		}
		catch(error)
		{
			loading = false;
			loadingEle.innerHTML = "";
			console.log("Error getting Pokemon", error);
			errorMsg.innerHTML = error;
		}
	};
}

window.addEventListener("DOMContentLoaded", init);



