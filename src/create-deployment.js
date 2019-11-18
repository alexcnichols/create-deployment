const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');

async function run() {
  try {
    // Get authenticated GitHub client
    const github = new GitHub(process.env.GITHUB_TOKEN);

    // Get owner, repo, and ref from context of payload that triggered the action
    const { owner, repo } = context.repo;
    const { ref } = context;

    // Get the inputs from the workflow file
    const environment = core.getInput('environment', { required: false });

    // Create a deployment
    // API Documentation: https://developer.github.com/v3/repos/deployments/#create-a-deployment
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-create-deployment
    const createDeploymentResponse = await github.repos.createDeployment({
      owner,
      repo,
      ref,
      required_contexts: [],
      environment
    });

    // Get the ID for the created Deployment from the response
    const {
      data: { id: deploymentId }
    } = createDeploymentResponse;

    // Set the output variables for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    core.setOutput('id', deploymentId);
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
