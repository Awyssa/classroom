

const fetchData = async() =>
{
	try
	{
		const response = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");

		if(response.status === 404)
			throw new Error("Pokemon not found");


		if(response.status === 301)
		throw new Error("Bad request");


		const data = await response.json();

		console.log("data.name", data.name);
	}
	catch (error)
	{
		console.log("error:", error);
	}
};

fetchData();