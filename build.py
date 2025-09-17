import yaml
import os
from jinja2 import Environment, FileSystemLoader
import markdown # Import the markdown library

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

def main():
    """Generates the website."""
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
        with open(module['html_file'], 'w') as file:
            file.write(html_content)
        print(f"{module['html_file']} generated successfully.")

    # Generate index page
    template = env.get_template('index.html.j2')
    html_content = template.render(modules=modules)
    with open('index.html', 'w') as file:
        file.write(html_content)
    print("index.html generated successfully.")

    # Generate final score page
    template = env.get_template('final-score.html.j2')
    html_content = template.render()
    with open('final-score.html', 'w') as file:
        file.write(html_content)
    print("final-score.html generated successfully.")

def generate_leaderboard_page():
    """Generates the leaderboard.html page."""
    env = Environment(loader=FileSystemLoader('.'))
    template = env.get_template('leaderboard.html.j2')
    html_content = template.render()
    with open('leaderboard.html', 'w') as file:
        file.write(html_content)
    print("leaderboard.html generated successfully.")

if __name__ == "__main__":
    main()
    generate_leaderboard_page()