# Setting Up This Repository as a Template

This guide explains how to enable the template repository feature on GitHub.

## Instructions for Repository Owner

1. Go to your repository on GitHub
2. Click on the "Settings" tab near the top of the page
3. Scroll down to the "Template repository" section
4. Check the box labeled "Template repository"
5. That's it! Your repository is now a template

![Template Repository Setting](https://docs.github.com/assets/cb-95207/mw-1440/images/help/repository/template-repository-checkbox.webp)

## Verifying the Setup

Once enabled, you should see:

1. A "Use this template" button near the top of your repository page (replacing the normal "Clone or download" button)
2. The GitHub workflow in `.github/workflows/add-owner.yml` will automatically run when someone creates a new repository from your template

## Limitations and Considerations

- GitHub's template feature only works for repositories you own (not forks)
- The workflow to add you as a collaborator requires GitHub API access, which is provided by the default `GITHUB_TOKEN`
- The workflow uses the `actions/github-script` action which is maintained by GitHub and should remain stable

## Troubleshooting

If the automatic collaborator addition isn't working:

1. Check that your repository is properly set as a template
2. Verify that the GitHub username in the workflow file is correct
3. Ensure the workflow file is in the correct location (`.github/workflows/add-owner.yml`)
4. Check the Actions tab in repositories created from your template to see if there are any workflow errors 

## About the GITHUB_TOKEN

The `GITHUB_TOKEN` used in the workflow is automatically provided by GitHub Actions and does not require any manual setup. It has the following characteristics:

- It's automatically created when a GitHub Action runs
- It has limited permissions scoped to the repository where the action is running
- It expires after the job completes
- It's provided as a secret and is automatically authenticated

However, there is one important limitation: the default `GITHUB_TOKEN` cannot add users as collaborators by default due to security restrictions. To enable this functionality, you need to:

1. Go to your repository on GitHub
2. Navigate to Settings > Actions > General
3. Scroll down to "Workflow permissions"
4. Select "Read and write permissions"
5. Check "Allow GitHub Actions to create and approve pull requests"
6. Click "Save"

This configuration will allow the workflow to add collaborators to repositories created from your template.

## Complete Setup Checklist

After adding all the files to your repository, follow these steps to ensure everything works:

1. Push all changes to GitHub:
   - `.github/workflows/add-owner.yml`
   - `.github/template-info.md`
   - Updated `README.md`
   - `TEMPLATE_SETUP.md`

2. Enable template repository feature:
   - Go to repository Settings
   - Check "Template repository" box

3. Configure workflow permissions:
   - Go to Settings > Actions > General
   - Enable "Read and write permissions" for workflows
   - Save the changes

4. Test the setup:
   - Create a new repository using your template
   - Check if you've been added as a collaborator
   - Verify that an issue was created in the new repository 