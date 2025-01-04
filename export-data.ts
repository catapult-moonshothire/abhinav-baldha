const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

async function main() {
  const blogPosts = await prisma.blogPost.findMany();
  fs.writeFileSync(
    "blog-posts-export.json",
    JSON.stringify(blogPosts, null, 2)
  );
  console.log("Data exported to blog-posts-export.json");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
