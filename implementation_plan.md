# Implementation Plan: Fine-Tuning a Custom LLaMA Model for Resume Tracking

You want to fine-tune a model to completely replace the Gemini API and make it an absolute expert at your specific resume tracking logic (returning exact JSON with predefined commands). 

Here is the strategy regarding your dataset, the model you should use, and the exact steps to achieve this.

## 1. The Dataset: Should you use the Snehaan Bhawal Kaggle dataset?

**Yes, but with a major catch.** 
The Snehaan Bhawal dataset is excellent because it gives you real-world resumes. However, fine-tuning an instruction-following model requires **Prompt-Response pairs**. 
- The dataset only gives you the **Input** (the raw resume text).
- It does **not** give you the **Output** (the specific JSON tracking format you want).

**The Solution:** We will use the Kaggle CSV to create a custom dataset. We will write a script that takes ~300 random resumes from that CSV, sends them to Gemini (one last time) with your predefined commands to generate the "perfect" JSON outputs. We will save this as a `.jsonl` file. This becomes your fine-tuning dataset!

## 2. Model Selection: Which model should be fine-tuned?

You should fine-tune **Llama-3-8B-Instruct** (or **Llama-3.2-3B-Instruct** if your hardware is limited). 
- **Why?** Llama 3 is incredibly smart, handles structured JSON generation exceptionally well, and has great community support for fine-tuning. 
- **Alternative:** **Mistral-7B-Instruct** is also a great choice for data extraction tasks.

## 3. The Exact Steps to Fine-Tune

### Step 1: Data Preparation (The most important step)
1. Read the `.csv` file you downloaded.
2. Select 300 to 500 random resumes.
3. Format each into an instruction format:
   - **Instruction:** "You are a Resume Tracker AI. Extract the candidate's details based on these predefined commands: [Your Commands]. Return strictly as JSON."
   - **Input:** `[Resume Text from CSV]`
   - **Output:** `[The Perfect JSON Response]`
4. Save this into a `training_data.jsonl` file. We will write a Python script to automate this.

### Step 2: Environment Setup (Google Colab)
Fine-tuning requires a powerful NVIDIA GPU (at least 16GB VRAM for an 8B model). Most laptops cannot do this.
1. We will use **Google Colab** (the free tier often provides a T4 GPU which is enough for "QLoRA" fine-tuning).
2. We will use a library called **Unsloth**, which makes fine-tuning Llama models 2x faster and uses less memory.

### Step 3: Training the Model (QLoRA)
1. Upload your `training_data.jsonl` to Google Colab.
2. We will use a pre-written Unsloth Python notebook.
3. The script will load the base model (`Llama-3-8B-Instruct`), feed it your 500 examples, and train it for about 1-2 hours. This process teaches the model your exact JSON format and "predefined commands" logic.

### Step 4: Export to GGUF Format
Once training finishes, the model exists as "LoRA weights". We need it in a format that Ollama can run on your local computer.
1. The Unsloth notebook has a built-in command to export the merged model to a `.gguf` file (e.g., `resume-tracker-model-8b.gguf`).
2. You will download this file to your computer.

### Step 5: Local Deployment with Ollama
1. On your PC, create a file named `Modelfile`.
2. Inside it, write: `FROM ./resume-tracker-model-8b.gguf` and set your system prompt.
3. Run `ollama create my-resume-ai -f Modelfile`.
4. Update your Node.js backend to point to `http://localhost:11434` instead of the Gemini API.

---

## User Review Required

> [!IMPORTANT]
> **To proceed with Step 1 (Data Preparation), I need your input:**
> 1. What are the **exact "predefined commands"** and the **exact JSON format** you want the model to output? (e.g., Do you want it to return `{"Name": "", "Skills": [], "MatchPercentage": 0, "MissingKeywords": []}`?) Please provide the JSON structure you need.
> 2. Would you like me to create the Python script that will read your CSV from the desktop and generate the `training_data.jsonl` file?
