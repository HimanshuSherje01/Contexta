const response = await fetch(
    "http://localhost:11434/api/generate",
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            model: "qwen2.5:3b",
            prompt: "What is a process in an operating system?",
            stream: false
        })
    }
);


const data = await response.json();


console.log("\n========== OLLAMA RESPONSE ==========\n");

console.log(data.response);