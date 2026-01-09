with open(r'frontend/src/app/pannels/employer/components/jobs/emp-post-job.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i in range(2155, min(2165, len(lines))):
        print(f"{i+1:4d}: {lines[i]}", end='')
