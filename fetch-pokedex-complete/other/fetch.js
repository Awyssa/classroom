const fetchData = async() =>
{
	const res = await fetch("https://pokeapi.co/api/v2/pokemon/pikachu");
	const data = await res.json();
	console.log("data ===", data.name);
	return data;
};

fetchData();

function fetchDataThen()
{
	fetch("https://pokeapi.co/api/v2/pokemon/pikachu")
	.then((res) => {
		return res.json();
	})
	.then((data) => {
		console.log("data ===", data.name);
		return data;
	})
	.catch((error) =>
	{
		console.log("we got an error :(");
		return error;
	});
}

const pokemonData = fetchDataThen();

console.log(pokemonData);