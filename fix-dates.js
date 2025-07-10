// @ts-check
const { readdir, readFile, writeFile } = require("fs/promises");
const matter = require("gray-matter");
const { stringify } = require("yaml");

const directory = "./content/post"

async function updateFrontMatter(filename) {
  const filepath = `${directory}/${filename}`;

  const { data: frontMatter, content } = matter(await readFile(filepath));


  if (frontMatter.timestamp !== undefined) {
	frontMatter.date = new Date(frontMatter.timestamp).toISOString().replace(/\.\d+/, "");
  	delete frontMatter["timestamp"];
  }

  const newContent = `---json\n${JSON.stringify(frontMatter)}\n---\n${content}`;

  await writeFile(filepath, newContent);

  console.log(`- [x] ${filepath}`);
}

async function main() {
  const filenames = await readdir(directory);
  const markdownFilenames = filenames.filter((f) => f.endsWith(".md"));

  await Promise.all(markdownFilenames.map(updateFrontMatter));
}

main().catch(console.error);
