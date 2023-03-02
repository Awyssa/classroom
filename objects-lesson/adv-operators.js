// Can you convert this into a Conditional (ternary) operator (? :)
const trueText = "I am true!";
const falseText = null;

if(trueText)
	console.log(trueText);
else
	console.log(falseText);


// Can you use and convert the below code to use the Optional Chaining Operator (?.)
const data = [];

if(!data && !data.length > 0)
	console.log("no data :(");
else
	console.log("we have data!");


// Can you improve this code?
const number10 = 10;

const isBiggerThanTen = number10 > 10 ? true : false;

console.log("isBiggerThanTen ===", isBiggerThanTen);

// Can you convert this into a Nullish Coalescing Operator (??)

let name = null;
let text = "missing name";
let result = (text && name === null) ? text : null;

console.log("result ===", result);

