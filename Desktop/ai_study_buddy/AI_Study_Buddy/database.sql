-- Users table
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    has_paid boolean DEFAULT false,
    created_at timestamp DEFAULT now()
);

-- Flashcards table
CREATE TABLE flashcards (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    question text NOT NULL,
    answer text NOT NULL,
    is_premium boolean DEFAULT false,
    created_at timestamp DEFAULT now()
);
