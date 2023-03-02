
function person(name, age, eyeColor) 
{
	const object = Object.create(personStore);

	object.name = name;
	object.age = age;
	object.eyeColor = eyeColor;

	object.sayHello = function()
	{
		console.log("Hello, my name is ", object.name);
	};

	return object;
}

const michael = person("Michael", 29, "brown");

console.log("Michael ===", michael);

michael.sayHello();