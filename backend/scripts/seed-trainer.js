require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const username = "trainer1";
  const password = "password123";

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`Trainer user "${username}" already exists. Nothing to do.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: "TRAINER",
    },
  });

  console.log("Created trainer user:");
  console.log({
    id: user.id,
    username,
    password,
    role: user.role,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

