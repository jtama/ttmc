import yaml
import os
import shutil
from jinja2 import Environment, FileSystemLoader
import markdown # Import the markdown library
import subprocess
import glob

def get_modules():
    """Returns a list of all modules from the YAML files."""
    modules = []
    for yaml_file in [f for f in os.listdir('.') if f.endswith('.yaml')]:
        with open(yaml_file, 'r') as file:
            data = yaml.safe_load(file)
            # Convert questions and answers from Markdown to HTML
            processed_questions = []
            for q_a in data['questions']:
                processed_questions.append({
                    'question': markdown.markdown(q_a['question']),
                    'answer': markdown.markdown(q_a['answer'])
                })
            modules.append({
                'name': data['title'],
                'questions': processed_questions, # Use processed questions
                'html_file': yaml_file.replace('.yaml', '.html')
            })
    return modules

def ensure_dist_directory():
    """Ensures the dist directory exists, creates it if not."""
    if not os.path.exists('dist'):
        os.makedirs('dist')
        print("Created 'dist' directory.")

def cp_assets():
    """Copies assets to the dist directory."""
    if os.path.exists('dist/js'):
        shutil.rmtree('dist/js')
    shutil.copytree('js', 'dist/js')
    print(f"js folder copied to dist/ successfully.")

    if os.path.exists('dist/img'):
        shutil.rmtree('dist/img')
    shutil.copytree('img', 'dist/img')
    print(f"img folder copied to dist/ successfully.")

    files_to_copy = ['style.css', 'script.js', 'js/dialog.js']

    for file_name in files_to_copy:
        if os.path.exists(file_name):
            shutil.copy2(file_name, f'dist/{file_name}')
            print(f"{file_name} copied to dist/ successfully.")
        else:
            print(f"Warning: {file_name} not found, skipping.")


def main():
    """Generates the website."""
    # Ensure dist directory exists
    ensure_dist_directory()

    modules = get_modules()
    env = Environment(loader=FileSystemLoader('.'))

    # Generate module pages
    for i, module in enumerate(modules):
        if i == len(modules) - 1:
            next_module_file = 'final-score.html'
        else:
            next_module_file = modules[i + 1]['html_file']

        template = env.get_template('module.html.j2')
        html_content = template.render(module=module, modules=modules, next_module_file=next_module_file)
        with open('dist/' + module['html_file'], 'w') as file:
            file.write(html_content)
        print(f"dist/{module['html_file']} generated successfully.")

    # Generate index page
    template = env.get_template('index.html.j2')
    html_content = template.render(modules=modules)
    with open('dist/index.html', 'w') as file:
        file.write(html_content)
    print("index.html generated successfully.")

    # Generate final score page
    template = env.get_template('final-score.html.j2')
    html_content = template.render()
    with open('dist/final-score.html', 'w') as file:
        file.write(html_content)
    print("final-score.html generated successfully.")

def generate_leaderboard_page():
    """Generates the leaderboard.html page."""
    env = Environment(loader=FileSystemLoader('.'))
    template = env.get_template('leaderboard.html.j2')
    html_content = template.render()
    with open('dist/leaderboard.html', 'w') as file:
        file.write(html_content)
    print("leaderboard.html generated successfully.")

def run_accessibility_sub_agent():
    """Calls the accessibility check sub-agent."""
    print("\n--- Calling Accessibility Sub-Agent ---")
    try:
        subprocess.run(
            ['python3', 'check_accessibility.py', 'dist'],
            check=True
        )
    except FileNotFoundError:
        print("Error: 'python3' command not found. Please ensure Python 3 is installed and in your PATH.")
    except subprocess.CalledProcessError:
        # The sub-agent will have already printed the errors.
        # We exit here to ensure the build process is marked as failed.
        print("\n--- Accessibility Sub-Agent finished with errors. ---")
        exit(1)
    print("\n--- Accessibility Sub-Agent finished successfully. ---")


if __name__ == "__main__":
    main()
    generate_leaderboard_page()
    cp_assets()
    run_accessibility_sub_agent()
    print("Build completed successfully!")
