import os, re, sys

base_dir = 'src'
# Build file index
file_index = {}
all_files = {}
for root, dirs, filenames in os.walk(base_dir):
    rel_dir = os.path.relpath(root, base_dir)
    if rel_dir == '.':
        rel_dir = '.'
    else:
        rel_dir = rel_dir.replace('\\', '/')
    for f in filenames:
        basename = f
        basename_no_ext = os.path.splitext(basename)[0]
        norm = basename_no_ext.lower().replace('-', '').replace('_', '')
        file_index.setdefault(rel_dir, {}).setdefault(norm, basename_no_ext)
        all_files.setdefault(rel_dir, {})[basename_no_ext] = basename

def get_target_dir(file_path, import_path):
    file_dir_abs = os.path.dirname(os.path.abspath(file_path))
    target_path = os.path.abspath(os.path.join(file_dir_abs, import_path))
    target_dir_abs = os.path.dirname(target_path)
    target_dir_rel = os.path.relpath(target_dir_abs, os.path.abspath(base_dir))
    if target_dir_rel.startswith('..'):
        # import points outside src? skip
        return None
    if target_dir_rel == '.':
        target_dir_rel = '.'
    else:
        target_dir_rel = target_dir_rel.replace('\\', '/')
    return target_dir_rel, target_dir_abs

changed = False
for root, dirs, filenames in os.walk(base_dir):
    for f in filenames:
        if not f.endswith(('.ts', '.tsx', '.jsx', '.js')):
            continue
        path = os.path.join(root, f)
        with open(path, 'r', encoding='utf-8', errors='ignore') as file:
            content = file.read()
        new_content = content
        # Find all from imports
        for m in re.finditer(r"from ['\"](.+?)['\"]", content):
            import_path = m.group(1)
            if import_path.startswith('.'):
                result = get_target_dir(path, import_path)
                if result is None:
                    continue
                target_dir_rel, target_dir_abs = result
                basename = os.path.basename(import_path)
                basename_no_ext = os.path.splitext(basename)[0]
                norm = basename_no_ext.lower().replace('-', '').replace('_', '')
                # Check if exact basename (with any ext) exists in target dir
                exact_exists = False
                exact_file_basename = basename_no_ext
                # Try stripped basename with file extensions
                stripped_file = None
                for ext in ['.jsx', '.js', '.tsx', '.ts', '.json', '.css']:
                    if basename_no_ext + ext == basename:
                        stripped_file = basename_no_ext
                        # Check if file exists
                        if os.path.isfile(os.path.join(target_dir_abs, basename)):
                            exact_exists = True
                        else:
                            # Try other files with same basename but different ext
                            for ext2 in ['.jsx', '.js', '.tsx', '.ts', '.json', '.css']:
                                if os.path.isfile(os.path.join(target_dir_abs, basename_no_ext + ext2)):
                                    exact_exists = True
                                    stripped_file = basename_no_ext
                                    break
                if exact_exists:
                    continue
                # Try normalized match
                target_dir_map = file_index.get(target_dir_rel, {})
                if norm in target_dir_map:
                    actual_basename = target_dir_map[norm]
                    # Replace basename in import_path
                    # We want to keep the original extension from import_path if present,
                    # otherwise use the file's extension.
                    original_ext = ''
                    for ext in ['.jsx', '.js', '.tsx', '.ts', '.json', '.css']:
                        if basename.endswith(ext):
                            original_ext = ext
                            break
                    new_basename = actual_basename
                    if original_ext == '':
                        # Find extension of actual file
                        for ext in ['.jsx', '.js', '.tsx', '.ts', '.json', '.css']:
                            if os.path.isfile(os.path.join(target_dir_abs, actual_basename + ext)):
                                original_ext = ext
                                break
                        if original_ext == '':
                            original_ext = '.ts'
                    new_basename_with_ext = new_basename + original_ext
                    # Replace only the basename part of import_path
                    # Split path into parts
                    path_parts = import_path.split('/')
                    path_parts[-1] = new_basename_with_ext
                    new_import_path = '/'.join(path_parts)
                    if new_import_path != import_path:
                        new_content = new_content.replace(import_path, new_import_path)
                        changed = True
                else:
                    # Could be a missing import; skip for now
                    pass
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print('Fixed', os.path.relpath(path, base_dir))

print('Done')
