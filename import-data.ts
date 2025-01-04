// const { PrismaClient } = require("@prisma/client");
// const fs = require("fs");

// const prisma = new PrismaClient();

// async function main() {
//   try {
//     // Read the JSON file
//     const data = fs.readFileSync("blog-posts-export.json", "utf8");
//     const blogPosts = JSON.parse(data);

//     // Import each blog post
//     for (const post of blogPosts) {
//       await prisma.blogPost.upsert({
//         where: { slug: post.slug },
//         update: post,
//         create: post,
//       });
//     }

//     console.log("Data imported successfully");
//   } catch (error) {
//     console.error("Error importing data:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();
