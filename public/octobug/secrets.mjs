import { createAppAuth } from "https://esm.sh/@octokit/auth-app";
import { Octokit } from "https://esm.sh/@octokit/core";

window.octokit = null;
window.currentPost = {};

function authorize() {
  const privateKey = localStorage.getItem("githubPrivateKey");

  if (!!privateKey) {
    try {
      window.octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: localStorage.getItem("githubAppId"),
          privateKey: localStorage.getItem("githubPrivateKey"),
          installationId: localStorage.getItem("githubAppInstallationId")
        },
      });

      console.log(`done: ${JSON.stringify(octokit)}`);
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  authorize();

  window.secretInputs = {};
  window.secretFields = ['githubPrivateKey', 'githubAppId', 'githubAppInstallationId', 'githubRepoUrl', 'postAuthor']
  
  window.secretFields.forEach((fieldName) => {
    window.secretInputs[fieldName] = document.getElementById(`${fieldName}Input`);
  })
  
  const secretsUpdate = document.getElementById("secretsUpdateButton")

  secretsUpdate.addEventListener("click", async (e) => {
    e.preventDefault();

    window.secretFields.forEach((fieldName) => {
      switch (fieldName) {
        case 'githubRepoUrl':
          const [_, githubRepoOwner, githubRepoName] = window.secretInputs['githubRepoUrl']?.value?.match(/^https?\:\/\/github\.com\/([^\/]+)\/(.+)$/)
          localStorage.setItem('githubRepoOwner', githubRepoOwner);
          localStorage.setItem('githubRepoName', githubRepoName);
          break;
        default:
          localStorage.setItem(fieldName, window.secretInputs[fieldName]?.value);
      }
      
    })

    authorize();
  });
});
