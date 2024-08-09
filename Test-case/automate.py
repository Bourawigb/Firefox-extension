from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.common.exceptions import WebDriverException
import time

# Path to the Firefox profile with your temporary extension installed
#firefox_profile_path = r'C:\\Users\\boura\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\9u7ww9zy.dev-edition-default'

# Path to the geckodriver executable
#geckodriver_path = r'C:\\Users\\boura\\OneDrive\\Documents\\geckodriver.exe'

# Function to read links from a text file
def read_links(file_path):
    with open(file_path, 'r') as file:
        return file.read().splitlines()

def format_link(link):
    if not link.startswith(('http://', 'https://')):
        return 'http://' + link
    return link

# Main function to open links in Firefox
def open_links_in_firefox(links, firefox_profile_path, geckodriver_path):
    # Set up Firefox options with the profile
    options = Options()
    options.profile = firefox_profile_path

    # Start Firefox with the specified profile
    service = Service(executable_path=geckodriver_path)
    driver = webdriver.Firefox(service=service, options=options)

    for link in links:
        link = format_link(link)
        try:
            driver.get(link)
            time.sleep(15)  # Wait for 15 seconds
        except WebDriverException as e:
            print(f"Error loading {link}: {e}")
            continue  # Skip to the next link

    # Close the browser window
    driver.quit()

if __name__ == "__main__":
    # Ask user for the file path to the links list
    links_file_path = input("Enter the path to the links list file: ")

    # Ask user for the Firefox profile path
    firefox_profile_path = input("Enter the path to the Firefox profile: ")

    # Ask user for the geckodriver path
    geckodriver_path = input("Enter the path to the geckodriver executable: ")

    # Read links from the specified file
    links = read_links(links_file_path)

    # Open links in Firefox using the specified profile and geckodriver
    open_links_in_firefox(links, firefox_profile_path, geckodriver_path)


#if __name__ == "__main__":
#   links = read_links(r'C:\\Users\\boura\\OneDrive\\Documents\\GitHub\\projet backend\\Firefox-extension\\Test-case\\tranco-top-1M.txt')  # Use raw string for the file path
#    open_links_in_firefox(links)
