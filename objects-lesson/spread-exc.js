// Can you use the spread operator to merge these two arrays?
const oneToThree = [1,2,3];

const fourToSix = [4,5,6];

// Use must use the spread operator (...) below.
const oneToSix = null;

// DO NOT EDIT THE TEST CASE BELOW
console.log(oneToSix === [1,2,3,4,5,6], " Should be true!");
// ----------------------------------------------------------

// Can you use the spread operator to keep the evenNumbersToTen unchanged, but have evenNumbersToZero be the reverse on evenNumbersToTen? It should console log [10,8,6,4,2]. You should use the reverse() function

const evenNumbersToTen = [2,4,6,8,10];

// Use must use the spread operator (...) below.
const tenToTwo = null;


// DO NOT EDIT THE TEST CASE BELOW
const test001 = evenNumbersToTen === [2,4,6,8,10];
console.log(test001, " Should be true!");
const test002 = tenToTwo === [10,8,6,4,2];
console.log(test002, " Should be true!");
// ----------------------------------------------------------

// Can you use the spread operator to update the "name" key to be your name, but also take all the properties of the orignal person?

const person = {
	name: null,
	type: "admin",
	person: "human",
	language: "javascript"
};

const yourself = {};


// DO NOT EDIT THE TEST CASE BELOW
console.log(
	yourself.type === "admin" &&
	yourself.person === "human" &&
	yourself.language === "javascript",
	" Should be true!"
);
// ----------------------------------------------------------