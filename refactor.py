import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    replacements = {
        r'rounded-\[32px\]': 'rounded-3xl',
        r'rounded-\[28px\]': 'rounded-3xl',
        r'rounded-\[24px\]': 'rounded-2xl',
        r'rounded-\[20px\]': 'rounded-2xl',
        r'rounded-\[16px\]': 'rounded-2xl',
        r'rounded-\[14px\]': 'rounded-xl',
        r'rounded-\[12px\]': 'rounded-xl',
        r'rounded-\[10px\]': 'rounded-lg',
        r'rounded-\[8px\]': 'rounded-lg',
        
        # Colors
        r'bg-\[#0F172A\]': 'bg-slate-900',
        r'text-\[#0F172A\]': 'text-slate-900',
        r'bg-\[#22C55E\]': 'bg-green-500',
        r'text-\[#22C55E\]': 'text-green-500',
        r'border-\[#22C55E\]': 'border-green-500',
        r'bg-\[#2563EB\]': 'bg-blue-600',
        r'text-\[#2563EB\]': 'text-blue-600',
        
        # Spacing/Text
        r'text-\[10px\]': 'text-xs',
        r'text-\[13px\]': 'text-sm',
    }

    original = content
    for pattern, repl in replacements.items():
        content = re.sub(pattern, repl, content)

    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    base_dirs = ['client/src/pages', 'client/src/components']
    for base_dir in base_dirs:
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                    process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
