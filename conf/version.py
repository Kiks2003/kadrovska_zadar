import re
import subprocess


def get_git_version():
    process = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], stdout=subprocess.PIPE)
    git_version = process.stdout.strip().decode('ascii')
    return git_version


def get_frontend_version(index_page_text):
    versions = re.findall(r'src="/static/(.+?)\.js', index_page_text)

    return ';'.join(versions)
