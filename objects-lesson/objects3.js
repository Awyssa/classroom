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