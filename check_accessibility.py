"""
Accessibility Check Sub-Agent

This script acts as a dedicated sub-agent for auditing web accessibility.
It uses the '@axe-core/cli' tool to scan a directory of HTML files for
WCAG (Web Content Accessibility Guidelines) compliance issues.

Purpose:
- To be called by a primary build script or a CI/CD pipeline after
  HTML files have been generated.
- To provide clear, actionable feedback on accessibility violations.
- To act as a quality gate by exiting with a non-zero status code if
  any violations are found, causing the overall build process to fail.

Usage:
    python3 check_accessibility.py <directory_to_scan>

Example:
    python3 check_accessibility.py dist

Dependencies:
- Node.js and npm must be installed.
- The '@axe-core/cli' package must be installed via npm in the project
  (e.g., `npm install @axe-core/cli --save-dev`).
"""
import subprocess
import glob
import sys
import os

def run_accessibility_check(target_directory):
    """Runs axe-cli on all HTML files in the specified directory."""
    print("\nRunning accessibility check...")
    html_files = glob.glob(f'{target_directory}/*.html')
    if not html_files:
        print(f"No HTML files found in '{target_directory}'. Skipping check.")
        return

    all_checks_passed = True
    for html_file in html_files:
        absolute_path = os.path.abspath(html_file)
        file_uri = f'file://{absolute_path}'
        print(f"Checking {file_uri}...")
        try:
            # We don't use check=True because axe-cli returns a non-zero exit code when issues are found.
            # Instead, we'll check the exit code manually.
            result = subprocess.run(
                ['npx', 'axe', file_uri, '--exit'],
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                print(f"Accessibility issues found in {html_file}:")
                print(result.stdout)
                print(result.stderr)
                all_checks_passed = False
            else:
                print(f"{html_file} passed.")

        except FileNotFoundError:
            print("Error: 'npx' command not found. Please ensure Node.js is installed and in your PATH.")
            sys.exit(1)
        except Exception as e:
            print(f"An unexpected error occurred while checking {html_file}: {e}")
            all_checks_passed = False

    if all_checks_passed:
        print("\nAll accessibility checks passed!")
    else:
        print("\nSome accessibility checks failed. Please review the output above.")
        # Exit with a non-zero code to indicate failure, useful for CI/CD
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        directory = sys.argv[1]
        run_accessibility_check(directory)
    else:
        print("Usage: python check_accessibility.py <directory>")
        sys.exit(1)
