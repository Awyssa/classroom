function init() {
	const counter = document.querySelector(".counter");
	const increment = document.querySelector(".increment");
	const decrement = document.querySelector(".decrement");
	const reset = document.querySelector(".reset");
	const setCountInput = document.querySelector(".set-count-input");
	const setCountButton = document.querySelector(".set-count-button");
	const errorMessageDiv = document.querySelector(".error-message");

	errorMessageDiv.style.color = "red"

	let count = 0;
	let countState = ""
	let errorMessage = ""

	const setErrorMessage = (msg) =>
	{
		errorMessage = msg
		errorMessageDiv.innerHTML = errorMessage
	}

	const incrementCounter = () => 
	{
		count ++;
		counter.innerHTML = count;
	};

	const decrementCounter = () => 
	{
		count --;
		counter.innerHTML = count;
	};

	const resetCounter = () =>
	{
		count = 0
		counter.innerHTML = count;
	}

	const handleOnChange = (e) => 
	{
		countState = e.target.value
	}

	const handleOnClick = () => 
	{
		setErrorMessage("")
		
		const isNumber = parseFloat(countState)

		if(!isNumber && isNumber !== 0)
		{
			setErrorMessage("Please make sure to enter a number")
			return
		}

		count = countState
		counter.innerHTML = count
	}

	console.log("count", count);

	increment.addEventListener("click", incrementCounter);
	decrement.addEventListener("click", decrementCounter);
	reset.addEventListener("click", resetCounter);
	setCountInput.addEventListener("keyup", handleOnChange);
	setCountButton.addEventListener("click", handleOnClick);
}

window.addEventListener("DOMContentLoaded", init);