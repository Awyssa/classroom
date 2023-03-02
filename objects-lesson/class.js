/* eslint-disable no-unused-vars */

function person(name, age, eyeColor) {
	const object = {};
	object.name = name;
	object.age = age;
	object.eyeColor = eyeColor;

	console.log("New Person instance", object);

	return object;
}

const michael = person("Michael", 29, "brown");
const shayan = person("Shayan", 400, "brown");
const vitalina = person("Vitalina", 20, "blue");


function dog(name, age, furColor) {
	const object = {};
	object.name = name;
	object.age = age;
	object.furColor = furColor;

	console.log("New Dog instance", object);

	return object;
}

const jazz = dog("Jazz", 4, "black");
const odie = dog("Odie", 50, "tan");
const lassie = dog("Lassie", 12, "white");

function cat(name, age, tailLength) {
	const object = {};
	object.name = name;
	object.age = age;
	object.tailLength = tailLength;

	console.log("New Cat instance", object);

	return object;
}

const garfield = cat("Garfield", 90, "short");
const tiger = cat("Tiger", 8, "long");
const tom = cat("Tom", 24, "gray");


// function car(car, make, model, year) {
//   car.make = make;
//   car.model = model;
//   car.year = year;

// 	return car;
// }

// const ford = car({}, "Ford", "Mondeo", 1993);
// const tesla = car({}, "Tesla", "Roadster", 2020);
// const toyota = car({}, "toyota", "Land Cruiser", 2007);

// console.log("ford ===", ford);
// console.log("tesla ===", tesla);
// console.log("toyota ===", toyota);


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Now we get to the most interesting part...
// This is argued as one of the most complicated parts of javascipt
// I disagree
// I think this is actually one of the most MISUNDERSTOOD parts of javascript

// I am okay dev, but I was taught by an exceptionally great dev
// And his fav language, and my first was, can anyone guess? -------- ruby

// The reason I bring it up is because Ruby was created by a gentleman called matz, and matz liked python, but he didn't love it becuase it wasn't good at what he loved. What matz loved was something called Object-oriented programming

// ? Has anyone heard of that before?

// OOP is a way of organizing and structuring software programs that emphasizes the creation of reusable code and the use of abstraction, encapsulation, inheritance, and polymorphism.

// Looked for but couldn't find one. So he decided to make One. And he called it ruby.

// Now you have all probably realised at this point, we have been talking about objects A LOT. And we this isn't without reason. Objects are great. In fact Object are so good that in Javascript, everything is an object.

// Im not going to go into this. But I promise you all, at the end of the course we can have this discussion. But just trust me, almost everything we use is actually an object.

// function person(person, name, age, eyeColor) {
// 	person.name = name;
// 	person.age = age;
// 	person.eyeColor = eyeColor;
// }

// const michael = person(michael, "Michael", 29, "brown");
// const shayan = person(shayan, "Shayan", 9000, "brown");
// const natalia = person(natalia, "natalia", 21, "blue");

// console.log("michael ===", michael);
// console.log("shayan ===", shayan);
// console.log("natalia ===", natalia);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// What I can do here is instanciave the instance of three differnt objects
// They are all empty object, but they are different
// ! So, when we try to abstract the object, why can't we just use the const as the object itself?

// function person() {
// 	const object = {};

// 	return object;
// }

// const michael = person();
// const shayan = person();
// const natalia = person();

// console.log("michael ===", michael);
// console.log("shayan ===", shayan);
// console.log("natalia ===", natalia);


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// function person() {
// 	const object = {};

// 	return object;
// }

// const michael = person();
// const shayan = person();
// const natalia = person();

// console.log("michael ===", michael);
// console.log("shayan ===", shayan);
// console.log("natalia ===", natalia);

// const string = "Hello, World!";

// If i do const string = "hello world", I am always assigning the right hand side to the left hand side. What If I could send the left hand side to the right hand side?

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// If the left hand side is always just an empty object, why cant we pass that, add stuff and just pass it back?

// function person(person, name, age, eyeColor) {
// 	person.name = name;
// 	person.age = age;
// 	person.eyeColor = eyeColor;

// 	return person;
// }

// let michael = {};
// let shayan = {};
// let natalia = {};

// michael = person(michael, "Michael", 29, "brown");
// shayan = person(shayan, "Shayan", 9000, "brown");
// natalia = person(natalia, "natalia", 21, "blue");

// console.log("michael ===", michael);
// console.log("shayan ===", shayan);
// console.log("natalia ===", natalia);


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// function person(person, name, age, eyeColor) {
// 	person.name = name;
// 	person.age = age;
// 	person.eyeColor = eyeColor;

// 	return person;
// }

// let michael = {};
// let shayan = {};
// let natalia = {};

// michael = person(michael, "Michael", 29, "brown");
// shayan = person(shayan, "Shayan", 9000, "brown");
// natalia = person(natalia, "natalia", 21, "blue");

// console.log("michael ===", michael);
// console.log("shayan ===", shayan);
// console.log("natalia ===", natalia);


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// This is the turning point. 
// We still get undefined

// function person(name, age, eyeColor) {
// 	this.name = name;
// 	this.age = age;
// 	this.eyeColor = eyeColor;
// }

// const michael = new person("Michael", 29, "brown");
// const shayan = new person("Shayan", 9000, "brown");
// const natalia = new person("natalia", 21, "blue");

// console.log("michael ===", michael);
// console.log("shayan ===", shayan);
// console.log("natalia ===", natalia);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// This is the turning point. 
// We still get undefined

// function person(name, age, eyeColor) {
// 	this.name = name;
// 	this.age = age;
// 	this.eyeColor = eyeColor;

// 	return this;
// };

// const michael = person("Michael", 29, "brown");
// const shayan = person("Shayan", 9000, "brown");
// const natalia = person("natalia", 21, "blue");

// console.log("michael ===", michael);
// console.log("shayan ===", shayan);
// console.log("natalia ===", natalia);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// This is the turning point. 
// We still get undefined

// function person(name, age, eyeColor) {
// 	this.name = name;
// 	this.age = age;
// 	this.eyeColor = eyeColor;
// };

// const michael = new person("Michael", 29, "brown");
// const shayan = new person("Shayan", 9000, "brown");
// const natalia = new person("natalia", 21, "blue");

// console.log("michael ===", michael);
// console.log("shayan ===", shayan);
// console.log("natalia ===", natalia);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// This is the turning point. 
// We still get undefined

// const person = (name, age, eyeColor) => {
// 	this.name = name;
// 	this.age = age;
// 	this.eyeColor = eyeColor;

// 	return this;
// };

// const michael = person("Michael", 29, "brown");
// const shayan = person("Shayan", 9000, "brown");
// const natalia = person("natalia", 21, "blue");

// console.log("michael ===", michael);
// console.log("shayan ===", shayan);
// console.log("natalia ===", natalia);