file_path = r"c:\Users\Aryan\Desktop\Jobz_2025\Newss\frontend\src\app\pannels\employer\components\jobs\emp-post-job.jsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i in range(2130, min(2200, len(lines))):
        print(f"{i+1:4d}: {lines[i]}", end='')
