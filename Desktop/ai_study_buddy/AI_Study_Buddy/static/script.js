// ✅ DOM elements
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const payButton = document.getElementById("payButton");
const generateBtn = document.getElementById("generateBtn");
const notesBox = document.getElementById("notes");
const flashcardsDiv = document.getElementById("flashcards");
const wordCountDisplay = document.getElementById("wordCount");

// ✅ Live Word Counter
notesBox.addEventListener("input", () => {
  const words = notesBox.value.trim().split(/\s+/).filter(Boolean);
  const count = words.length;

  if (!hasPaid) {
    wordCountDisplay.innerText = `Word count: ${count} / 100 (Free plan)`;
    wordCountDisplay.style.color = count > 100 ? "red" : "black";
  } else {
    wordCountDisplay.innerText = `Word count: ${count} (Premium: Unlimited)`;
    wordCountDisplay.style.color = "green";
  }
});


let userEmail = null;
let hasPaid = false;

// ✅ Login (check premium status from Supabase)
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return alert("Login failed: " + error.message);

  userEmail = email;

  // Check premium status from users table
  let { data: user } = await supabase
    .from("users")
    .select("has_paid")
    .eq("email", userEmail)
    .single();

  hasPaid = user?.has_paid || false;

  alert("Login successful as " + email + (hasPaid ? " (Premium)" : " (Free)"));
  document.querySelector(".notes-section").style.display = "block";

  // ✅ Disable Pay button if already premium
  if (hasPaid) {
    payButton.disabled = true;
    payButton.innerText = "Premium Active";
  }
});

// ✅ Generate Flashcards with Word Limit
generateBtn.addEventListener("click", () => {
  const notes = notesBox.value.trim();
  const wordCount = notes.split(/\s+/).length;

  if (!hasPaid && wordCount > 100) {
    alert("⚠️ Free plan allows only 100 words. Please subscribe to unlock premium.");
    return;
  }

  // 🚀 Flashcard generation logic here
  flashcardsDiv.innerHTML = `<p>Generated ${wordCount} words into flashcards! ${
    hasPaid ? "✅ Premium mode" : "🎓 Free mode"
  }</p>`;
});

// Paystack integration
payButton.addEventListener("click", async () => {
    if(!userEmail) return alert("Login first!");

    let handler = PaystackPop.setup({
        key: 'pk_test_347875258858141ad847866866f9514dfe952e4b',
        email: userEmail,
        amount: 5000, // NGN 50
        currency: "NGN",
        ref: '' + Math.floor(Math.random() * 1000000000 + 1),
        callback: async function(response) {
            alert("Payment successful! Reference: " + response.reference);

            await supabase.from('users').update({ has_paid: true }).eq('email', userEmail);

            alert("Premium flashcards unlocked! Regenerating...");
            generateBtn.click(); // regenerate with premium unlocked
        },
        onClose: function() {
            alert("Payment window closed.");
        }
    });

    handler.openIframe();
});