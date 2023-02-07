try {
	$('.tilt').tilt();

	let body = document.querySelector("body");
	let wallet = document.querySelectorAll(".wallet");
	let right = document.querySelector("aside.right")
	let close = document.querySelector("aside.right .close")

	wallet.forEach(function(element) {
		element.addEventListener("click", function () {
			right.classList.add("active");
			body.classList.add("noscroll");
		});
	});

	close.addEventListener("click", function () {
		right.classList.remove("active");
		body.classList.remove("noscroll");
	});
} catch (error) {
	console.warn(error);
}