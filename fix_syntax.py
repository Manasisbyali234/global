with open(r'frontend/src/app/pannels/employer/components/jobs/emp-post-job.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

if lines[2159].rstrip().endswith('*/'):
    lines[2159] = lines[2159].rstrip() + '}\n'

with open(r'frontend/src/app/pannels/employer/components/jobs/emp-post-job.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
    
print('Fixed missing closing brace on line 2160')
