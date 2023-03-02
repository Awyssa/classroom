import { useState } from "react";

export const Sandbox = () =>
{
	const [counter, setCounter] = useState(0);

	const incrementCount = () => 
	{
		setCounter(counter + 1)
		console.log("counter", counter);
	}

	const decrementCount = () =>
	{
		setCounter(counter - 1)
		console.log("counter", counter);
	}

	return (
		<div style={{ textAlign: "center", paddingTop: "20px", fontSize: "42px"}}>
			<div>
			<button style={{ padding: "20px", fontSize:"32px" }} onClick={incrementCount}>Increment</button>
			<button style={{ padding: "20px", fontSize:"32px" }} onClick={decrementCount}>Decrement</button>				
			</div>
			<div style={{ paddingTop: "20px" }}>
			{counter}
			</div>
		</div>
	);
};