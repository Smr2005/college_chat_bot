import requests
GEMINI_API_KEY = "Your API key"  # 🔐 Replace with your Gemini API key
GEMINI_API_URL = "your API URL"
college_facts = """
Enter all facts about the college as per your knowledge
"""
def ask_gemini(question):
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY
    }
    prompt = (
        f"You are an FAQ chatbot for Aditya College of Engineering, Madanapalle.\n"
        f"Use only the facts below to answer:\n{college_facts}\n\n"
        f"Q: {question}\nA:"
    )
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        return f"❌ Error: {e}"
if __name__ == "__main__":
    print("🤖 Aditya College FAQ Chatbot (Gemini-powered)")
    print("Type 'exit' to quit.\n")
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Bot: 👋 Goodbye!")
            break
        reply = ask_gemini(user_input)
        print("Bot:", reply, "\n")
