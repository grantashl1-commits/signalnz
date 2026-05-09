import os, sys, glob
from openai import OpenAI

DEEPSEEK_KEY = "sk-f0cd38f0ef5d4ef5befab5aeee87b964"
REPO_DIR = r"C:\GitHub\signalnz"
IGNORE_EXTS = {".png",".jpg",".exe",".dll",".zip",".lock",".log"}
MAX_CHARS = 100000  # well under 128k tokens

client = OpenAI(api_key=DEEPSEEK_KEY, base_url="https://api.deepseek.com/v1")

# Gather all source files
files = []
for root, _, filenames in os.walk(REPO_DIR):
    for fn in filenames:
        ext = os.path.splitext(fn)[1].lower()
        if ext in IGNORE_EXTS:
            continue
        path = os.path.join(root, fn)
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            rel = os.path.relpath(path, REPO_DIR)
            files.append((rel, content))
        except:
            pass

# Build prompt
code_dump = ""
for rel, content in files:
    block = f"### {rel}\n```\n{content}\n```\n\n"
    if len(code_dump) + len(block) > MAX_CHARS:
        code_dump += f"\n\n[Truncated – {len(files)} files total, showing first portion]\n"
        break
    code_dump += block

system_prompt = (
    "You are a senior code auditor. Audit the following codebase for security vulnerabilities, "
    "code quality issues, dependency risks, outdated patterns, and architectural flaws. "
    "Produce a structured markdown report with findings, severity ratings, and concrete recommendations."
)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Audit this codebase:\n\n{code_dump}"}
    ],
    temperature=0.2,
    max_tokens=8000,
)

print(response.choices[0].message.content)