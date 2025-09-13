/* ===========================
   Part 2: Functions, Scope, Parameters & Returns
   =========================== */

// Global variable to track how many times animation has been triggered
let animationCount = 0;

// Function with a return value: returns a random color string
function getRandomColor() {
  const colors = ["red", "blue", "green", "purple", "orange"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Function with a parameter: takes a box element and changes its color
function changeBoxColor(boxElement) {
  let newColor = getRandomColor(); // local variable
  boxElement.style.background = newColor;

  // Using global variable to count how many times animations run
  animationCount++;
  console.log(`Animation triggered ${animationCount} times`);
}

/* ===========================
   Part 3: Combining CSS & JS
   =========================== */

const btn = document.getElementById("animateBtn");
const box = document.getElementById("myBox");

// When the button is clicked:
btn.addEventListener("click", () => {
  // Toggle the .animate class to start/stop the bounce animation
  box.classList.toggle("animate");

  // Call our function to change the box color
  changeBoxColor(box);
});
