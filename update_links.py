import os

def replace_links(directory):
    old_link = 'data-cal-link="kidaflow-automations/quick-discovery-website-form"'
    new_link = 'data-cal-link="kidaflow-automations/quick-discovery-website-linkedin"'
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if old_link in content:
                    print(f"Updating {path}")
                    new_content = content.replace(old_link, new_link)
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)

if __name__ == "__main__":
    replace_links('c:/Users/User/Documents/AntiG projects/customer success v3/customer success')
