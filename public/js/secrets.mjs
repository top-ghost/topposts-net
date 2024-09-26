window.currentPost = {};

window.addEventListener("DOMContentLoaded", async () => {
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
