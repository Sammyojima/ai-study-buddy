import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://nogrmktakvioiaspnqse.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vZ3Jta3Rha3Zpb2lhc3BucXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NzcwMDEsImV4cCI6MjA3MjI1MzAwMX0.qhYVAg4FZq4sQU4DrOOIuxTfzkqxJn9XU9zLXD7Mk5A";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let userEmail = null;

window.onload = function() {
    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");
    const generateBtn = document.getElementById("generateBtn");
    const payButton = document.getElementById("payButton");
    const flashcardsContainer = document.getElementById("flashcards");

    // Password hashing
    async function hashPassword(password) {
        const msgUint8 = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
    }

    // Register
    registerBtn.addEventListener("click", async () => {
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;
        if(!email || !password) return alert("Fill all fields");

        const hashed = await hashPassword(password);

        const { error } = await supabase.from('users').insert([{ email, password: hashed, has_paid: false }]);
        if(error) return alert(error.message);

        alert("Registered successfully! You can now login.");
    });

    // Login
    loginBtn.addEventListener("click", async () => {
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        if(!email || !password) return alert("Fill all fields");

        const hashed = await hashPassword(password);

        const { data: user, error } = await supabase.from('users')
            .select('*')
            .eq('email', email)
            .eq('password', hashed)
            .single();

        if(error || !user) return alert("Invalid email or password");

        alert("Login successful!");
        userEmail = email;

        // Hide auth, show notes section
        document.querySelector(".auth-section").style.display = "none";
        document.querySelector(".notes-section").style.display = "block";
    });

    // Generate flashcards
    generateBtn.addEventListener("click", async () => {
        const notes = document.getElementById("notes").value;
        if(!notes) return alert("Paste your notes!");

        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ notes })
        });

        const flashcards = await response.json();

        const { data: user } = await supabase.from('users').select('*').eq('email', userEmail).single();

        const displayCards = flashcards.map(card => {
            if(!user.has_paid && card.is_premium) {
                card.question = "🔒 Premium content. Unlock to access.";
                card.answer = "Pay to view answer.";
            }
            return card;
        });

        renderFlashcards(displayCards);
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

    // Render flashcards
    function renderFlashcards(flashcards) {
        flashcardsContainer.innerHTML = "";
        flashcards.forEach(card => {
            const flashcard = document.createElement("div");
            flashcard.className = "flashcard";

            flashcard.innerHTML = `
                <div class="flashcard-inner">
                    <div class="flashcard-front">${card.question}</div>
                    <div class="flashcard-back">${card.answer}</div>
                </div>
            `;

            if(card.is_premium) {
                const lockIcon = document.createElement("span");
                lockIcon.className = "premium-lock";
                lockIcon.textContent = "🔒";
                flashcard.appendChild(lockIcon);
            }

            // Flip card
            flashcard.querySelector(".flashcard-inner").addEventListener("click", function() {
                this.classList.toggle("flipped");
            });

            flashcardsContainer.appendChild(flashcard);
        });
    }
};
