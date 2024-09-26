import { createAppAuth } from "https://esm.sh/@octokit/auth-app";
import { Octokit } from "https://esm.sh/@octokit/core";

window.octokit = null;

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
        window.octokit = null;
      }
    }
  }

window.addEventListener("DOMContentLoaded", async () => {
    authorize();

    const cornerPostLink = document.getElementById('cornerPostLink');
    if (octokit) {
        cornerPostLink.classList.add('showWhenLoggedIn');
    } else {
        cornerPostLink.classList.remove('showWhenLoggedIn');
    }
});