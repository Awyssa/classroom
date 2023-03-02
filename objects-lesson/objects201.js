class Person 
{
	constructor(name, age, eyeColor) 
	{
		this.name = name;
		this.age = age;
		this.eyeColor = eyeColor;
	}

	sayHello() 
	{
		const greeting = "Hello, ";

		const intro = "my name is ";
	
		const myName = this.name;
	
		console.log(greeting + intro + myName);
	}
}

const michael = new Person("Michael", 29, "brown");
const shayan = new Person("Shayan", 400, "brown");
const vitalina = new Person("Vitalina", 20, "blue");

console.log("Michael ===", michael);
console.log("Shayan ===", shayan);
console.log("Vitalina ===", vitalina);

