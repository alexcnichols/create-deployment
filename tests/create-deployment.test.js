jest.mock('@actions/core');
jest.mock('@actions/github');

const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');
const run = require('../src/create-deployment.js');

/* eslint-disable no-undef */
describe('Create Deployment', () => {
  let createDeployment;

  beforeEach(() => {
    createDeployment = jest.fn().mockReturnValueOnce({
      data: {
        id: 'deploymentId'
      }
    });

    context.repo = {
      owner: 'owner',
      repo: 'repo'
    };

    context.ref = 'ref';

    const github = {
      repos: {
        createDeployment
      }
    };

    GitHub.mockImplementation(() => github);
  });

  test('Create deployment endpoint is called', async () => {
    core.getInput = jest.fn();

    await run();

    expect(createDeployment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'ref',
      required_contexts: []
    });
  });

  test('Create deployment with environment input is called', async () => {
    core.getInput = jest.fn().mockReturnValueOnce('myEnvironment');

    await run();

    expect(createDeployment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'ref',
      required_contexts: [],
      environment: 'myEnvironment'
    });
  });

  test('Outputs are set', async () => {
    core.getInput = jest.fn().mockReturnValueOnce('myEnvironment');

    core.setOutput = jest.fn();

    await run();

    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'id', 'deploymentId');
  });

  test('Action fails elegantly', async () => {
    core.getInput = jest.fn().mockReturnValueOnce('myEnvironment');

    createDeployment.mockRestore();
    createDeployment.mockImplementation(() => {
      throw new Error('Error creating deployment');
    });

    core.setOutput = jest.fn();

    core.setFailed = jest.fn();

    await run();

    expect(createDeployment).toHaveBeenCalled();
    expect(core.setFailed).toHaveBeenCalledWith('Error creating deployment');
    expect(core.setOutput).toHaveBeenCalledTimes(0);
  });
});
