import json
with open(r'frontend/package.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    if 'scripts' in data:
        for key, value in data['scripts'].items():
            print(f"{key}: {value}")
